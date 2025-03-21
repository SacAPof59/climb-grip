'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { PauseIcon, PlayIcon } from 'lucide-react';

type Timer = {
  name: string;
  steps: {
    name: string;
    repetition: number;
    restDuration: number;
    exercises: {
      name: string;
      duration: number;
      restDuration: number;
      repetition: number;
    }[];
  }[];
};

type Phase = {
  type: 'exercise' | 'exerciseRest' | 'stepRest';
  stepIndex: number;
  exerciseIndex: number;
  repetition: number;
  exerciseRepetition: number;
  duration: number;
  name: string;
};

type TimerBlocProps = {
  timer: Timer;
  onComplete: () => void;
};

export default function RunningTimerComponent({ timer, onComplete }: TimerBlocProps) {
  const [isRunning, setIsRunning] = useState(false);
  const [currentPhase, setCurrentPhase] = useState<Phase | null>(null);
  const [timeLeft, setTimeLeft] = useState(0);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [isFirstStart, setIsFirstStart] = useState(true);

  // Audio refs
  const audioRefs = useRef({
    introSound: null as HTMLAudioElement | null,
    startSound: null as HTMLAudioElement | null,
    endSound: null as HTMLAudioElement | null,
  });

  // Completion tracking refs
  const completionRef = useRef({
    phaseCompleted: false,
    timerCompleted: false,
  });

  // Memoize audio functions to fix dependency warnings
  const initializeAudio = useCallback(() => {
    audioRefs.current.introSound = new Audio('/sound/timer_intro.mp3');
    audioRefs.current.startSound = new Audio('/sound/timer_start.mp3');
    audioRefs.current.endSound = new Audio('/sound/timer_end.mp3');
  }, []);

  const cleanupAudio = useCallback(() => {
    Object.values(audioRefs.current).forEach(audio => {
      if (audio) {
        audio.pause();
        audio.src = '';
      }
    });
  }, []);

  // Initialize timer with first phase
  useEffect(() => {
    if (timer.steps.length > 0 && timer.steps[0].exercises.length > 0) {
      const firstExercise = timer.steps[0].exercises[0];
      setInitialPhase(firstExercise);
    }
  }, [timer]);

  // Initialize audio elements - fixed dependency array
  useEffect(() => {
    initializeAudio();
    return cleanupAudio;
  }, [initializeAudio, cleanupAudio]);

  // Countdown logic
  useEffect(() => {
    if (countdown === null || !isRunning) return;

    // Use current to access ref values
    const introSound = audioRefs.current.introSound;
    const startSound = audioRefs.current.startSound;

    if (countdown === 3 && introSound) {
      introSound.play();
    }

    const interval = setInterval(() => {
      setCountdown(prev => {
        if (prev && prev <= 1) {
          clearInterval(interval);
          // Skip playing startSound for the first time after countdown
          if (!isFirstStart && startSound) {
            startSound.play();
          }
          setCountdown(null);
          if (isFirstStart) {
            setIsFirstStart(false);
          }
          return null;
        }
        return prev ? prev - 1 : null;
      });
    }, 600);

    return () => clearInterval(interval);
  }, [countdown, isRunning, isFirstStart]);

  // Timer countdown logic
  useEffect(() => {
    if (!isRunning || !currentPhase || timeLeft <= 0 || countdown !== null) return;

    const interval = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          completionRef.current.phaseCompleted = true;
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isRunning, currentPhase, timeLeft, countdown]);

  // Handle phase completion
  useEffect(() => {
    if (completionRef.current.phaseCompleted) {
      completionRef.current.phaseCompleted = false;
      handlePhaseComplete();
    }
  });

  // Handle timer completion
  useEffect(() => {
    if (completionRef.current.timerCompleted) {
      completionRef.current.timerCompleted = false;
      onComplete();
    }
  });

  // Helper Functions
  function setInitialPhase(firstExercise: Timer['steps'][0]['exercises'][0]) {
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

  function handlePhaseComplete() {
    if (!currentPhase) return;

    if (currentPhase.type === 'exercise') {
      handleExerciseComplete();
    } else if (currentPhase.type === 'exerciseRest') {
      handleExerciseRestComplete();
    } else if (currentPhase.type === 'stepRest') {
      moveToNextStep();
    }
  }

  function handleExerciseComplete() {
    if (audioRefs.current.endSound) audioRefs.current.endSound.play();

    const currentStep = timer.steps[currentPhase!.stepIndex];
    const currentExercise = currentStep.exercises[currentPhase!.exerciseIndex];

    // Check if we need to do another repetition of this exercise
    if (currentPhase!.exerciseRepetition < currentExercise.repetition) {
      moveToExerciseRest();
    } else {
      const nextExerciseIndex = currentPhase!.exerciseIndex + 1;

      if (nextExerciseIndex < currentStep.exercises.length) {
        moveToNextExercise(nextExerciseIndex);
      } else if (currentStep.restDuration > 0) {
        moveToStepRest();
      } else {
        moveToNextStep();
      }
    }
  }

  function moveToExerciseRest() {
    const currentExercise =
      timer.steps[currentPhase!.stepIndex].exercises[currentPhase!.exerciseIndex];

    setCurrentPhase({
      ...currentPhase!,
      type: 'exerciseRest',
      duration: currentExercise.restDuration,
      name: `Rest (${currentExercise.name})`,
    });
    setTimeLeft(currentExercise.restDuration);
  }

  function handleExerciseRestComplete() {
    const currentExercise =
      timer.steps[currentPhase!.stepIndex].exercises[currentPhase!.exerciseIndex];

    setCurrentPhase({
      ...currentPhase!,
      type: 'exercise',
      exerciseRepetition: currentPhase!.exerciseRepetition + 1,
      duration: currentExercise.duration,
      name: currentExercise.name,
    });
    setTimeLeft(currentExercise.duration);

    if (audioRefs.current.startSound) audioRefs.current.startSound.play();
  }

  function moveToNextExercise(nextExerciseIndex: number) {
    const nextExercise = timer.steps[currentPhase!.stepIndex].exercises[nextExerciseIndex];

    setCurrentPhase({
      ...currentPhase!,
      type: 'exercise',
      exerciseIndex: nextExerciseIndex,
      exerciseRepetition: 1,
      duration: nextExercise.duration,
      name: nextExercise.name,
    });
    setTimeLeft(nextExercise.duration);

    if (audioRefs.current.startSound) audioRefs.current.startSound.play();
  }

  function moveToStepRest() {
    const currentStep = timer.steps[currentPhase!.stepIndex];

    setCurrentPhase({
      ...currentPhase!,
      type: 'stepRest',
      exerciseIndex: 0,
      exerciseRepetition: 1,
      duration: currentStep.restDuration,
      name: `Step Rest`,
    });
    setTimeLeft(currentStep.restDuration);

    if (audioRefs.current.endSound) audioRefs.current.endSound.play();
  }

  function moveToNextStep() {
    const currentStep = timer.steps[currentPhase!.stepIndex];
    const currentStepRepetition = currentPhase!.repetition;

    // Check if we need to repeat the current step
    if (currentStepRepetition < currentStep.repetition) {
      repeatCurrentStep();
    } else {
      const nextStepIndex = currentPhase!.stepIndex + 1;

      if (nextStepIndex < timer.steps.length) {
        moveToFirstExerciseOfNextStep(nextStepIndex);
      } else {
        completionRef.current.timerCompleted = true;
      }
    }
  }

  function repeatCurrentStep() {
    const firstExercise = timer.steps[currentPhase!.stepIndex].exercises[0];

    setCurrentPhase({
      ...currentPhase!,
      type: 'exercise',
      exerciseIndex: 0,
      repetition: currentPhase!.repetition + 1,
      exerciseRepetition: 1,
      duration: firstExercise.duration,
      name: firstExercise.name,
    });
    setTimeLeft(firstExercise.duration);

    if (audioRefs.current.startSound) audioRefs.current.startSound.play();
  }

  function moveToFirstExerciseOfNextStep(nextStepIndex: number) {
    const nextStep = timer.steps[nextStepIndex];

    if (nextStep.exercises.length > 0) {
      const firstExercise = nextStep.exercises[0];
      setCurrentPhase({
        type: 'exercise',
        stepIndex: nextStepIndex,
        exerciseIndex: 0,
        repetition: 1,
        exerciseRepetition: 1,
        duration: firstExercise.duration,
        name: firstExercise.name,
      });
      setTimeLeft(firstExercise.duration);

      if (audioRefs.current.startSound) audioRefs.current.startSound.play();
    }
  }

  function togglePlayPause() {
    if (!isRunning) {
      if (countdown === null) {
        setCountdown(3); // Start the 3-2-1 countdown
      }
      setIsRunning(true);
    } else {
      setIsRunning(false);
    }
  }

  // Utility functions
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getColorClass = () => {
    switch (currentPhase?.type) {
      case 'exercise':
        return 'text-primary';
      case 'exerciseRest':
        return 'text-secondary';
      default:
        return 'text-accent';
    }
  };

  // Progress calculation functions
  function calculateStepProgress() {
    if (!currentPhase) return { current: 0, total: 0, percent: 0 };

    // Calculate current step position (including repetitions)
    let currentPos = 0;
    for (let i = 0; i < currentPhase.stepIndex; i++) {
      currentPos += timer.steps[i].repetition;
    }
    currentPos += currentPhase.repetition;

    // Calculate total steps with repetitions
    const totalSteps = timer.steps.reduce((total, step) => total + step.repetition, 0);

    return {
      current: currentPos,
      total: totalSteps,
      percent: ((currentPos - 1) / totalSteps) * 100, // -1 because we're showing completed steps
    };
  }

  function calculateExerciseProgress() {
    if (!currentPhase) return { current: 0, total: 0, percent: 0 };

    const currentStep = timer.steps[currentPhase.stepIndex];

    // For step rest, show all exercises as completed
    if (currentPhase.type === 'stepRest') {
      const totalExercises = currentStep.exercises.reduce((total, ex) => total + ex.repetition, 0);
      return { current: totalExercises, total: totalExercises, percent: 100 };
    }

    // Calculate current exercise position
    let currentPos = 0;
    for (let i = 0; i < currentPhase.exerciseIndex; i++) {
      currentPos += currentStep.exercises[i].repetition;
    }
    currentPos += currentPhase.exerciseRepetition;

    // Calculate total exercises in this step
    const totalExercises = currentStep.exercises.reduce((total, ex) => total + ex.repetition, 0);

    // For exercise rest, show progress up to completed exercises
    const progressPercent =
      currentPhase.type === 'exerciseRest'
        ? ((currentPos - 1) / totalExercises) * 100
        : ((currentPos - 1) / totalExercises) * 100;

    return { current: currentPos, total: totalExercises, percent: progressPercent };
  }

  if (!currentPhase) return null;

  const stepProgress = calculateStepProgress();
  const exerciseProgress = calculateExerciseProgress();
  const progressValue = Math.round((timeLeft / currentPhase.duration) * 100);

  return (
    <div className="w-full max-w-md">
      {/* Progress Information */}
      <div className="mb-6 text-center">
        <h2 className="text-2xl font-bold">
          {countdown !== null ? 'Get Ready!' : currentPhase.name}
        </h2>

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
              {stepProgress.current}/{stepProgress.total}
            </span>
          </div>
          <div className="w-full bg-base-300 rounded-full h-2.5">
            <div
              className="bg-base-content h-2.5 rounded-full"
              style={{ width: `${stepProgress.percent}%` }}
            />
          </div>
        </div>

        {/* Exercises Timeline */}
        <div className="mt-2">
          <div className="flex justify-between mb-1 text-xs">
            <span>Exercises</span>
            <span>
              {exerciseProgress.current}/{exerciseProgress.total}
            </span>
          </div>
          <div className="w-full bg-base-300 rounded-full h-2.5">
            <div
              className="bg-base-content h-2.5 rounded-full"
              style={{ width: `${exerciseProgress.percent}%` }}
            />
          </div>
        </div>
      </div>

      {/* Timer Display */}
      <div className="flex justify-center mb-8">
        {countdown !== null ? (
          /* Pulsing Countdown Display */
          <div className="flex items-center justify-center w-48 h-48 rounded-full bg-base-200">
            <div className="text-8xl font-bold text-warning animate-pulse">{countdown}</div>
          </div>
        ) : (
          /* Regular Timer Display */
          <div
            className={`radial-progress ${getColorClass()}`}
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
                  {
                    timer.steps[currentPhase.stepIndex].exercises[currentPhase.exerciseIndex]
                      .repetition
                  }
                </div>
              )}
            </div>
          </div>
        )}
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
