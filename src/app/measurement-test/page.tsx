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
      const bleDevice = await navigator.bluetooth.requestDevice({
        filters: [{ services: [0x181d] }],
      });

      setDevice(bleDevice);

      bleDevice.addEventListener('gattserverdisconnected', () => {
        setIsConnected(false);
        setWeight('--');
        setBatteryLevel('--');
      });

      const server = await bleDevice.gatt.connect();
      const service = await server.getPrimaryService(0x181d);
      const weightCharacteristic = await service.getCharacteristic(0x2a9d);

      weightCharacteristic.addEventListener('characteristicvaluechanged', (event: Event) => {
        const target = event.target as unknown as BluetoothRemoteGATTCharacteristic;
        if (target && target.value) {
          const weightValue = target.value.getUint16(1, true) / 200;
          setWeight(weightValue.toFixed(1));
        }
      });

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

      await weightCharacteristic.startNotifications();
      setIsConnected(true);
    } catch (error) {
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
    if (weight === '--') return '';
    const weightNum = parseFloat(weight);
    if (weightNum < 0.9 * targetWeight) return 'text-info';
    if (weightNum > 1.1 * targetWeight) return 'text-error';
    return 'text-success';
  };

  return (
    <div className="min-h-screen bg-base-200 pb-16">
      {/* Header */}
      <div className="navbar bg-base-100 shadow-md sticky top-0 z-10">
        <div className="navbar-start">
          <Link href="/" className="btn btn-circle btn-ghost">
            <ArrowLeftIcon className="h-5 w-5" />
          </Link>
        </div>
        <div className="navbar-center">
          <h1 className="text-xl font-bold">Force Measurement</h1>
        </div>
        <div className="navbar-end"></div>
      </div>

      <div className="container mx-auto px-4 pt-6">
        <div className="max-w-lg mx-auto">
          {/* Target Weight Input Card */}
          <div className="card bg-base-100 shadow-lg mb-6">
            <div className="card-body">
              <h2 className="card-title text-primary">Target Weight</h2>
              <div className="flex items-center">
                <input
                  type="number"
                  value={targetWeight}
                  onChange={e => setTargetWeight(Number(e.target.value))}
                  className="input input-bordered w-full max-w-xs mr-2"
                  min="1"
                  max="200"
                />
                <span>kg</span>
              </div>
            </div>
          </div>

          {/* Weight Display Card */}
          <div className="card bg-base-100 shadow-lg mb-6">
            <div className="card-body items-center text-center">
              <h2 className="card-title text-primary">Current Measurement</h2>

              <div className={`text-5xl font-bold my-4 ${getWeightColor()}`}>
                {weight} <span className="text-2xl">kg</span>
              </div>

              <div className="flex items-center mb-2">
                <div
                  className={`badge mr-2 ${isConnected ? 'badge-success' : 'badge-error'}`}
                ></div>
                <span>{isConnected ? 'Connected' : 'Disconnected'}</span>
              </div>

              <div className="mb-4">Battery: {batteryLevel}</div>

              <button
                onClick={isConnected ? disconnectFromScale : connectToScale}
                className={`btn btn-block ${isConnected ? 'btn-error' : 'btn-primary'}`}
              >
                {isConnected ? 'Disconnect Device' : 'Connect to ForceGrip'}
              </button>
            </div>
          </div>

          {/* Instructions Card */}
          <div className="card bg-base-100 shadow-lg">
            <div className="card-body">
              <h2 className="card-title text-primary">Instructions</h2>
              <ol className="list-decimal ml-5 space-y-2">
                <li>Click &ldquo;Connect to ForceGrip&rdquo; to pair with your device</li>
                <li>Set your target weight</li>
                <li>Use the grip sensor to measure your force output</li>
                <li>The measurement will update in real-time</li>
              </ol>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
