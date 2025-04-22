'use client';

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

interface WeightChartProps {
  labels: string[];
  data: number[];
}

export default function WeightChartComponent({ labels, data }: WeightChartProps) {
  const chartData = {
    labels,
    datasets: [
      {
        label: 'Weight (kg)',
        data,
        borderColor: 'rgb(75, 192, 192)',
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        tension: 0.1,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false, // This allows the chart to fill the container
    elements: {
      point: {
        radius: 0, // Hide points
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
      {data.length > 0 ? (
        <Line data={chartData} options={chartOptions} />
      ) : (
        <div className="flex items-center justify-center h-full text-gray-500">
          No data recorded yet
        </div>
      )}
    </div>
  );
}
