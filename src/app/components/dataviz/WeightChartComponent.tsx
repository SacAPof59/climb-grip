'use client';

import { useEffect, useState } from 'react';
import { Line } from 'react-chartjs-2';
import type { ChartOptions } from 'chart.js';

interface WeightChartProps {
  labels: string[];
  data: number[];
}

export default function WeightChartComponent({ labels, data }: WeightChartProps) {
  const [chartReady, setChartReady] = useState(false);

  // Filter out any invalid data points
  const validData = data.filter(point => point !== undefined && point !== null);
  const validLabels = labels.slice(0, validData.length);

  useEffect(() => {
    // Register Chart.js components only on the client side
    import('chart.js').then(
      ({
        Chart,
        CategoryScale,
        LinearScale,
        PointElement,
        LineElement,
        Title,
        Tooltip,
        Legend,
      }) => {
        Chart.register(
          CategoryScale,
          LinearScale,
          PointElement,
          LineElement,
          Title,
          Tooltip,
          Legend
        );
        setChartReady(true);
      }
    );
  }, []);

  const chartData = {
    labels: validLabels,
    datasets: [
      {
        label: 'Weight (kg)',
        data: validData,
        borderColor: 'rgb(75, 192, 192)',
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        tension: validData.length > 2 ? 0.1 : 0,
      },
    ],
  };

  const chartOptions: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    elements: {
      point: {
        radius: 2,
      },
      line: {
        cubicInterpolationMode: 'monotone' as const, // Type assertion to make it a literal
      },
    },
    plugins: {
      legend: {
        display: false,
      },
    },
    scales: {
      x: { title: { display: true, text: 'Time (seconds)' } },
      y: { title: { display: true, text: 'Weight (kg)' } },
    },
  };

  return (
    <div className="h-full mt-2">
      {validData.length > 0 && chartReady ? (
        <Line data={chartData} options={chartOptions} />
      ) : (
        <div className="flex items-center justify-center h-full text-gray-500">
          {validData.length === 0 ? 'No data recorded yet' : 'Loading chart...'}
        </div>
      )}
    </div>
  );
}
