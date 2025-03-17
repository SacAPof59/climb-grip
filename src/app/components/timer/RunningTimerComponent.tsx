'use client';

import { useState, useEffect, useRef } from 'react';
import { PauseIcon, PlayIcon } from 'lucide-react';

type TimerBlocProps = {
  timer: Timer;
  onComplete: () => void;
};

export default function RunningTimerComponent({ timer, onComplete }: TimerBlocProps) {
  const [isRunning, setIsRunning] = useState(false);
  const [currentPhase, setCurrentPhase] = useState<Phase | null>(null);
  const [timeLeft, setTimeLeft] = useState(0);

  const startBeepRef = useRef<HTMLAudioElement | null>(null);
  const shortBeepRef = useRef<HTMLAudioElement | null>(null);
  const stepEndRef = useRef<HTMLAudioElement | null>(null);
  const successRef = useRef<HTMLAudioElement | null>(null);

  // Add completion tracking refs
  const completionRef = useRef({
    phaseCompleted: false,
    timerCompleted: false,
  });

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

  // Audio initialization and timer logic (unchanged)
  useEffect(() => {
    startBeepRef.current = new Audio('/sound/start.mp3');
    shortBeepRef.current = new Audio('/sound/short-repeatable-beep.mp3');
    stepEndRef.current = new Audio('/sound/microwave-end-sound.mp3');
    successRef.current = new Audio('/sound/success-fanfare-trumpets.mp3');

    return () => {
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
        if (prev === 3 && shortBeepRef.current) {
          shortBeepRef.current.play();
        }

        if (prev <= 1) {
          clearInterval(interval);
          completionRef.current.phaseCompleted = true;
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isRunning, currentPhase, timeLeft]);

  useEffect(() => {
    if (completionRef.current.phaseCompleted) {
      completionRef.current.phaseCompleted = false;
      handlePhaseComplete();
    }
  });

  // Rest of the phase handling logic remains the same
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
    if (!currentPhase) return;

    if (currentPhase.type === 'exercise') {
      if (stepEndRef.current) stepEndRef.current.play();

      const currentStep = timer.steps[currentPhase.stepIndex];
      const currentExercise = currentStep.exercises[currentPhase.exerciseIndex];

      // Check if we need to do another repetition of this exercise
      if (currentPhase.exerciseRepetition < currentExercise.repetition) {
        // Move to exercise rest phase before next repetition
        setCurrentPhase({
          type: 'exerciseRest',
          stepIndex: currentPhase.stepIndex,
          exerciseIndex: currentPhase.exerciseIndex,
          repetition: currentPhase.repetition,
          exerciseRepetition: currentPhase.exerciseRepetition,
          duration: currentExercise.restDuration,
          name: `Rest (${currentExercise.name})`,
        });
        setTimeLeft(currentExercise.restDuration);
      } else {
        // Move to next exercise or step
        const nextExerciseIndex = currentPhase.exerciseIndex + 1;

        if (nextExerciseIndex < currentStep.exercises.length) {
          // Move to next exercise in current step
          const nextExercise = currentStep.exercises[nextExerciseIndex];
          setCurrentPhase({
            type: 'exercise',
            stepIndex: currentPhase.stepIndex,
            exerciseIndex: nextExerciseIndex,
            repetition: currentPhase.repetition,
            exerciseRepetition: 1,
            duration: nextExercise.duration,
            name: nextExercise.name,
          });
          setTimeLeft(nextExercise.duration);
        } else {
          // Move to step rest or next step
          if (currentStep.restDuration > 0) {
            // Changed from currentStep.rest to currentStep.restDuration
            setCurrentPhase({
              type: 'stepRest',
              stepIndex: currentPhase.stepIndex,
              exerciseIndex: 0,
              repetition: currentPhase.repetition,
              exerciseRepetition: 1,
              duration: currentStep.restDuration, // Changed from currentStep.rest to currentStep.restDuration
              name: `Step Rest`,
            });
            setTimeLeft(currentStep.restDuration); // Changed from currentStep.rest to currentStep.restDuration
          } else {
            moveToNextStep();
          }
        }
      }
    } else if (currentPhase.type === 'exerciseRest') {
      // After exercise rest, go back to the same exercise with incremented repetition
      const currentExercise =
        timer.steps[currentPhase.stepIndex].exercises[currentPhase.exerciseIndex];
      setCurrentPhase({
        type: 'exercise',
        stepIndex: currentPhase.stepIndex,
        exerciseIndex: currentPhase.exerciseIndex,
        repetition: currentPhase.repetition,
        exerciseRepetition: currentPhase.exerciseRepetition + 1,
        duration: currentExercise.duration,
        name: currentExercise.name,
      });
      setTimeLeft(currentExercise.duration);
      playStartSound();
    } else if (currentPhase.type === 'stepRest') {
      // After step rest, move to next step
      moveToNextStep();
    }
  };

  const moveToNextStep = () => {
    const currentStep = timer.steps[currentPhase!.stepIndex];
    const currentStepRepetition = currentPhase!.repetition;

    // Check if we need to repeat the current step
    if (currentStep.repetition && currentStepRepetition < currentStep.repetition) {
      // Repeat the current step by going back to its first exercise
      const firstExercise = currentStep.exercises[0];
      setCurrentPhase({
        type: 'exercise',
        stepIndex: currentPhase!.stepIndex,
        exerciseIndex: 0,
        repetition: currentStepRepetition + 1, // Increment step repetition
        exerciseRepetition: 1,
        duration: firstExercise.duration,
        name: firstExercise.name,
      });
      setTimeLeft(firstExercise.duration);
      playStartSound();
    } else {
      // Move to next step
      const nextStepIndex = currentPhase!.stepIndex + 1;

      if (nextStepIndex < timer.steps.length) {
        // Move to first exercise of next step
        const nextStep = timer.steps[nextStepIndex];
        if (nextStep.exercises.length > 0) {
          const firstExercise = nextStep.exercises[0];
          setCurrentPhase({
            type: 'exercise',
            stepIndex: nextStepIndex,
            exerciseIndex: 0,
            repetition: 1, // Reset repetition for new step
            exerciseRepetition: 1,
            duration: firstExercise.duration,
            name: firstExercise.name,
          });
          setTimeLeft(firstExercise.duration);
          playStartSound();
        }
      } else {
        // Timer completed
        if (successRef.current) successRef.current.play();
        setIsRunning(false);
        // Mark for completion instead of direct call
        completionRef.current.timerCompleted = true;
      }
    }
  };

  useEffect(() => {
    if (completionRef.current.timerCompleted) {
      completionRef.current.timerCompleted = false;
      onComplete();
    }
  });

  const togglePlayPause = () => {
    if (!isRunning) {
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

  const progressValue = Math.round((timeLeft / currentPhase.duration) * 100);

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
        <h2 className="text-2xl font-bold">{currentPhase.name}</h2>

        {/* Step Name and Repetition Display */}
        <div className="mt-3 mb-2">
          <div className="flex items-center justify-center gap-2">
            <h3 className="text-lg font-medium text-accent">
              {timer.steps[currentPhase.stepIndex].name}
            </h3>
            {timer.steps[currentPhase.stepIndex].repetition > 1 && (
              <div className="badge badge-accent">
                {currentPhase.repetition}/{timer.steps[currentPhase.stepIndex].repetition}
              </div>
            )}
          </div>
        </div>

        {/* Steps Timeline */}
        <div className="mt-4 mb-2">
          <div className="flex justify-between mb-1 text-xs">
            <span>Steps</span>
            <span>
              {(() => {
                // Calculate current step position (including repetitions)
                let currentPos = 0;
                for (let i = 0; i < currentPhase.stepIndex; i++) {
                  currentPos += timer.steps[i].repetition;
                }
                currentPos += currentPhase.repetition;

                // Calculate total steps with repetitions
                const totalSteps = timer.steps.reduce((total, step) => total + step.repetition, 0);

                return `${currentPos}/${totalSteps}`;
              })()}
            </span>
          </div>
          <div className="w-full bg-base-300 rounded-full h-2.5">
            <div
              className="bg-base-content h-2.5 rounded-full"
              style={{
                width: `${(() => {
                  // Calculate progress percentage for steps
                  let currentPos = 0;
                  for (let i = 0; i < currentPhase.stepIndex; i++) {
                    currentPos += timer.steps[i].repetition;
                  }
                  currentPos += currentPhase.repetition - 1; // -1 because we're showing completed steps

                  const totalSteps = timer.steps.reduce(
                    (total, step) => total + step.repetition,
                    0
                  );
                  return (currentPos / totalSteps) * 100;
                })()}%`,
              }}
            />
          </div>
        </div>

        {/* Exercises Timeline */}
        <div className="mt-2">
          <div className="flex justify-between mb-1 text-xs">
            <span>Exercises</span>
            <span>
              {(() => {
                if (currentPhase.type === 'stepRest') {
                  const totalExercises = timer.steps[currentPhase.stepIndex].exercises.reduce(
                    (total, ex) => total + ex.repetition,
                    0
                  );
                  return `${totalExercises}/${totalExercises}`;
                }

                // Calculate current exercise position
                let currentPos = 0;
                for (let i = 0; i < currentPhase.exerciseIndex; i++) {
                  currentPos += timer.steps[currentPhase.stepIndex].exercises[i].repetition;
                }
                currentPos += currentPhase.exerciseRepetition;

                // Calculate total exercises in this step
                const totalExercises = timer.steps[currentPhase.stepIndex].exercises.reduce(
                  (total, ex) => total + ex.repetition,
                  0
                );

                return `${currentPos}/${totalExercises}`;
              })()}
            </span>
          </div>
          <div className="w-full bg-base-300 rounded-full h-2.5">
            <div
              className="bg-base-content h-2.5 rounded-full"
              style={{
                width: `${(() => {
                  if (currentPhase.type === 'stepRest') {
                    return 100;
                  }
                  if (currentPhase.type === 'exerciseRest') {
                    // Show progress up to current exercise
                    let completedExercises = 0;
                    for (let i = 0; i < currentPhase.exerciseIndex; i++) {
                      completedExercises +=
                        timer.steps[currentPhase.stepIndex].exercises[i].repetition;
                    }
                    completedExercises += currentPhase.exerciseRepetition - 1;

                    const totalExercises = timer.steps[currentPhase.stepIndex].exercises.reduce(
                      (total, ex) => total + ex.repetition,
                      0
                    );

                    return (completedExercises / totalExercises) * 100;
                  }

                  // For exercise phase
                  let completedExercises = 0;
                  for (let i = 0; i < currentPhase.exerciseIndex; i++) {
                    completedExercises +=
                      timer.steps[currentPhase.stepIndex].exercises[i].repetition;
                  }
                  completedExercises += currentPhase.exerciseRepetition - 1;

                  const totalExercises = timer.steps[currentPhase.stepIndex].exercises.reduce(
                    (total, ex) => total + ex.repetition,
                    0
                  );

                  return (completedExercises / totalExercises) * 100;
                })()}%`,
              }}
            />
          </div>
        </div>
      </div>

      {/* DaisyUI Radial Progress */}
      <div className="flex justify-center mb-8">
        <div
          className={`radial-progress ${getColorClass()} ${
            timeLeft <= 3 && currentPhase.type === 'exercise' ? 'animate-pulse' : ''
          }`}
          style={
            {
              '--value': progressValue,
              '--size': '12rem',
              '--thickness': '1rem',
            } as React.CSSProperties
          }
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
                {timer.steps[currentPhase.stepIndex]?.exercises[currentPhase.exerciseIndex]
                  ?.repetition || 1}
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
