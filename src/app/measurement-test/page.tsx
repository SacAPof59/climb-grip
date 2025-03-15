'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeftIcon } from 'lucide-react';

export default function WeightMeasurementPage() {
  const [device, setDevice] = useState<BluetoothDevice | null>(null);
  const [weight, setWeight] = useState('--');
  const [batteryLevel, setBatteryLevel] = useState('--');
  const [isConnected, setIsConnected] = useState(false);
  const [targetWeight, setTargetWeight] = useState(50);

  // Connect to BLE device
  const connectToScale = async () => {
    try {
      console.log('Requesting Bluetooth device with weight scale service...');
      const bleDevice = await navigator.bluetooth.requestDevice({
        filters: [{ services: [0x181d] }],
      });

      setDevice(bleDevice);

      bleDevice.addEventListener('gattserverdisconnected', () => {
        console.log('Device disconnected');
        setIsConnected(false);
        setWeight('--');
        setBatteryLevel('--');
      });

      console.log('Connecting to GATT server...');
      const server = await bleDevice.gatt.connect();

      console.log('Getting weight scale service...');
      const service = await server.getPrimaryService(0x181d);

      console.log('Getting weight measurement characteristic...');
      const weightCharacteristic = await service.getCharacteristic(0x2a9d);

      console.log('Subscribing to weight notifications...');
      weightCharacteristic.addEventListener('characteristicvaluechanged', (event: Event) => {
        const target = event.target as unknown as BluetoothRemoteGATTCharacteristic;
        if (target && target.value) {
          const weightValue = target.value.getUint16(1, true) / 200;
          setWeight(weightValue.toFixed(1));
        }
      });

      try {
        console.log('Getting battery level characteristic...');
        const batteryCharacteristic = await service.getCharacteristic(0x2a19);

        console.log('Subscribing to battery notifications...');
        batteryCharacteristic.addEventListener('characteristicvaluechanged', (event: Event) => {
          const target = event.target as unknown as BluetoothRemoteGATTCharacteristic;
          if (target && target.value) {
            const battery = target.value.getUint8(0);
            setBatteryLevel(`${battery}%`);
          }
        });

        await batteryCharacteristic.startNotifications();
      } catch (batteryError) {
        console.warn('Battery service not available:', batteryError);
        setBatteryLevel('N/A');
      }

      await weightCharacteristic.startNotifications();

      setIsConnected(true);
      console.log('Notifications started');
    } catch (error) {
      console.error('Error connecting to device:', error);
      alert(`Connection failed: ${(error as Error).message}`);
    }
  };

  // Disconnect from device
  const disconnectFromScale = () => {
    if (device && device.gatt.connected) {
      device.gatt.disconnect();
    }
    setIsConnected(false);
    setWeight('--');
    setBatteryLevel('--');
  };

  // Get weight display color based on target
  const getWeightColor = () => {
    if (weight === '--') return 'text-white';
    const weightNum = parseFloat(weight);
    if (weightNum < 0.9 * targetWeight) return 'text-blue-400';
    if (weightNum > 1.1 * targetWeight) return 'text-red-400';
    return 'text-green-400';
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-700 text-white px-4 py-6">
      <div className="max-w-md mx-auto">
        {/* Header with back button */}
        <div className="flex items-center mb-8">
          <Link
            href="/"
            className="mr-3 p-2 rounded-full hover:bg-slate-600 transition-colors"
            aria-label="Back to main page"
          >
            <ArrowLeftIcon className="h-5 w-5" />
          </Link>
          <h1 className="text-2xl font-bold">Force Measurement</h1>
        </div>

        {/* Target Weight Input Card */}
        <div className="bg-slate-800 rounded-lg p-6 shadow-lg mb-6">
          <h2 className="text-lg font-medium text-blue-400 mb-4">Target Weight</h2>
          <div className="flex items-center">
            <input
              type="number"
              value={targetWeight}
              onChange={e => setTargetWeight(Number(e.target.value))}
              className="bg-slate-700 text-white px-4 py-2 rounded-md flex-grow mr-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              min="1"
              max="200"
            />
            <span className="text-gray-300">kg</span>
          </div>
        </div>

        {/* Weight Display Card */}
        <div className="bg-slate-800 rounded-lg p-6 shadow-lg mb-6">
          <h2 className="text-lg font-medium text-blue-400 mb-4">Current Measurement</h2>

          <div className="flex flex-col items-center mb-6">
            <div className={`text-5xl font-bold mb-2 ${getWeightColor()}`}>
              {weight} <span className="text-2xl">kg</span>
            </div>

            <div className="mt-4 flex items-center">
              <div className="w-3 h-3 rounded-full mr-2 bg-slate-600">
                <div
                  className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}
                />
              </div>
              <span className="text-gray-300">{isConnected ? 'Connected' : 'Disconnected'}</span>
            </div>

            <div className="mt-2 text-gray-300">Battery: {batteryLevel}</div>
          </div>

          <button
            onClick={isConnected ? disconnectFromScale : connectToScale}
            className={`w-full py-3 px-4 rounded-lg transition-colors font-medium ${
              isConnected ? 'bg-red-600 hover:bg-red-700' : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            {isConnected ? 'Disconnect Device' : 'Connect to ForceGrip'}
          </button>
        </div>

        {/* Instructions Card */}
        <div className="bg-slate-800 rounded-lg p-6 shadow-lg">
          <h2 className="text-lg font-medium text-blue-400 mb-4">Instructions</h2>
          <ol className="list-decimal ml-5 text-gray-300 space-y-2">
            <li>Click &ldquo;Connect to ForceGrip&rdquo; to pair with your device</li>
            <li>Set your target weight</li>
            <li>Use the grip sensor to measure your force output</li>
            <li>The measurement will update in real-time</li>
          </ol>
        </div>
      </div>
    </div>
  );
}
