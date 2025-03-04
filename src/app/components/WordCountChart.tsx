'use client';

import { useState, useEffect } from 'react';
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
import type { AgencyWithWordCount, WordCount } from '@/db/agencies';

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
      text: 'Word Count by Agency',
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

const histogramOptions = {
  ...chartOptions,
  plugins: {
    ...chartOptions.plugins,
    title: {
      ...chartOptions.plugins.title,
      text: 'Most Common Words',
    },
  },
  scales: {
    y: {
      title: {
        display: true,
        text: 'Frequency',
      },
    },
  },
};

interface Props {
  agencies: AgencyWithWordCount[];
}

export function WordCountChart({ agencies }: Props) {
  const [selectedAgencyId, setSelectedAgencyId] = useState<number | null>(null);
  const [wordCounts, setWordCounts] = useState<WordCount[]>([]);

  useEffect(() => {
    async function fetchWordCounts() {
      if (selectedAgencyId === null) return;

      const response = await fetch(`/api/agencies/${selectedAgencyId}/words`);
      const data = await response.json();
      setWordCounts(data);
    }

    fetchWordCounts();
  }, [selectedAgencyId]);

  const agencyData = {
    labels: agencies.map((agency) => agency.display_name || agency.name),
    datasets: [
      {
        data: agencies.map((agency) => agency.total_word_count),
        backgroundColor: 'rgba(53, 162, 235, 0.5)',
        borderColor: 'rgb(53, 162, 235)',
        borderWidth: 1,
      },
    ],
  };

  const histogramData = {
    labels: wordCounts.map((wc) => wc.word),
    datasets: [
      {
        data: wordCounts.map((wc) => wc.count),
        backgroundColor: 'rgba(75, 192, 192, 0.5)',
        borderColor: 'rgb(75, 192, 192)',
        borderWidth: 1,
      },
    ],
  };

  return (
    <div className="flex flex-col gap-8">
      <div className="flex gap-4 items-start">
        <div className="w-64">
          <label className="block text-sm font-medium mb-2" htmlFor="agency-select">
            Select Agency
          </label>
          <select
            id="agency-select"
            className="w-full p-2 border rounded-md bg-white dark:bg-gray-800 dark:border-gray-700"
            onChange={(e) => setSelectedAgencyId(Number(e.target.value))}
            value={selectedAgencyId || ''}
          >
            <option value="">Select an agency...</option>
            {agencies.map((agency) => (
              <option key={agency.slug} value={agency.id}>
                {agency.display_name || agency.name}
              </option>
            ))}
          </select>
        </div>
        <div className="flex-1">
          <div className="h-[400px]">
            <Bar options={chartOptions} data={agencyData} />
          </div>
        </div>
      </div>

      {selectedAgencyId && wordCounts.length > 0 && (
        <div className="h-[400px]">
          <Bar options={histogramOptions} data={histogramData} />
        </div>
      )}
    </div>
  );
}
