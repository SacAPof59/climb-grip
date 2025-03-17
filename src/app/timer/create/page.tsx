'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeftIcon, PlusIcon, XCircleIcon } from 'lucide-react';

export default function CreateTimerPage() {
  const router = useRouter();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading] = useState(false);
  const [timerName, setTimerName] = useState('');
  const [isMultiStepMode, setIsMultiStepMode] = useState(false);

  const [steps, setSteps] = useState<TimerStep[]>([
    {
      id: Date.now().toString(),
      name: '',
      restDuration: 0,
      repetition: 1,
      exercises: [
        {
          id: Date.now().toString() + '-1',
          name: '',
          duration: 30,
          restDuration: 30,
          repetition: 1,
        },
      ],
    },
  ]);

  // Rest of the functions (addStep, removeStep, etc.) remain the same...
  const addStep = () => {
    setSteps([
      ...steps,
      {
        id: Date.now().toString(),
        name: '',
        restDuration: 0,
        repetition: 1,
        exercises: [
          {
            id: Date.now().toString() + '-1',
            name: '',
            duration: 30,
            restDuration: 30,
            repetition: 1,
          },
        ],
      },
    ]);
  };

  const removeStep = (stepId: string) => {
    if (steps.length > 1) {
      setSteps(steps.filter(step => step.id !== stepId));
    }
  };

  const updateStep = (stepId: string, field: string, value: string | number) => {
    setSteps(steps.map(step => (step.id === stepId ? { ...step, [field]: value } : step)));
  };

  const addExercise = (stepId: string) => {
    setSteps(
      steps.map(step => {
        if (step.id === stepId) {
          return {
            ...step,
            exercises: [
              ...step.exercises,
              {
                id: Date.now().toString(),
                name: '',
                duration: 30,
                restDuration: 30,
                repetition: 1,
              },
            ],
          };
        }
        return step;
      })
    );
  };

  const removeExercise = (stepId: string, exerciseId: string) => {
    setSteps(
      steps.map(step => {
        if (step.id === stepId && step.exercises.length > 1) {
          return {
            ...step,
            exercises: step.exercises.filter(ex => ex.id !== exerciseId),
          };
        }
        return step;
      })
    );
  };

  const updateExercise = (
    stepId: string,
    exerciseId: string,
    field: string,
    value: string | number
  ) => {
    setSteps(
      steps.map(step => {
        if (step.id === stepId) {
          return {
            ...step,
            exercises: step.exercises.map(ex =>
              ex.id === exerciseId ? { ...ex, [field]: value } : ex
            ),
          };
        }
        return step;
      })
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Transform the data for API submission
      let submissionSteps;

      if (!isMultiStepMode) {
        // In one step mode, use a default step with the current exercises
        submissionSteps = [
          {
            name: 'default',
            restDuration: 0,
            repetition: 1,
            exercises: steps[0].exercises.map(ex => ({
              name: ex.name,
              duration: Number(ex.duration),
              restDuration: Number(ex.restDuration),
              repetition: Number(ex.repetition),
            })),
          },
        ];
      } else {
        // In multi-step mode, use the full steps configuration
        submissionSteps = steps.map(step => ({
          name: step.name,
          restDuration: Number(step.restDuration),
          repetition: Number(step.repetition),
          exercises: step.exercises.map(ex => ({
            name: ex.name,
            duration: Number(ex.duration),
            restDuration: Number(ex.restDuration),
            repetition: Number(ex.repetition),
          })),
        }));
      }

      const payload = {
        name: timerName,
        steps: submissionSteps,
      };

      const response = await fetch('/api/timer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to create timer');
      }

      // Navigate back to timers list on success
      router.push('/timer');
      router.refresh();
    } catch (error) {
      console.error('Error creating timer:', error);
      alert('Failed to create timer. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const isFormValid = () => {
    if (!timerName) return false;

    if (!isMultiStepMode) {
      return steps[0].exercises.every(
        ex => ex.name && ex.duration > 0 && ex.restDuration >= 0 && ex.repetition > 0
      );
    } else {
      return steps.every(
        step =>
          step.name &&
          step.restDuration >= 0 &&
          step.repetition > 0 &&
          step.exercises.every(
            ex => ex.name && ex.duration > 0 && ex.restDuration >= 0 && ex.repetition > 0
          )
      );
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-base-200 flex items-center justify-center">
        <div className="text-center">
          <span className="loading loading-spinner loading-lg text-primary"></span>
          <p className="mt-4">Loading timer template...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-base-200 pb-16">
      <div className="navbar bg-base-100 shadow-md sticky top-0 z-10">
        <div className="navbar-start">
          <Link href="/timer" className="btn btn-circle btn-ghost">
            <ArrowLeftIcon className="h-5 w-5" />
          </Link>
        </div>
        <div className="navbar-center">
          <h1 className="text-xl font-bold">Create Timer</h1>
        </div>
        <div className="navbar-end"></div>
      </div>

      <div className="container mx-auto px-4 pt-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Timer Name */}
          <div className="card bg-base-100 shadow-lg">
            <div className="card-body">
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Timer Name</span>
                </label>
                <input
                  type="text"
                  value={timerName}
                  onChange={e => setTimerName(e.target.value)}
                  className="input input-bordered w-full"
                  placeholder="Enter timer name"
                  required
                />
              </div>
            </div>
          </div>

          {/* Mode Toggle - Updated order */}
          <div className="flex items-center justify-center gap-4 my-4">
            <span className={`text-sm ${!isMultiStepMode ? 'font-bold' : ''}`}>No step</span>
            <input
              type="checkbox"
              className="toggle toggle-primary"
              checked={isMultiStepMode}
              onChange={() => setIsMultiStepMode(!isMultiStepMode)}
            />
            <span className={`text-sm ${isMultiStepMode ? 'font-bold' : ''}`}>Steps</span>
          </div>

          {/* Steps */}
          {!isMultiStepMode ? (
            // One step mode - Simplified UI with just exercises
            <>
              <div className="divider">Exercises</div>

              {steps[0].exercises.map((exercise, exIndex) => (
                <div key={exercise.id} className="card bg-base-300 mb-4">
                  <div className="card-body p-4">
                    <div className="flex justify-between items-center">
                      <h3 className="font-medium">Exercise {exIndex + 1}</h3>
                      {steps[0].exercises.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeExercise(steps[0].id, exercise.id)}
                          className="btn btn-sm btn-circle btn-ghost text-error"
                        >
                          <XCircleIcon className="h-5 w-5" />
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                      <div className="form-control">
                        <label className="label">
                          <span className="label-text">Exercise Name</span>
                        </label>
                        <input
                          type="text"
                          value={exercise.name}
                          onChange={e =>
                            updateExercise(steps[0].id, exercise.id, 'name', e.target.value)
                          }
                          className="input input-bordered w-full"
                          placeholder="Enter exercise name"
                          required
                        />
                      </div>

                      <div className="form-control">
                        <label className="label">
                          <span className="label-text">Duration (seconds)</span>
                        </label>
                        <input
                          type="number"
                          value={exercise.duration}
                          onChange={e =>
                            updateExercise(
                              steps[0].id,
                              exercise.id,
                              'duration',
                              parseInt(e.target.value) || 0
                            )
                          }
                          className="input input-bordered w-full"
                          min="1"
                          required
                        />
                      </div>

                      <div className="form-control">
                        <label className="label">
                          <span className="label-text">Rest Duration (seconds)</span>
                        </label>
                        <input
                          type="number"
                          value={exercise.restDuration}
                          onChange={e =>
                            updateExercise(
                              steps[0].id,
                              exercise.id,
                              'restDuration',
                              parseInt(e.target.value) || 0
                            )
                          }
                          className="input input-bordered w-full"
                          min="0"
                          required
                        />
                      </div>

                      <div className="form-control">
                        <label className="label">
                          <span className="label-text">Repetitions</span>
                        </label>
                        <input
                          type="number"
                          value={exercise.repetition}
                          onChange={e =>
                            updateExercise(
                              steps[0].id,
                              exercise.id,
                              'repetition',
                              parseInt(e.target.value) || 1
                            )
                          }
                          className="input input-bordered w-full"
                          min="1"
                          required
                        />
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              <button
                type="button"
                onClick={() => addExercise(steps[0].id)}
                className="btn btn-outline btn-sm btn-accent w-full mt-2"
              >
                <PlusIcon className="h-4 w-4 mr-1" /> Add Exercise
              </button>
            </>
          ) : (
            // Multiple steps mode - Full UI with steps and exercises
            steps.map((step, stepIndex) => (
              <div key={step.id} className="card bg-base-100 shadow-lg">
                <div className="card-body">
                  <div className="flex justify-between items-center">
                    <h2 className="card-title text-secondary">Step {stepIndex + 1}</h2>
                    {steps.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeStep(step.id)}
                        className="btn btn-sm btn-circle btn-ghost text-error"
                      >
                        <XCircleIcon className="h-5 w-5" />
                      </button>
                    )}
                  </div>

                  {/* Step Details */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="form-control">
                      <label className="label">
                        <span className="label-text">Step Name</span>
                      </label>
                      <input
                        type="text"
                        value={step.name}
                        onChange={e => updateStep(step.id, 'name', e.target.value)}
                        className="input input-bordered w-full"
                        placeholder="Enter step name"
                        required
                      />
                    </div>

                    <div className="form-control">
                      <label className="label">
                        <span className="label-text">Repetitions</span>
                      </label>
                      <input
                        type="number"
                        value={step.repetition}
                        onChange={e =>
                          updateStep(step.id, 'repetition', parseInt(e.target.value) || 1)
                        }
                        className="input input-bordered w-full"
                        min="1"
                        required
                      />
                    </div>

                    <div className="form-control">
                      <label className="label">
                        <span className="label-text">Rest Duration (seconds)</span>
                      </label>
                      <input
                        type="number"
                        value={step.restDuration}
                        onChange={e =>
                          updateStep(step.id, 'restDuration', parseInt(e.target.value) || 0)
                        }
                        className="input input-bordered w-full"
                        min="0"
                        required
                      />
                    </div>
                  </div>

                  {/* Exercises */}
                  <div className="divider">Exercises</div>

                  {step.exercises.map((exercise, exIndex) => (
                    <div key={exercise.id} className="card bg-base-300 mb-4">
                      <div className="card-body p-4">
                        <div className="flex justify-between items-center">
                          <h3 className="font-medium">Exercise {exIndex + 1}</h3>
                          {step.exercises.length > 1 && (
                            <button
                              type="button"
                              onClick={() => removeExercise(step.id, exercise.id)}
                              className="btn btn-sm btn-circle btn-ghost text-error"
                            >
                              <XCircleIcon className="h-5 w-5" />
                            </button>
                          )}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                          <div className="form-control">
                            <label className="label">
                              <span className="label-text">Exercise Name</span>
                            </label>
                            <input
                              type="text"
                              value={exercise.name}
                              onChange={e =>
                                updateExercise(step.id, exercise.id, 'name', e.target.value)
                              }
                              className="input input-bordered w-full"
                              placeholder="Enter exercise name"
                              required
                            />
                          </div>

                          <div className="form-control">
                            <label className="label">
                              <span className="label-text">Duration (seconds)</span>
                            </label>
                            <input
                              type="number"
                              value={exercise.duration}
                              onChange={e =>
                                updateExercise(
                                  step.id,
                                  exercise.id,
                                  'duration',
                                  parseInt(e.target.value) || 0
                                )
                              }
                              className="input input-bordered w-full"
                              min="1"
                              required
                            />
                          </div>

                          <div className="form-control">
                            <label className="label">
                              <span className="label-text">Rest Duration (seconds)</span>
                            </label>
                            <input
                              type="number"
                              value={exercise.restDuration}
                              onChange={e =>
                                updateExercise(
                                  step.id,
                                  exercise.id,
                                  'restDuration',
                                  parseInt(e.target.value) || 0
                                )
                              }
                              className="input input-bordered w-full"
                              min="0"
                              required
                            />
                          </div>

                          <div className="form-control">
                            <label className="label">
                              <span className="label-text">Repetitions</span>
                            </label>
                            <input
                              type="number"
                              value={exercise.repetition}
                              onChange={e =>
                                updateExercise(
                                  step.id,
                                  exercise.id,
                                  'repetition',
                                  parseInt(e.target.value) || 1
                                )
                              }
                              className="input input-bordered w-full"
                              min="1"
                              required
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}

                  <button
                    type="button"
                    onClick={() => addExercise(step.id)}
                    className="btn btn-outline btn-sm btn-accent w-full mt-2"
                  >
                    <PlusIcon className="h-4 w-4 mr-1" /> Add Exercise
                  </button>
                </div>
              </div>
            ))
          )}

          {/* Add Step Button - only show in multiple step mode */}
          {isMultiStepMode && (
            <button
              type="button"
              onClick={addStep}
              className="btn btn-outline btn-secondary w-full"
            >
              <PlusIcon className="h-5 w-5 mr-2" /> Add Step
            </button>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting || !isFormValid()}
            className="btn btn-primary w-full"
          >
            {isSubmitting ? (
              <>
                <span className="loading loading-spinner"></span>
                Creating...
              </>
            ) : (
              'Create Timer'
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
