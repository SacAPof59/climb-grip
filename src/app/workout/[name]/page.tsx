// src/app/workout/[name]/page.tsx
'use client';

import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeftIcon } from 'lucide-react';
import { useEffect, useState, useCallback } from 'react';
import WorkoutDeviceConnectionComponent from '@/app/components/workout/WorkoutDeviceConnectionComponent';
import WorkoutDetailedDescriptionComponent from '@/app/components/workout/WorkoutDetailedDescriptionComponent';
import WorkoutMonitoringComponent from '@/app/components/workout/WorkoutMonitoringComponent';
import SoundPreloader from '@/app/components/SoundPreloader';

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
}

export default function WorkoutRunningPage() {
  const params = useParams();
  const workoutName = params.name as string;
  const decodedWorkoutName = decodeURIComponent(workoutName);

  const [workoutType, setWorkoutType] = useState<WorkoutType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDeviceConnected, setIsDeviceConnected] = useState(false);
  const [currentWeight, setCurrentWeight] = useState('--');
  const [requiresForceDevice, setRequiresForceDevice] = useState(false);
  const [isWorkoutStarted, setIsWorkoutStarted] = useState(false);
  const [climberBodyWeight, setClimberBodyWeight] = useState<number | null>(null);

  useEffect(() => {
    const fetchWorkoutType = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/workout_type/${encodeURIComponent(decodedWorkoutName)}`);

        if (!response.ok) {
          throw new Error('Workout not found');
        }

        const data = await response.json();
        setWorkoutType(data);

        const needsDevice = data.workoutTypeSequences.some(
          (sequence: WorkoutTypeSequence) => sequence.recordForce
        );
        setRequiresForceDevice(needsDevice);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch workout details');
      } finally {
        setLoading(false);
      }
    };

    fetchWorkoutType();
  }, [decodedWorkoutName]);

  // Props functions for the device connection component
  const handleDeviceConnection = useCallback((isConnected: boolean) => {
    setIsDeviceConnected(isConnected);
  }, []);
  const handleWeightChange = useCallback((weight: string) => {
    setCurrentWeight(weight);
  }, []);

  // Props function for the detailed description component
  const handleStartWorkout = async (bodyWeight: number) => {
    if (requiresForceDevice && !isDeviceConnected) {
      return; // Don't start if device is required but not connected
    }
    setClimberBodyWeight(bodyWeight);
    setIsWorkoutStarted(true);
  };

  // In the WorkoutRunningPage component
  const handleWorkoutExit = (workoutId?: string) => {
    console.log('Exiting workout:', workoutId);
    setIsWorkoutStarted(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-base-200 flex items-center justify-center">
        {/* Preload sounds */}
        <SoundPreloader />
        <div className="loading loading-spinner loading-lg text-primary"></div>
      </div>
    );
  }

  if (error || !workoutType) {
    return (
      <div className="min-h-screen bg-base-200">
        <div className="navbar bg-base-100 shadow-md sticky top-0 z-10">
          <div className="navbar-start">
            <Link href="/workout" className="btn btn-circle btn-ghost">
              <ArrowLeftIcon className="h-5 w-5" />
            </Link>
          </div>
          <div className="navbar-center">
            <h1 className="text-xl font-bold">Error</h1>
          </div>
        </div>

        <div className="container mx-auto px-4 py-8">
          <div className="card bg-base-100 shadow-xl">
            <div className="card-body text-center">
              <h2 className="card-title justify-center">Workout Not Found</h2>
              <p>{error || 'Unable to load workout details'}</p>
              <div className="card-actions justify-center mt-4">
                <Link href="/workout" className="btn btn-primary">
                  Back to Workouts
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-base-200 flex flex-col">
      {/* Header - already sticky */}
      <div className="navbar bg-base-100 shadow-md sticky top-0 z-20">
        <div className="navbar-start">
          <Link href="/workout" className="btn btn-circle btn-ghost">
            <ArrowLeftIcon className="h-5 w-5" />
          </Link>
        </div>
        <div className="navbar-center">
          <h1 className="text-xl font-bold">{workoutType.name}</h1>
        </div>
        <div className="navbar-end"></div>
      </div>

      {/* Make connection component sticky right below the header */}
      {requiresForceDevice ? (
        <WorkoutDeviceConnectionComponent
          checkDeviceConnection={handleDeviceConnection}
          onWeightChange={handleWeightChange}
        />
      ) : null}

      <div className="container mx-auto px-4 py-4 flex-1 flex overflow-hidden">
        {isWorkoutStarted ? (
          <WorkoutMonitoringComponent
            workoutType={workoutType}
            isDeviceConnected={isDeviceConnected}
            weight={currentWeight}
            bodyWeight={climberBodyWeight} // Add this new prop
            onWorkoutExit={handleWorkoutExit}
          />
        ) : (
          <WorkoutDetailedDescriptionComponent
            workout={workoutType}
            isDeviceConnected={isDeviceConnected}
            onStartWorkout={handleStartWorkout}
          />
        )}
      </div>
    </div>
  );
}
