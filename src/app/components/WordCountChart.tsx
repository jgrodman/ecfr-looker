'use client';

import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import type { AgencyWithWordCount } from '@/db/agencies';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      display: false,
    },
    title: {
      display: true,
      text: 'Word Count by Agency across all titles',
      font: {
        size: 16,
      },
    },
  },
  scales: {
    y: {
      title: {
        display: true,
        text: 'Word Count',
      },
    },
  },
};

export function WordCountChart({ agencies }: { agencies: AgencyWithWordCount[] }) {
  const sortedAgencies = [...agencies].sort((a, b) => b.total_word_count - a.total_word_count);

  const data = {
    labels: sortedAgencies.map((agency) => agency.display_name || agency.name),
    datasets: [
      {
        data: sortedAgencies.map((agency) => agency.total_word_count),
        backgroundColor: 'rgba(53, 162, 235, 0.5)',
        borderColor: 'rgb(53, 162, 235)',
        borderWidth: 1,
      },
    ],
  };

  return (
    <div className="w-full h-[600px]">
      <Bar options={chartOptions} data={data} />
    </div>
  );
}
