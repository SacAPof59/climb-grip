// src/app/components/TimerDescriptionCard.tsx
'use client';

import Link from 'next/link';
import { Trash2Icon, PlayIcon, MoonIcon, CopyIcon } from 'lucide-react';

interface TimerDescriptionCardProps {
  timer: Timer;
  onDelete: (timerId: string) => Promise<void>;
}

export default function TimerDescriptionCard({ timer, onDelete }: TimerDescriptionCardProps) {
  function calculateStepDuration(step: TimerStep) {
    let totalSeconds = 0;

    for (let i = 0; i < step.repetition; i++) {
      step.exercises.forEach(exercise => {
        for (let j = 0; j < exercise.repetition; j++) {
          totalSeconds += exercise.duration;
          totalSeconds += exercise.restDuration;
        }
      });

      if (i < step.repetition - 1) {
        totalSeconds += step.restDuration;
      }
    }

    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  }

  return (
    <div className="card bg-base-100 shadow-lg hover:shadow-xl border border-base-300">
      <div className="card-body">
        {/* Timer name */}
        <h2 className="text-xl font-bold text-primary text-center border-b pb-2">{timer.name}</h2>

        <div className="flex items-center justify-between w-full my-2">
          <div className="badge badge-primary badge-lg">{timer.duration}</div>
          <p className="text-xs text-base-content/70 text-right min-w-[80px]">
            {timer.createdAt
              ? new Date(timer.createdAt).toLocaleDateString()
              : 'Date not available'}
          </p>
        </div>

        {/* Steps with accordion or direct exercises */}
        {timer.steps.length === 1 ? (
          <div className="mt-3">
            <div className="space-y-2">
              {timer.steps[0].exercises.map(exercise => (
                <div key={exercise.id + exercise.name} className="bg-base-200 rounded-md p-2">
                  <p className="font-medium">{exercise.name}</p>
                  <div className="flex flex-wrap gap-2 mt-1 items-center">
                    <span key="duration" className="badge badge-primary">
                      {exercise.duration}s
                    </span>
                    {exercise.restDuration > 0 && (
                      <span key="rest" className="badge badge-outline badge-info flex items-center">
                        <MoonIcon className="h-3 w-3 mr-1" /> {exercise.restDuration}s
                      </span>
                    )}
                    <span key="repetition" className="text-xs">
                      ×{exercise.repetition}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="mt-3 space-y-2">
            {timer.steps.map(step => (
              <details key={step.id + step.name} className="collapse collapse-arrow bg-base-200">
                <summary className="collapse-title py-3 px-4 min-h-[3rem] flex items-center">
                  <div className="flex items-center w-full">
                    <span className="flex-grow font-medium">{step.name}</span>
                    <div className="flex items-center gap-2 pr-6">
                      <span className="badge badge-sm badge-primary">
                        {calculateStepDuration(step)}
                      </span>
                      {step.repetition > 1 && (
                        <span className="badge badge-sm">×{step.repetition}</span>
                      )}
                      {step.restDuration > 0 && (
                        <span className="badge badge-sm badge-outline badge-info flex items-center">
                          <MoonIcon className="h-3 w-3 mr-1" /> {step.restDuration}s
                        </span>
                      )}
                    </div>
                  </div>
                </summary>

                <div className="collapse-content px-4">
                  <div className="space-y-2 pt-2">
                    {step.exercises.map(exercise => (
                      <div
                        key={exercise.id + exercise.name}
                        className="bg-base-100 rounded-md p-2 flex flex-col justify-center"
                      >
                        <p className="font-medium">{exercise.name}</p>
                        <div className="flex flex-wrap gap-2 mt-1 items-center">
                          <span key="duration" className="badge badge-primary">
                            {exercise.duration}s
                          </span>
                          {exercise.restDuration > 0 && (
                            <span
                              key="rest"
                              className="badge badge-outline badge-info flex items-center"
                            >
                              <MoonIcon className="h-3 w-3 mr-1" /> {exercise.restDuration}s
                            </span>
                          )}
                          <span key="repetition" className="text-xs">
                            ×{exercise.repetition}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </details>
            ))}
          </div>
        )}

        <div className="divider my-2"></div>

        <div className="card-actions justify-between items-center mt-2">
          <div className="flex">
            <div>
              {/* Delete button that opens modal */}
              <label
                htmlFor={`delete-modal-${timer.id}`}
                className="btn btn-sm btn-circle btn-error btn-outline"
              >
                <Trash2Icon className="h-4 w-4" />
              </label>

              {/* Modal for confirmation */}
              <input type="checkbox" id={`delete-modal-${timer.id}`} className="modal-toggle" />
              <div className="modal" role="dialog">
                <div className="modal-box">
                  <h3 className="font-bold text-lg">Confirm Deletion</h3>
                  <p className="py-4">
                    Are you sure you want to delete &ldquo;{timer.name}&rdquo;? This action cannot
                    be undone.
                  </p>
                  <div className="modal-action">
                    <label htmlFor={`delete-modal-${timer.id}`} className="btn">
                      Cancel
                    </label>
                    <button
                      onClick={async () => {
                        await onDelete(timer.id);
                      }}
                      className="btn btn-error"
                    >
                      Delete Timer
                    </button>
                  </div>
                </div>
                <label className="modal-backdrop" htmlFor={`delete-modal-${timer.id}`}></label>
              </div>
            </div>

            <Link
              href={`/timer/create?copy=${timer.id}`}
              className="btn btn-sm btn-circle btn-outline ml-2"
            >
              <CopyIcon className="h-4 w-4" />
            </Link>
          </div>

          <Link href={`/timer/${timer.id}`} className="btn btn-sm btn-primary flex-1 ml-2">
            <PlayIcon className="h-4 w-4 mr-1" />
            Start Timer
          </Link>
        </div>
      </div>
    </div>
  );
}
