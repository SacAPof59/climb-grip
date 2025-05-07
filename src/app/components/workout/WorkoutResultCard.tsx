'use client';

import { Clock, Award } from 'lucide-react';
import BodyWeightPercentChartComponent from '@/app/components/dataviz/BodyWeightPercentChartComponent';

interface WorkoutResultCardProps {
  workoutId: string;
  workoutName: string;
  measurementsData: Array<{ sequence: number; data: MeasuredData[] }>;
  workoutSequences: WorkoutTypeSequence[];
  maxWeight: number;
  bodyWeight: number;
  maxIsoForce?: number;
  criticalForce?: number;
  maxForceForCF?: number;
  wPrime?: number;
}

export default function WorkoutResultCard({
  workoutId,
  workoutName,
  measurementsData,
  workoutSequences,
  maxWeight,
  bodyWeight,
  maxIsoForce,
  criticalForce,
  maxForceForCF,
  wPrime,
}: WorkoutResultCardProps) {
  // Format current date
  const currentDate = new Date().toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });

  // Prepare data for chart - include all sequences
  const getAllChartData = () => {
    const allData: MeasuredData[] = [];
    let lastTimestamp = 0;

    // Process each sequence in order
    workoutSequences.forEach(sequence => {
      // Find measurements for this sequence
      const sequenceData = measurementsData.find(m => m.sequence === sequence.sequence);

      if (sequenceData && sequenceData.data.length > 0) {
        // Adjust timestamps to be continuous
        const adjustedData = sequenceData.data.map(point => ({
          ...point,
          timestamp: lastTimestamp + point.timestamp,
        }));

        allData.push(...adjustedData);

        // Update last timestamp for next sequence
        const lastPoint = adjustedData[adjustedData.length - 1];
        if (lastPoint) lastTimestamp = lastPoint.timestamp;
      } else if (sequence.recordForce) {
        // For effort sequences with no data, add placeholder points
        allData.push({
          sequence: sequence.sequence,
          iteration: 0,
          weight: 0,
          timestamp: lastTimestamp,
        });

        // Add another point at the end of sequence duration
        allData.push({
          sequence: sequence.sequence,
          iteration: 1,
          weight: 0,
          timestamp: lastTimestamp + sequence.duration * 1000,
        });

        lastTimestamp += sequence.duration * 1000;
      }
    });

    const labels = allData.map(d => (d.timestamp / 1000).toFixed(1));
    const data = allData.map(d => d.weight);

    return { labels, data };
  };

  const { labels, data } = getAllChartData();

  // Calculate statistics
  const totalEffortTime = workoutSequences.reduce((sum, seq) => sum + seq.duration, 0);

  return (
    <div className="bg-base-100 rounded-xl shadow-lg p-6" data-workout-id={workoutId}>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-semibold">{workoutName}</h3>
        <div className="badge badge-neutral">{currentDate}</div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="flex items-center">
          <Clock className="mr-2 h-5 w-5 text-primary" />
          <span>{totalEffortTime} seconds</span>
        </div>
        <div className="flex items-center">
          <Award className="mr-2 h-5 w-5 text-primary" />
          <span>{maxWeight.toFixed(1)} kg</span>
        </div>
      </div>

      {/* Stats container with centering */}
      <div className="flex flex-col items-center gap-4 mb-6">
        {/* Max isometrics strength stat */}
        {maxIsoForce && (
          <div className="stat bg-base-200 rounded-box w-full max-w-md">
            <div className="stat-title">Max Isometrics</div>
            <div className="stat-value text-primary">
              {((maxIsoForce / bodyWeight) * 100).toFixed(0)}%
            </div>
            <div className="stat-desc">{maxIsoForce.toFixed(1)} kg</div>
          </div>
        )}

        {/* Critical force stats */}
        {criticalForce && (
          <div className="flex flex-col sm:flex-row gap-2 w-full max-w-md">
            {/* Main Critical Force stat */}
            <div className="stat bg-base-200 rounded-box flex-1">
              <div className="stat-title">Critical Force</div>
              <div className="stat-value text-secondary">
                {((criticalForce / bodyWeight) * 100).toFixed(2)}%
              </div>
              <div className="stat-desc">
                {criticalForce.toFixed(1)} kg
                {wPrime && <> | W&apos;: {wPrime.toFixed(1)} J</>}
              </div>
            </div>

            {/* Max Force for CF as a separate stat */}
            {maxForceForCF && (
              <div className="stat bg-base-200 rounded-box flex-none">
                <div className="stat-title">Max Force</div>
                <div className="stat-value text-accent text-2xl">
                  {((maxForceForCF / bodyWeight) * 100).toFixed(2)}%
                </div>
                <div className="stat-desc">{maxForceForCF.toFixed(1)} kg</div>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="h-64 mb-4">
        <BodyWeightPercentChartComponent labels={labels} data={data} bodyWeight={bodyWeight} />
      </div>
    </div>
  );
}
