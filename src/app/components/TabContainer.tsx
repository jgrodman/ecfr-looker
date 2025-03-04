'use client';

import { useState } from 'react';
import type { AgencyWithWordCount, WordCount } from '@/db/agencies';
import { WordCountChart } from './WordCountChart';
import { WordFrequencyChart } from './WordFrequencyChart';
import { AgencyList } from './AgencyList';
import { Tabs } from './Tabs';

const tabs = [
  { id: 'list', label: 'Agency List' },
  { id: 'frequency', label: 'Most Common Words' },
  { id: 'overview', label: 'Word Count by Agency' },
];

interface TabContainerProps {
  agencies: AgencyWithWordCount[];
  wordCountsByAgency: Map<number, WordCount[]>;
  availableDates: string[];
}

export function TabContainer({ agencies, wordCountsByAgency, availableDates }: TabContainerProps) {
  const [activeTab, setActiveTab] = useState(tabs[0].id);
  const [selectedDate, setSelectedDate] = useState<string>(availableDates[0] || '');

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
      <div className="flex items-center gap-4 mb-6">
        <Tabs tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} />
        <div className="w-48">
          <select
            className="w-full p-2 border rounded-md bg-white dark:bg-gray-800 dark:border-gray-700"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
          >
            {availableDates.map((date) => (
              <option key={date} value={date}>
                {new Date(date).toLocaleDateString()}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="mt-6">
        {activeTab === 'list' && <AgencyList agencies={agencies} />}
        {activeTab === 'overview' && <WordCountChart agencies={agencies} />}
        {activeTab === 'frequency' && (
          <WordFrequencyChart
            agencies={agencies}
            wordCountsByAgency={wordCountsByAgency}
            selectedDate={selectedDate}
          />
        )}
      </div>
    </div>
  );
}
