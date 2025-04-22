// src/app/components/workout/WorkoutDetailedDescriptionComponent.tsx
'use client';

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
  onStartWorkout: () => void;
}

export default function WorkoutDetailedDescriptionComponent({
  workout,
  isDeviceConnected,
  onStartWorkout,
}: WorkoutDetailedDescriptionComponentProps) {
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

      {/* Start button */}
      <div className="mt-6 flex flex-col items-center">
        <button
          className="btn btn-primary btn-lg gap-2"
          disabled={requiresDevice && !isDeviceConnected}
          onClick={onStartWorkout}
        >
          <PlayIcon className="h-6 w-6" />
          Start Workout
        </button>

        {requiresDevice && !isDeviceConnected && (
          <p className="text-sm text-error mt-2">Connect ForceGrip device to start the workout</p>
        )}
      </div>
    </div>
  );
}
