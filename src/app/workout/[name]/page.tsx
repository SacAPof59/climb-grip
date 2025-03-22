// src/app/workout/[name]/page.tsx
'use client';

import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeftIcon, PlayIcon } from 'lucide-react';
import { useEffect, useState, useRef, useCallback } from 'react';
import WorkoutDeviceConnectionComponent from '@/app/components/workout/WorkoutDeviceConnectionComponent';
import WorkoutDetailedDescriptionComponent from '@/app/components/workout/WorkoutDetailedDescriptionComponent';


interface WorkoutTypeSequence {
    workoutName: string;
    sequence: number;
    sequenceType: 'EFFORT' | 'REST';
    duration: number;
    instruction?: string | null;
    registerForce: boolean;
}

interface WorkoutType {
    name: string;
    description: string | null;
    workoutTypeSequences: WorkoutTypeSequence[];
}

export default function WorkoutDetailPage() {
    const params = useParams();
    const workoutName = params.name as string;
    const decodedWorkoutName = decodeURIComponent(workoutName);

    const [workout, setWorkout] = useState<WorkoutType | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [device, setDevice] = useState<BluetoothDevice | null>(null);
    const [requiresForceDevice, setRequiresForceDevice] = useState(false);

    useEffect(() => {
        const fetchWorkout = async () => {
            try {
                setLoading(true);
                const response = await fetch(`/api/workout/${encodeURIComponent(decodedWorkoutName)}`);

                if (!response.ok) {
                    throw new Error('Workout not found');
                }

                const data = await response.json();
                setWorkout(data);

                const needsDevice = data.workoutTypeSequences.some(
                    (sequence: WorkoutTypeSequence) => sequence.registerForce
                );
                setRequiresForceDevice(needsDevice);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Failed to fetch workout details');
            } finally {
                setLoading(false);
            }
        };

        fetchWorkout();
    }, [decodedWorkoutName]);

    // Format time helper function
    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const handleDeviceChange = (newDevice: BluetoothDevice | null) => {
        setDevice(newDevice);
    };

    const handleStartWorkout = () => {
        // Handle starting the workout
        console.log('Starting workout:', workout?.name, 'with device:', device);
        // TODO: Navigate to workout execution page or start timer
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-base-200 flex items-center justify-center">
                <div className="loading loading-spinner loading-lg text-primary"></div>
            </div>
        );
    }

    if (error || !workout) {
        return (
            <div className="min-h-screen bg-base-200">
                <div className="navbar bg-base-100 shadow-md sticky top-0 z-10">
                    <div className="navbar-start">
                        <Link href="/workout" className="btn btn-circle btn-ghost">
                            <ArrowLeftIcon className="h-5 w-5"/>
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
                        <ArrowLeftIcon className="h-5 w-5"/>
                    </Link>
                </div>
                <div className="navbar-center">
                    <h1 className="text-xl font-bold">{workout.name}</h1>
                </div>
                <div className="navbar-end"></div>
            </div>

            {/* Make connection component sticky right below the header */}
            <div className="sticky top-16 z-10">
                <WorkoutDeviceConnectionComponent
                    onDeviceChange={handleDeviceChange}
                    required={requiresForceDevice}
                />
            </div>

            {/* Main content */}
            <div className="container mx-auto px-4 py-4 flex-1 flex overflow-hidden">
                <WorkoutDetailedDescriptionComponent
                    workout={workout}
                    device={device}
                    onStartWorkout={handleStartWorkout}
                />
            </div>
        </div>
    );
}