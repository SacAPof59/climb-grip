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
  getCharacteristic(
    characteristic: BluetoothCharacteristicUUID
  ): Promise<BluetoothRemoteGATTCharacteristic>;
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
};

interface Event {
  target: EventTarget | null;
}

interface EventTarget {
  value?: DataView;
}

// Timer types
type TimerExercise = {
  id: string;
  name: string;
  duration: number;
  restDuration: number;
  repetition: number;
};

type TimerStep = {
  id: string;
  name: string;
  restDuration: number;
  repetition: number;
  exercises: TimerExercise[];
};

type Timer = {
  id: string;
  name: string;
  steps: TimerStep[];
  createdAt?: string;
  updatedAt?: string;
  userId?: string;
  duration?: string;
  totalSeconds?: number;
};

// Phase types
type TimerPhaseType = 'exercise' | 'exerciseRest' | 'stepRest';

type Phase = {
  type: PhaseType;
  stepIndex: number;
  exerciseIndex: number;
  repetition: number;
  exerciseRepetition: number;
  duration: number;
  name: string;
};

interface WorkoutTypeSequence {
  workoutName: string;
  sequence: number;
  sequenceType: 'EFFORT' | 'REST';
  duration: number;
  instruction?: string | null;
  recordForce: boolean;
}

interface WorkoutType {
  name: string;
  description: string | null;
  workoutTypeSequences: WorkoutTypeSequence[];
  isMaxIsoFS: boolean;
  isCriticalForce: boolean;
}

interface MeasuredData {
  sequence: number;
  iteration: number;
  weight: number;
  timestamp: number; // milliseconds since recording started
}
