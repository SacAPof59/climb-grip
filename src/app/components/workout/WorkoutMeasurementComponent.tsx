'use client';

import { useState, useEffect, useRef } from 'react';
import WeightChartComponent from '@/app/components/dataviz/WeightChartComponent';

interface WorkoutMeasurementProps {
  weight: string;
  currentSequence: number;
  isRunning: boolean;
  isCountdownActive?: boolean;
  onMeasurementUpdate?: (measurementData: Map<number, MeasuredData[]>) => void;
}

export default function WorkoutMeasurementComponent({
  weight,
  currentSequence,
  isRunning,
  isCountdownActive,
  onMeasurementUpdate,
}: WorkoutMeasurementProps) {
  // Store measurements by sequence number
  const [measurementsBySequence, setMeasurementsBySequence] = useState<Map<number, MeasuredData[]>>(
    new Map()
  );

  // Track maximum weight
  const [maxWeight, setMaxWeight] = useState<number>(0);

  // Add a ref to track the latest weight value
  const weightRef = useRef(weight);

  // Update the ref whenever weight changes
  useEffect(() => {
    weightRef.current = weight;

    // Update maxWeight if the new weight is greater
    const parsedWeight = parseFloat(weight);
    if (!isNaN(parsedWeight) && parsedWeight > maxWeight) {
      setMaxWeight(parsedWeight);
    }
  }, [weight, maxWeight]);

  // Add a ref to track the latest currentSequence value
  const currentSequenceRef = useRef(currentSequence);

  // Update the ref whenever currentSequence changes
  useEffect(() => {
    currentSequenceRef.current = currentSequence;
  }, [currentSequence]);

  // Recording state refs
  const recordingStartTimeRef = useRef<number | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const iterationCounterRef = useRef<number>(0);

  useEffect(() => {
    if (isCountdownActive) return;

    if (isRunning) {
      if (timerRef.current) {
        stopRecording();
      }
      startRecording();
    } else {
      // Pause recording when not running
      if (timerRef.current) {
        stopRecording();
      }
    }
  }, [currentSequence, isRunning, isCountdownActive]);

  const startRecording = () => {
    recordingStartTimeRef.current = Date.now();
    iterationCounterRef.current = 0;

    // Record at 10Hz (100ms intervals)
    timerRef.current = setInterval(() => {
      // Use ref value to get latest weight
      const currentWeight = parseFloat(weightRef.current) || 0;
      const timestamp = Date.now() - (recordingStartTimeRef.current || Date.now());

      setMeasurementsBySequence(prevMap => {
        // Create a completely new Map instance
        const newMap = new Map([...prevMap.entries()]);
        // Make a copy of the current sequence data array
        const sequenceData = [...(newMap.get(currentSequenceRef.current) || [])];
        sequenceData.push({
          sequence: currentSequenceRef.current,
          iteration: iterationCounterRef.current++,
          weight: currentWeight,
          timestamp,
        });
        // Set the updated data in the new Map
        newMap.set(currentSequenceRef.current, sequenceData);

        return newMap;
      });
    }, 100); // 10Hz = 100ms
  };

  // Remove references to displayedSequence in stopRecording
  const stopRecording = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
      // Remove the setDisplayedSequence call here
    }
  };

  const getChartArrays = () => {
    if (measurementsBySequence.size === 0) {
      return { labels: [], data: [] };
    }

    const allDataPoints: MeasuredData[] = [];
    measurementsBySequence.forEach(sequenceData => {
      allDataPoints.push(...sequenceData);
    });

    const labels = allDataPoints.map(d => (d.timestamp / 1000).toFixed(1));
    const data = allDataPoints.map(d => d.weight);

    return { labels, data };
  };

  useEffect(() => {
    if (onMeasurementUpdate) {
      onMeasurementUpdate(measurementsBySequence);
    }
  }, [measurementsBySequence, onMeasurementUpdate]);

  const { labels, data } = getChartArrays();

  // Add a separate useEffect specifically for cleanup on unmount
  useEffect(() => {
    // This will run when the component unmounts
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, []); // Empty dependency array means this effect runs only on mount/unmount

  return (
    <div>
      <div className="text-3xl font-bold text-center mt-2">
        {weight !== '--' ? `${weight} kg` : '--'}
      </div>
      <WeightChartComponent labels={labels} data={data} />
      <div className="text-xl font-semibold text-center mt-2">
        Max: {maxWeight > 0 ? `${maxWeight.toFixed(1)} kg` : '--'}
      </div>
    </div>
  );
}
