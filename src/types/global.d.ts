// global.d.ts
interface Navigator {
    bluetooth: {
        requestDevice(options: RequestDeviceOptions): Promise<BluetoothDevice>;
    };
}

interface BluetoothDevice {
    gatt: {
        connect(): Promise<BluetoothRemoteGATTServer>;
        connected: boolean;
        disconnect(): void;
    };
    addEventListener(type: string, listener: EventListenerOrEventListenerObject): void;
    removeEventListener(type: string, listener: EventListenerOrEventListenerObject): void;
}

interface BluetoothRemoteGATTServer {
    getPrimaryService(service: BluetoothServiceUUID): Promise<BluetoothRemoteGATTService>;
}

interface BluetoothRemoteGATTService {
    getCharacteristic(characteristic: BluetoothCharacteristicUUID): Promise<BluetoothRemoteGATTCharacteristic>;
}

interface BluetoothRemoteGATTCharacteristic {
    value: DataView;
    startNotifications(): Promise<void>;
    addEventListener(event: string, callback: (event: Event) => void): void;
}

type BluetoothServiceUUID = number | string;
type BluetoothCharacteristicUUID = number | string;
type RequestDeviceOptions = {
    filters: Array<{ services: BluetoothServiceUUID[] }>;
}

interface Event {
    target: EventTarget | null;
}

interface EventTarget {
    value?: DataView;
}