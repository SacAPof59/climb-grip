// src/app/components/TimerBloc.tsx
  'use client';

  import { useState, useEffect, useRef } from 'react';
  import { PauseIcon, PlayIcon } from 'lucide-react';

  type TimerBlocProps = {
    timer: Timer;
    onComplete: () => void;
  };

  export default function TimerBloc({ timer, onComplete }: TimerBlocProps) {
    const [isRunning, setIsRunning] = useState(false);
    const [currentPhase, setCurrentPhase] = useState<Phase | null>(null);
    const [timeLeft, setTimeLeft] = useState(0);

    const startBeepRef = useRef<HTMLAudioElement | null>(null);
    const shortBeepRef = useRef<HTMLAudioElement | null>(null);
    const stepEndRef = useRef<HTMLAudioElement | null>(null);
    const successRef = useRef<HTMLAudioElement | null>(null);

    // Initialize timer with first phase
    useEffect(() => {
      if (timer.steps.length > 0) {
        const firstStep = timer.steps[0];
        if (firstStep.exercises.length > 0) {
          const firstExercise = firstStep.exercises[0];
          setCurrentPhase({
            type: 'exercise',
            stepIndex: 0,
            exerciseIndex: 0,
            repetition: 1,
            exerciseRepetition: 1,
            duration: firstExercise.duration,
            name: firstExercise.name,
          });
          setTimeLeft(firstExercise.duration);
        }
      }
    }, [timer]);

    // Initialize audio refs
    useEffect(() => {
      startBeepRef.current = new Audio('/sound/start.mp3');
      shortBeepRef.current = new Audio('/sound/short-repeatable-beep.mp3');
      stepEndRef.current = new Audio('/sound/microwave-end-sound.mp3');
      successRef.current = new Audio('/sound/success-fanfare-trumpets.mp3');

      return () => {
        // Clean up audio elements
        [startBeepRef, shortBeepRef, stepEndRef, successRef].forEach(ref => {
          if (ref.current) {
            ref.current.pause();
            ref.current.src = '';
          }
        });
      };
    }, []);

    // Timer countdown effect
    useEffect(() => {
      if (!isRunning || !currentPhase || timeLeft <= 0) return;

      const interval = setInterval(() => {
        setTimeLeft(prev => {
          // Play alert sounds when time is running out (3 seconds left)
          if (prev === 3 && shortBeepRef.current) {
            shortBeepRef.current.play();
          }

          if (prev <= 1) {
            clearInterval(interval);
            handlePhaseComplete();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(interval);
    }, [isRunning, currentPhase, timeLeft]);

    const playStartSound = () => {
      if (!shortBeepRef.current || !startBeepRef.current) return;
      shortBeepRef.current.play();
      setTimeout(() => {
        if (shortBeepRef.current) shortBeepRef.current.play();
        setTimeout(() => {
          if (startBeepRef.current) startBeepRef.current.play();
        }, 500);
      }, 500);
    };

    const handlePhaseComplete = () => {
      if (!timer || !currentPhase) return;

      const { steps } = timer;
      let { stepIndex, exerciseIndex, repetition, exerciseRepetition } = currentPhase;
      const currentStep = steps[stepIndex];

      // Play appropriate end sounds
      if (currentPhase.type === 'exercise') {
        if (shortBeepRef.current) {
          shortBeepRef.current.play();
          setTimeout(() => {
            if (shortBeepRef.current) shortBeepRef.current.play();
          }, 500);
        }
      } else if (currentPhase.type === 'stepRest') {
        if (stepEndRef.current) stepEndRef.current.play();
      }

      // Determine next phase
      let nextPhase: Phase | null = null;

      if (currentPhase.type === 'exercise') {
        // After exercise, check if we need exercise rest
        const currentExercise = currentStep.exercises[exerciseIndex];

        if (exerciseRepetition < currentExercise.repetition) {
          // More repetitions of this exercise
          nextPhase = {
            type: 'exerciseRest',
            stepIndex,
            exerciseIndex,
            repetition,
            exerciseRepetition,
            duration: currentExercise.restDuration,
            name: `Rest: ${currentExercise.name}`,
          };
        } else if (exerciseIndex < currentStep.exercises.length - 1) {
          // Move to next exercise
          exerciseIndex++;
          nextPhase = {
            type: 'exercise',
            stepIndex,
            exerciseIndex,
            repetition,
            exerciseRepetition: 1,
            duration: currentStep.exercises[exerciseIndex].duration,
            name: currentStep.exercises[exerciseIndex].name,
          };
        } else if (repetition < currentStep.repetition) {
          // End of exercises but more repetitions of this step
          nextPhase = {
            type: 'stepRest',
            stepIndex,
            exerciseIndex: 0,
            repetition,
            exerciseRepetition: 1,
            duration: currentStep.restDuration,
            name: `Rest: ${currentStep.name}`,
          };
        } else if (stepIndex < steps.length - 1) {
          // Move to next step
          stepIndex++;
          nextPhase = {
            type: 'exercise',
            stepIndex,
            exerciseIndex: 0,
            repetition: 1,
            exerciseRepetition: 1,
            duration: steps[stepIndex].exercises[0].duration,
            name: steps[stepIndex].exercises[0].name,
          };
        } else {
          // End of timer
          setIsRunning(false);
          if (successRef.current) successRef.current.play();
          onComplete();
          return;
        }
      } else if (currentPhase.type === 'exerciseRest') {
        // After exercise rest, continue with next repetition of the exercise
        const currentExercise = currentStep.exercises[exerciseIndex];
        exerciseRepetition++;

        nextPhase = {
          type: 'exercise',
          stepIndex,
          exerciseIndex,
          repetition,
          exerciseRepetition,
          duration: currentExercise.duration,
          name: currentExercise.name,
        };
      } else if (currentPhase.type === 'stepRest') {
        // After step rest, start next repetition of the step
        repetition++;
        nextPhase = {
          type: 'exercise',
          stepIndex,
          exerciseIndex: 0,
          repetition,
          exerciseRepetition: 1,
          duration: currentStep.exercises[0].duration,
          name: currentStep.exercises[0].name,
        };
      }

      if (nextPhase) {
        setCurrentPhase(nextPhase);
        setTimeLeft(nextPhase.duration);

        // Play start sound if beginning a new exercise
        if (nextPhase.type === 'exercise') {
          playStartSound();
        }
      }
    };

    const togglePlayPause = () => {
      if (!isRunning) {
        // If starting or resuming, play start sound for exercises
        if (currentPhase?.type === 'exercise') {
          playStartSound();
        }
        setIsRunning(true);
      } else {
        setIsRunning(false);
      }
    };

    const formatTime = (seconds: number) => {
      const mins = Math.floor(seconds / 60);
      const secs = seconds % 60;
      return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    if (!currentPhase) {
      return null;
    }

    // Calculate percentage for the radial progress (countdown from 100% to 0%)
    const progressValue = Math.round((timeLeft / currentPhase.duration) * 100);

    // Get color classes based on phase type
    const getColorClass = () => {
      if (timeLeft <= 3 && currentPhase.type === 'exercise') {
        return 'text-error';
      }

      switch (currentPhase.type) {
        case 'exercise':
          return 'text-primary';
        case 'exerciseRest':
          return 'text-secondary';
        default:
          return 'text-accent';
      }
    };

    return (
      <div className="w-full max-w-md">
        {/* Progress Information */}
        <div className="mb-6 text-center">
          <div className="badge badge-sm badge-outline mb-2">
            Step {currentPhase.stepIndex + 1}/{timer.steps.length}
          </div>
          <h2 className="text-2xl font-bold">{currentPhase.name}</h2>
          <div className="text-sm opacity-75 mt-1">
            {currentPhase.type === 'exercise'
              ? `Exercise ${currentPhase.exerciseIndex + 1}/${timer.steps[currentPhase.stepIndex].exercises.length}`
              : currentPhase.type === 'exerciseRest'
                ? 'Exercise Rest'
                : 'Step Rest'}
          </div>
        </div>

        {/* DaisyUI Radial Progress with improved visibility */}
        <div className="flex justify-center mb-8">
          <div
            className={`radial-progress ${getColorClass()} ${
              timeLeft <= 3 && currentPhase.type === 'exercise' ? 'animate-pulse' : ''
            }`}
            style={{
              "--value": progressValue,
              "--size": "12rem",
              "--thickness": "1rem",
            } as React.CSSProperties}
            role="progressbar"
            aria-valuenow={progressValue}
            aria-valuemin={0}
            aria-valuemax={100}
          >
            <div className="text-center">
              <div className="text-4xl font-bold">{formatTime(timeLeft)}</div>
              {currentPhase.type === 'exercise' && (
                <div className="text-sm mt-2">
                  Rep {currentPhase.exerciseRepetition}/
                  {currentPhase.stepIndex >= 0 &&
                   currentPhase.exerciseIndex >= 0 &&
                   timer.steps[currentPhase.stepIndex]?.exercises[currentPhase.exerciseIndex]?.repetition || 1}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Play/Pause Button */}
        <button
          onClick={togglePlayPause}
          className={`btn btn-circle btn-lg ${isRunning ? 'btn-error' : 'btn-success'} mx-auto flex items-center justify-center mb-8`}
        >
          {isRunning ? <PauseIcon className="h-8 w-8" /> : <PlayIcon className="h-8 w-8" />}
        </button>
      </div>
    );
  }