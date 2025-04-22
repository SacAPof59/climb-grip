// src/app/components/workout/WorkoutDeviceConnectionComponent.tsx
'use client';

import { useState, useEffect, useCallback, useRef } from 'react';

interface WorkoutDeviceConnectionComponentProps {
  checkDeviceConnection: (isDeviceConnected: boolean) => void;
  onWeightChange: (weight: string) => void;
}

export default function WorkoutDeviceConnectionComponent({
  checkDeviceConnection,
  onWeightChange,
}: WorkoutDeviceConnectionComponentProps) {
  const [device, setDevice] = useState<BluetoothDevice | null>(null);
  const [batteryLevel, setBatteryLevel] = useState('--');
  const [isConnected, setIsConnected] = useState(false);
  const serverRef = useRef<BluetoothRemoteGATTServer | null>(null);

  // Update parent component when connection status changes
  useEffect(() => {
    checkDeviceConnection(isConnected);
  }, [isConnected, checkDeviceConnection]);

  // Create refs for the functions to break the dependency cycle
  const setupWeightMeasurementRef =
    useRef<(service: BluetoothRemoteGATTService) => Promise<void>>(null);

  // Define setupWeightMeasurement first
  const setupWeightMeasurement = useCallback(
    async (service: BluetoothRemoteGATTService) => {
      try {
        const weightCharacteristic = await service.getCharacteristic(0x2a9d);

        const handleWeightChange = (event: Event) => {
          const target = event.target as { value?: DataView };
          if (target && target.value) {
            const weightValue = target.value.getUint16(1, true) / 200;
            const formattedWeight = weightValue.toFixed(1);
            onWeightChange(formattedWeight);
          }
        };

        weightCharacteristic.addEventListener('characteristicvaluechanged', handleWeightChange);
        await weightCharacteristic.startNotifications();
        console.log('Weight notifications started successfully');
      } catch (error) {
        console.error('Error setting up weight measurement:', error);
        onWeightChange('--');
      }
    },
    [onWeightChange]
  );

  // Store the function in the ref
  useEffect(() => {
    setupWeightMeasurementRef.current = setupWeightMeasurement;
  }, [setupWeightMeasurement]);

  const attemptReconnect = useCallback(async () => {
    if (!device || !device.gatt) return;

    try {
      console.log('Attempting to reconnect...');
      const server = await device.gatt.connect();
      serverRef.current = server;

      const service = await server.getPrimaryService(0x181d);

      // Use the ref to access the function
      if (setupWeightMeasurementRef.current) {
        await setupWeightMeasurementRef.current(service);
      } else {
        console.error('Weight measurement function not initialized');
      }

      // Setup battery measurements
      try {
        const batteryCharacteristic = await service.getCharacteristic(0x2a19);
        await batteryCharacteristic.startNotifications();

        batteryCharacteristic.addEventListener('characteristicvaluechanged', (event: Event) => {
          const target = event.target as unknown as BluetoothRemoteGATTCharacteristic;
          if (target && target.value) {
            const battery = target.value.getUint8(0);
            setBatteryLevel(`${battery}%`);
          }
        });
      } catch {}
      setBatteryLevel('N/A');

      setIsConnected(true);
      console.log('Reconnection successful');
    } catch (err) {
      console.error('Reconnection failed:', err);
    }
  }, [device]);

  // Handle disconnection event
  const handleDisconnection = useCallback(() => {
    console.log('Device disconnected');
    setIsConnected(false);
    setBatteryLevel('--');
    onWeightChange('--');

    // Attempt to reconnect
    attemptReconnect();
  }, [onWeightChange, attemptReconnect]);

  // Connect to BLE device
  const connectToScale = async () => {
    try {
      const bleDevice = await navigator.bluetooth.requestDevice({
        filters: [{ services: [0x181d] }],
      });

      // Setup disconnect listener immediately
      bleDevice.addEventListener('gattserverdisconnected', handleDisconnection);

      setDevice(bleDevice);

      const server = await bleDevice.gatt.connect();
      serverRef.current = server;

      const service = await server.getPrimaryService(0x181d);

      // Setup weight measurements
      await setupWeightMeasurement(service);

      // Setup battery measurements
      try {
        const batteryCharacteristic = await service.getCharacteristic(0x2a19);
        await batteryCharacteristic.startNotifications();

        batteryCharacteristic.addEventListener('characteristicvaluechanged', (event: Event) => {
          const target = event.target as unknown as BluetoothRemoteGATTCharacteristic;
          if (target && target.value) {
            const battery = target.value.getUint8(0);
            setBatteryLevel(`${battery}%`);
          }
        });
      } catch {}
      setBatteryLevel('N/A');

      setIsConnected(true);
    } catch (error) {
      alert(`Connection failed: ${(error as Error).message}`);
    }
  };

  // Disconnect from device
  const disconnectFromScale = useCallback(() => {
    if (device && device.gatt && device.gatt.connected) {
      device.gatt.disconnect();
    }

    // Clean up event listener
    if (device) {
      device.removeEventListener('gattserverdisconnected', handleDisconnection);
    }

    setIsConnected(false);
    setBatteryLevel('--');
    onWeightChange('--');
    setDevice(null);
    serverRef.current = null;
  }, [device, handleDisconnection, onWeightChange]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (isConnected) {
        if (device && device.gatt && device.gatt.connected) {
          device.gatt.disconnect();
        }

        if (device) {
          device.removeEventListener('gattserverdisconnected', handleDisconnection);
        }
      }
    };
  }, [device, handleDisconnection, isConnected]);

  return (
    <div className="w-full bg-base-100 shadow-sm p-3">
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <div className={`badge ${isConnected ? 'badge-success' : 'badge-error'}`}></div>
          <span className="font-medium">ForceGrip</span>
          {isConnected && (
            <span className="text-sm text-base-content/70">Battery: {batteryLevel}</span>
          )}
        </div>

        <button
          onClick={isConnected ? disconnectFromScale : connectToScale}
          className={`btn btn-sm ${isConnected ? 'btn-error' : 'btn-primary'}`}
        >
          {isConnected ? 'Disconnect' : 'Connect to ForceGrip'}
        </button>
      </div>
    </div>
  );
}
