'use client';

import { useState } from 'react';

export default function WeightMeasurementPage() {
    const [device, setDevice] = useState(null);
    const [weight, setWeight] = useState('--');
    const [batteryLevel, setBatteryLevel] = useState('--');
    const [isConnected, setIsConnected] = useState(false);
    const [targetWeight, setTargetWeight] = useState(50);

    // Connect to BLE device
    const connectToScale = async () => {
        try {
            console.log('Requesting Bluetooth device with weight scale service...');
            const bleDevice = await navigator.bluetooth.requestDevice({
                filters: [{ services: [0x181d] }]
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
            weightCharacteristic.addEventListener('characteristicvaluechanged', (event : any) => {
                const value = event.target.value;
                const weightValue = value.getUint16(1, true) / 200; // Adjust based on your device's data format
                setWeight(weightValue.toFixed(1));
            });

            try {
                console.log('Getting battery level characteristic...');
                const batteryCharacteristic = await service.getCharacteristic(0x2a19);

                console.log('Subscribing to battery notifications...');
                batteryCharacteristic.addEventListener('characteristicvaluechanged', (event : any) => {
                    const value = event.target.value;
                    const battery = value.getUint8(0);
                    setBatteryLevel(`${battery}%`);
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
            alert(`Connection failed: ${error.message}`);
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
        if (weight === '--') return 'inherit';
        const weightNum = parseFloat(weight);
        if (weightNum < 0.9 * targetWeight) return 'blue';
        if (weightNum > 1.1 * targetWeight) return 'red';
        return 'green';
    };

    return (
        <div className="container mx-auto p-4">
            <h1 className="text-2xl font-bold mb-6">BLE Weight Measurement</h1>

            <div className="mb-6">
                <label className="block mb-2">
                    Target Weight:
                    <input
                        type="number"
                        value={targetWeight}
                        onChange={(e) => setTargetWeight(Number(e.target.value))}
                        className="ml-2 p-1 border rounded"
                    /> kg
                </label>
            </div>

            <div className="p-4 border rounded shadow">
                <h2 className="text-xl font-semibold mb-4">Device Connection</h2>

                <div className="mb-4">
                    <p className="mb-2">Weight: <span style={{ color: getWeightColor() }}>{weight} kg</span></p>
                    <p>Battery: {batteryLevel}</p>
                </div>

                <button
                    onClick={isConnected ? disconnectFromScale : connectToScale}
                    className={`px-4 py-2 rounded ${isConnected ? 'bg-red-500' : 'bg-blue-500'} text-white`}
                >
                    {isConnected ? 'Disconnect' : 'Connect to ForceGrip'}
                </button>
            </div>
        </div>
    );
}