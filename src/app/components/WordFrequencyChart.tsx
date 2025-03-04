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
      text: 'Most Common Words',
      font: {
        size: 16,
      },
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

export function WordFrequencyChart({ agencies }: { agencies: AgencyWithWordCount[] }) {
  const [selectedAgencyId, setSelectedAgencyId] = useState<number | null>(null);
  const [wordCounts, setWordCounts] = useState<WordCount[]>([]);
  const selectedAgency = agencies.find((a) => a.id === selectedAgencyId);

  useEffect(() => {
    async function fetchWordCounts() {
      if (selectedAgencyId === null) return;

      const response = await fetch(`/api/agencies/${selectedAgencyId}/words`);
      const data = await response.json();
      setWordCounts(data);
    }

    fetchWordCounts();
  }, [selectedAgencyId]);

  const data = {
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

      {selectedAgency && (
        <div className="text-sm text-gray-500 dark:text-gray-400">
          Showing word frequencies for {selectedAgency.display_name || selectedAgency.name}
        </div>
      )}

      {selectedAgencyId && wordCounts.length > 0 ? (
        <div className="w-full h-[600px]">
          <Bar options={chartOptions} data={data} />
        </div>
      ) : (
        <div className="text-center text-gray-500 dark:text-gray-400 py-8">
          {selectedAgencyId ? 'Loading...' : 'Select an agency to view word frequencies'}
        </div>
      )}
    </div>
  );
}
