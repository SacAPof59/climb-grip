'use client';

import { Clock, Calendar, Award } from 'lucide-react';
import WeightChartComponent from '@/app/components/dataviz/WeightChartComponent';

interface WorkoutResultCardProps {
  workoutId: string;
  workoutName: string;
  measurementsData: Array<{ sequence: number; data: MeasuredData[] }>;
  workoutSequences: WorkoutTypeSequence[];
  maxWeight: number;
}

export default function WorkoutResultCard({
  workoutId,
  workoutName,
  measurementsData,
  workoutSequences,
  maxWeight,
}: WorkoutResultCardProps) {
  // Format current date
  const currentDate = new Date().toLocaleDateString('en-GB', {
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
      <h3 className="text-xl font-semibold">{workoutName}</h3>

      <div className="mt-4 mb-6">
        <div className="grid grid-cols-3 gap-4 mb-4">
          <div className="flex items-center">
            <Calendar className="mr-2 h-5 w-5 text-primary" />
            <span>{currentDate}</span>
          </div>
          <div className="flex items-center">
            <Clock className="mr-2 h-5 w-5 text-primary" />
            <span>{totalEffortTime} seconds</span>
          </div>
          <div className="flex items-center">
            <Award className="mr-2 h-5 w-5 text-primary" />
            <span>{maxWeight.toFixed(1)} kg</span>
          </div>
        </div>
      </div>

      <div className="h-64 mb-4">
        <WeightChartComponent labels={labels} data={data} />
      </div>
    </div>
  );
}
