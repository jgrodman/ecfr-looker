'use client';

import { useState } from 'react';
import type { AgencyWithWordCount } from '@/db/agencies';
import { WordCountChart } from './WordCountChart';
import { WordFrequencyChart } from './WordFrequencyChart';
import { AgencyList } from './AgencyList';
import { Tabs } from './Tabs';

const tabs = [
  { id: 'list', label: 'Agency List' },
  { id: 'frequency', label: 'Most Common Words' },
  { id: 'overview', label: 'Word Count by Agency' },
];

export function TabContainer({ agencies }: { agencies: AgencyWithWordCount[] }) {
  const [activeTab, setActiveTab] = useState(tabs[0].id);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
      <Tabs tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} />

      <div className="mt-6">
        {activeTab === 'list' && <AgencyList agencies={agencies} />}
        {activeTab === 'overview' && <WordCountChart agencies={agencies} />}
        {activeTab === 'frequency' && <WordFrequencyChart agencies={agencies} />}
      </div>
    </div>
  );
}
