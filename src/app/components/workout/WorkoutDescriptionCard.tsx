// src/app/components/workout/WorkoutDescriptionCard.tsx
import Link from 'next/link';
import { useMemo } from 'react';

interface WorkoutDescriptionCardProps {
  workoutType: WorkoutType;
}

export default function WorkoutDescriptionCard({ workoutType }: WorkoutDescriptionCardProps) {
  // Calculate total time (sum of all sequence durations)
  const totalTime = workoutType.workoutTypeSequences.reduce(
    (sum, sequence) => sum + sequence.duration,
    0
  );

  // Format time into minutes and seconds
  const formatTime = useMemo(() => {
    return (seconds: number) => {
      const mins = Math.floor(seconds / 60);
      const secs = seconds % 60;
      return `${mins}:${secs.toString().padStart(2, '0')}`;
    };
  }, []);

  return (
    <div className="card bg-base-100 shadow-xl">
      <div className="card-body">
        <h2 className="card-title">{workoutType.name}</h2>
        {workoutType.description && (
          <p className="text-sm text-base-content/80">{workoutType.description}</p>
        )}

        <div className="mt-2 mb-4">
          <div className="badge badge-secondary">{formatTime(totalTime)}</div>
          <div className="badge badge-outline ml-2">
            {workoutType.workoutTypeSequences.length} sequences
          </div>
        </div>

        <div className="collapse collapse-arrow bg-base-200 mt-2">
          <input type="checkbox" />
          <div className="collapse-title font-medium">View Sequences</div>
          <div className="collapse-content">
            <div className="overflow-x-auto">
              <table className="table table-xs">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Type</th>
                    <th>Duration</th>
                    <th>Instruction</th>
                  </tr>
                </thead>
                <tbody>
                  {workoutType.workoutTypeSequences.map(sequence => (
                    <tr
                      key={sequence.sequence}
                      className={
                        sequence.sequenceType === 'REST' ? 'text-secondary' : 'text-primary'
                      }
                    >
                      <td>{sequence.sequence}</td>
                      <td>{sequence.sequenceType}</td>
                      <td>{formatTime(sequence.duration)}</td>
                      <td>{sequence.instruction || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="card-actions justify-end mt-4">
          <Link
            href={`/workout/${encodeURIComponent(workoutType.name)}`}
            className="btn btn-primary btn-sm"
          >
            Select
          </Link>
        </div>
      </div>
    </div>
  );
}
