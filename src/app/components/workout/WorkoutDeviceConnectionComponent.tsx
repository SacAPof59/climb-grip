// src/app/components/workout/WorkoutDeviceConnectionComponent.tsx
'use client';

import { useState, useEffect, useCallback } from 'react';

interface WorkoutDeviceConnectionComponentProps {
  onDeviceChange: (device: BluetoothDevice | null) => void;
  required: boolean;
}

export default function WorkoutDeviceConnectionComponent({
  onDeviceChange,
  required
}: WorkoutDeviceConnectionComponentProps) {
  const [device, setDevice] = useState<BluetoothDevice | null>(null);
  const [batteryLevel, setBatteryLevel] = useState('--');
  const [isConnected, setIsConnected] = useState(false);

  // Connect to BLE device
  const connectToScale = async () => {
    try {
      const bleDevice = await navigator.bluetooth.requestDevice({
        filters: [{ services: [0x181d] }],
      });

      setDevice(bleDevice);
      onDeviceChange(bleDevice);

      bleDevice.addEventListener('gattserverdisconnected', () => {
        setIsConnected(false);
        setBatteryLevel('--');
        onDeviceChange(null);
      });

      const server = await bleDevice.gatt.connect();
      const service = await server.getPrimaryService(0x181d);

      try {
        const batteryCharacteristic = await service.getCharacteristic(0x2a19);

        batteryCharacteristic.addEventListener('characteristicvaluechanged', (event: Event) => {
          const target = event.target as unknown as BluetoothRemoteGATTCharacteristic;
          if (target && target.value) {
            const battery = target.value.getUint8(0);
            setBatteryLevel(`${battery}%`);
          }
        });

        await batteryCharacteristic.startNotifications();
      } catch (_) {
        setBatteryLevel('N/A');
        console.error(_);
      }

      setIsConnected(true);
    } catch (error) {
      alert(`Connection failed: ${(error as Error).message}`);
    }
  };

  // Disconnect from device
  const disconnectFromScale = useCallback(() => {
    if (device && device.gatt.connected) {
      device.gatt.disconnect();
    }
    setIsConnected(false);
    setBatteryLevel('--');
    onDeviceChange(null);
  }, [device, onDeviceChange]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      disconnectFromScale();
    };
  }, [disconnectFromScale]);

  if (!required) {
    return null;
  }

  return (
    <div className="w-full bg-base-100 shadow-sm mb-4 p-3">
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <div className={`badge ${isConnected ? 'badge-success' : 'badge-error'}`}></div>
          <span className="font-medium">ForceGrip</span>
          {isConnected && <span className="text-sm text-base-content/70">Battery: {batteryLevel}</span>}
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