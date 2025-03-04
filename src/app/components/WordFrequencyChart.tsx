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

const DEFAULT_IGNORED_WORDS = new Set(['the', 'and', 'for', 'this', 'with', 'that', 'which']);

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
  const [ignoredWords, setIgnoredWords] = useState<Set<string>>(DEFAULT_IGNORED_WORDS);
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

  // Filter out ignored words
  const filteredWordCounts = wordCounts.filter((wc) => !ignoredWords.has(wc.word.toLowerCase()));

  const data = {
    labels: filteredWordCounts.map((wc) => wc.word),
    datasets: [
      {
        data: filteredWordCounts.map((wc) => wc.count),
        backgroundColor: 'rgba(75, 192, 192, 0.5)',
        borderColor: 'rgb(75, 192, 192)',
        borderWidth: 1,
      },
    ],
  };

  // Toggle a word in the ignored set
  const toggleIgnoredWord = (word: string) => {
    const newIgnoredWords = new Set(ignoredWords);
    if (newIgnoredWords.has(word)) {
      newIgnoredWords.delete(word);
    } else {
      newIgnoredWords.add(word);
    }
    setIgnoredWords(newIgnoredWords);
  };

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-4">
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

        {wordCounts.length > 0 && (
          <div className="w-full">
            <label className="block text-sm font-medium mb-2">Words to Ignore</label>
            <div className="flex flex-wrap gap-2 max-h-40 overflow-y-auto p-2 rounded-md bg-white dark:bg-gray-800">
              {wordCounts.map((wc) => (
                <button
                  key={wc.word}
                  onClick={() => toggleIgnoredWord(wc.word.toLowerCase())}
                  className={`px-2 py-1 text-sm rounded-full transition-colors ${
                    ignoredWords.has(wc.word.toLowerCase())
                      ? 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                      : 'bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
                  }`}
                >
                  {wc.word}
                  <span className="ml-1 text-xs text-gray-500">({wc.count})</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {selectedAgency && (
        <div className="text-sm text-gray-500 dark:text-gray-400">
          Showing word frequencies for {selectedAgency.display_name || selectedAgency.name}
          {ignoredWords.size > 0 && (
            <span className="ml-1">
              (ignoring {ignoredWords.size} common {ignoredWords.size === 1 ? 'word' : 'words'})
            </span>
          )}
        </div>
      )}

      {selectedAgencyId && filteredWordCounts.length > 0 ? (
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
