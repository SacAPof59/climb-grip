'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { PauseIcon, PlayIcon } from 'lucide-react';
import TimerRadialProgressComponent from '@/app/components/timer/TimerRadialProgressComponent';
import WorkoutMeasurementComponent from '@/app/components/workout/WorkoutMeasurementComponent';
import WorkoutResultCard from '@/app/components/workout/WorkoutResultCard';
import { useSoundStore } from '@/lib/sound/soundStore';

interface WorkoutTimerComponentProps {
  workoutType: WorkoutType;
  isDeviceConnected: boolean;
  weight: string;
  bodyWeight: number | null; // Add this new prop
  onWorkoutExit?: (workoutId?: string) => void;
}

export default function WorkoutMonitoringComponent({
  workoutType,
  isDeviceConnected,
  weight,
  bodyWeight,
  onWorkoutExit,
}: WorkoutTimerComponentProps) {
  // Core states
  const [isRunning, setIsRunning] = useState(true);
  const [countdown, setCountdown] = useState<number>(3);
  const [isCountdownActive, setIsCountdownActive] = useState(true);
  const [currentTime, setCurrentTime] = useState(0);
  const [maxTime, setMaxTime] = useState(0);
  const [currentSequence, setCurrentSequence] = useState(0);
  const [phaseType, setPhaseType] = useState<
    'exercise' | 'exerciseRest' | 'stepRest' | 'countdown'
  >('countdown');
  const [phaseCounter, setPhaseCounter] = useState(0);
  const [isFirstStart, setIsFirstStart] = useState(true);
  const { play } = useSoundStore();
  const [maxIsoForce, setMaxIsoForce] = useState<number>(0);
  const [criticalForce, setCriticalForce] = useState<number>(0);
  const [maxForceForCF, setMaxForceForCF] = useState<number>(0);
  const [workoutCompleted, setWorkoutCompleted] = useState(false);
  // States for workout results
  const [showResults, setShowResults] = useState(false);
  const [workoutId, setWorkoutId] = useState<string | null>(null);
  const [maxWeight, setMaxWeight] = useState(0);
  const [processedMeasurements, setProcessedMeasurements] = useState<
    Array<{ sequence: number; data: MeasuredData[] }>
  >([]);

  // Ref to store measurement data from WorkoutMeasurementComponent
  const measurementDataRef = useRef<Map<number, MeasuredData[]>>(new Map());

  // Map workout sequence type to timer phase type
  const mapSequenceTypeToPhaseType = (
    sequenceType: 'EFFORT' | 'REST'
  ): 'exercise' | 'exerciseRest' => {
    return sequenceType === 'EFFORT' ? 'exercise' : 'exerciseRest';
  };

  // Function to receive measurement data from child component
  const handleMeasurementUpdate = (measurementData: Map<number, MeasuredData[]>) => {
    measurementDataRef.current = measurementData;

    // Update max weight for display only
    let currentMax = maxWeight;
    measurementData.forEach(dataPoints => {
      dataPoints.forEach(point => {
        if (point.weight > currentMax) {
          currentMax = point.weight;
        }
      });
    });

    if (currentMax > maxWeight) {
      setMaxWeight(currentMax);
    }
  };

  // Handle workout completion - uses data from measurementDataRef
  const handleWorkoutComplete = useCallback(async () => {
    // Play victory sound
    play('timer_victory');

    // Convert the Map to a format suitable for API
    const measurementsData = Array.from(measurementDataRef.current.entries()).map(
      ([sequence, data]) => ({
        sequence,
        data,
      })
    );

    setProcessedMeasurements(measurementsData);

    try {
      const response = await fetch('/api/workout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          workoutName: workoutType.name,
          measurementsData,
          bodyWeight: bodyWeight,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to save workout');
      }

      const result = await response.json();
      if (result.workoutId) {
        setWorkoutId(result.workoutId);

        // Fetch the processed workout data to display the calculated values
        const workoutResponse = await fetch(`/api/workout?workoutId=${result.workoutId}`);
        if (workoutResponse.ok) {
          const workoutData = await workoutResponse.json();
          const workout = workoutData.workoutResults?.[0];

          if (workout) {
            // Set values from server calculations
            if (workoutType.isMaxIsoFS && workout.maxIsoForce) {
              setMaxIsoForce(workout.maxIsoForce);
            }

            if (workoutType.isCriticalForce) {
              if (workout.criticalForce) setCriticalForce(workout.criticalForce);
              if (workout.maxForceForCF) setMaxForceForCF(workout.maxForceForCF);
            }
          }
        }

        setShowResults(true);
      }
    } catch (error) {
      console.error('Error saving workout:', error);
      alert('Failed to save workout. Please try again.');
    }
  }, [bodyWeight, workoutType.name, workoutType.isMaxIsoFS, workoutType.isCriticalForce, play]);

  const exitWorkout = () => {
    if (onWorkoutExit) {
      onWorkoutExit(workoutId || undefined);
    }
  };

  // Initialize component on mount
  useEffect(() => {
    setIsFirstStart(true);
    setIsCountdownActive(true);
    setCountdown(3);
    setPhaseType('countdown');
    setIsRunning(true);
  }, []);

  // Countdown timer effect
  useEffect(() => {
    if (!isRunning || !isCountdownActive) return;

    const countdownInterval = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(countdownInterval);
          setIsCountdownActive(false);
          return 0;
        }
        return prev - 1;
      });
    }, 750);

    return () => {
      clearInterval(countdownInterval);
    };
  }, [isRunning, isCountdownActive]);

  // Effect to start workout after countdown completes
  useEffect(() => {
    // Only run when countdown transitions from active to inactive
    if (!isCountdownActive && isFirstStart) {
      setIsFirstStart(false);

      // Start first workout sequence
      if (workoutType?.workoutTypeSequences?.length > 0) {
        const firstSequence = workoutType.workoutTypeSequences[0];
        setCurrentSequence(firstSequence.sequence);
        setMaxTime(firstSequence.duration);
        setCurrentTime(firstSequence.duration);
        setPhaseType(mapSequenceTypeToPhaseType(firstSequence.sequenceType));
        setPhaseCounter(1);
      }
    }
  }, [isCountdownActive, isFirstStart, workoutType.workoutTypeSequences]);

  // Main workout timer effect
  useEffect(() => {
    if (!isRunning || isCountdownActive) return;

    const timerInterval = setInterval(() => {
      setCurrentTime(prev => {
        const newTime = prev - 1;

        if (newTime <= 0) {
          // Move to next sequence
          const nextSequence = currentSequence + 1;
          if (nextSequence < workoutType?.workoutTypeSequences?.length + 1) {
            const sequence = workoutType.workoutTypeSequences[nextSequence - 1];
            setCurrentSequence(nextSequence);
            setMaxTime(sequence.duration);
            setPhaseType(mapSequenceTypeToPhaseType(sequence.sequenceType));
            setPhaseCounter(prev => prev + 1);
            return sequence.duration;
          } else {
            // Workout complete
            setIsRunning(false);
            setWorkoutCompleted(true);
            return 0;
          }
        }
        return newTime;
      });
    }, 1000);

    return () => {
      console.log('Clearing timer interval');
      clearInterval(timerInterval);
    };
  }, [isRunning, isCountdownActive, currentSequence, workoutType.workoutTypeSequences]);

  useEffect(() => {
    if (workoutCompleted) {
      handleWorkoutComplete();
    }
  }, [workoutCompleted, handleWorkoutComplete]);

  // Toggle play/pause
  const togglePlayPause = () => {
    setIsRunning(prev => !prev);
  };

  if (!isDeviceConnected)
    return (
      <div className="alert alert-warning shadow-lg">
        <div>Device disconnected.</div>
      </div>
    );

  if (showResults) {
    return (
      <WorkoutResultCard
        workoutId={workoutId || ''}
        workoutName={workoutType.name}
        measurementsData={processedMeasurements}
        workoutSequences={workoutType.workoutTypeSequences}
        maxWeight={maxWeight}
        bodyWeight={bodyWeight ?? 0}
        maxIsoForce={workoutType.isMaxIsoFS ? maxIsoForce : undefined}
        criticalForce={workoutType.isCriticalForce ? criticalForce : undefined}
        maxForceForCF={workoutType.isCriticalForce ? maxForceForCF : undefined}
      />
    );
  }

  return (
    <div className="flex flex-col h-full w-full bg-base-100 rounded-xl shadow-lg p-6 overflow-hidden">
      <div className="flex items-center justify-around">
        <TimerRadialProgressComponent
          current={isCountdownActive ? countdown : currentTime}
          max={isCountdownActive ? 3 : maxTime}
          phaseType={isCountdownActive ? 'countdown' : phaseType}
          phaseCounter={phaseCounter}
          isRunning={isRunning}
        />

        <button
          onClick={togglePlayPause}
          className={`btn btn-circle ${isRunning ? 'btn-error' : 'btn-success'} ml-4`}
        >
          {isRunning ? <PauseIcon className="h-5 w-5" /> : <PlayIcon className="h-5 w-5" />}
        </button>
      </div>
      <WorkoutMeasurementComponent
        weight={weight}
        currentSequence={currentSequence}
        isRunning={isRunning}
        isCountdownActive={isCountdownActive}
        onMeasurementUpdate={handleMeasurementUpdate}
      />
      <button onClick={exitWorkout} className="btn btn-outline btn-sm">
        Exit
      </button>
    </div>
  );
}
