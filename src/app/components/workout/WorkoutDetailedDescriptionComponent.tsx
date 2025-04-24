// src/app/components/workout/WorkoutDetailedDescriptionComponent.tsx
'use client';

import { useState } from 'react';
import { PlayIcon, CheckCircle, XCircle, Clock as ClockIcon } from 'lucide-react';

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
}

interface WorkoutDetailedDescriptionComponentProps {
  workout: WorkoutType;
  isDeviceConnected: boolean;
  onStartWorkout: (bodyWeight: number) => void;
}

export default function WorkoutDetailedDescriptionComponent({
  workout,
  isDeviceConnected,
  onStartWorkout,
}: WorkoutDetailedDescriptionComponentProps) {
  const [bodyWeight, setBodyWeight] = useState<string>('');
  const [weightError, setWeightError] = useState<string | null>(null);

  // Check if any sequence requires force recording
  const requiresDevice = workout.workoutTypeSequences.some(seq => seq.recordForce);

  // Format time helper function
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Total workout duration
  const totalDuration = workout.workoutTypeSequences.reduce((sum, seq) => sum + seq.duration, 0);

  // Validate body weight input
  const validateWeight = (value: string) => {
    const floatRegex = /^\d+(\.\d+)?$/;
    if (!value) {
      setWeightError('Body weight is required');
      return false;
    }
    if (!floatRegex.test(value)) {
      setWeightError('Please enter a valid number');
      return false;
    }
    const numValue = parseFloat(value);
    if (numValue <= 0 || numValue > 300) {
      setWeightError('Please enter a weight between 0 and 300 kg');
      return false;
    }
    setWeightError(null);
    return true;
  };

  const handleWeightChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setBodyWeight(value);
    validateWeight(value);
  };

  const handleStartWorkout = () => {
    if (validateWeight(bodyWeight)) {
      onStartWorkout(parseFloat(bodyWeight));
    }
  };

  // Check if the start button should be disabled
  const isStartButtonDisabled =
    (requiresDevice && !isDeviceConnected) || !bodyWeight || weightError !== null;

  return (
    <div className="flex flex-col h-full w-full bg-base-100 rounded-xl shadow-lg p-6 overflow-hidden">
      {/* Header with title and description */}
      <div>
        <h2 className="text-2xl font-bold">{workout.name}</h2>
        {workout.description && <p className="text-base-content/70 mt-2">{workout.description}</p>}

        <div className="mt-3 flex flex-wrap gap-2">
          <div className="badge badge-secondary">{formatTime(totalDuration)}</div>
          <div className="badge badge-outline">{workout.workoutTypeSequences.length} sequences</div>
          {requiresDevice && (
            <div className={`badge ${isDeviceConnected ? 'badge-success' : 'badge-warning'}`}>
              Force Tracking {isDeviceConnected ? 'Connected' : 'Required'}
            </div>
          )}
        </div>
      </div>

      {/* Body Weight Input */}
      <div className="mt-6 form-control w-full max-w-xs mx-auto">
        <label className="label">
          <span className="label-text">Your current body weight (kg)</span>
        </label>
        <input
          type="text"
          placeholder="Enter your body weight"
          className={`input input-bordered w-full ${weightError ? 'input-error' : ''}`}
          value={bodyWeight}
          onChange={handleWeightChange}
        />
        {weightError && (
          <label className="label">
            <span className="label-text-alt text-error">{weightError}</span>
          </label>
        )}
      </div>

      {/* Start button */}
      <div className="mt-6 flex flex-col items-center">
        <button
          className="btn btn-primary btn-lg gap-2"
          disabled={isStartButtonDisabled}
          onClick={handleStartWorkout}
        >
          <PlayIcon className="h-6 w-6" />
          Start Workout
        </button>

        {requiresDevice && !isDeviceConnected && (
          <p className="text-sm text-error mt-2">Connect ForceGrip device to start the workout</p>
        )}

        {!bodyWeight && !weightError && (
          <p className="text-sm text-warning mt-2">Please enter your body weight to continue</p>
        )}
      </div>

      {/* Sequences table - updated for better overflow handling */}
      <div className="mt-6 flex-grow overflow-hidden flex flex-col">
        <h3 className="font-medium mb-3">Sequences:</h3>
        <div className="overflow-x-auto overflow-y-auto flex-grow">
          <table className="table table-zebra w-full text-sm">
            <thead>
              <tr>
                <th className="w-10">#</th>
                <th className="w-16 text-center">
                  <ClockIcon className="h-4 w-4 inline" />
                </th>
                <th className="w-16">Force</th>
                <th>Instruction</th>
              </tr>
            </thead>
            <tbody>
              {workout.workoutTypeSequences.map(sequence => (
                <tr
                  key={sequence.sequence}
                  className={sequence.sequenceType === 'REST' ? 'text-secondary' : 'text-primary'}
                >
                  <td>{sequence.sequence}</td>
                  <td>{formatTime(sequence.duration)}</td>
                  <td className="text-center">
                    {sequence.recordForce ? (
                      <CheckCircle className="inline h-4 w-4 text-success" />
                    ) : (
                      <XCircle className="inline h-4 w-4 text-error" />
                    )}
                  </td>
                  <td className="break-words">{sequence.instruction || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
