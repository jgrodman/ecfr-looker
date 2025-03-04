import { getAgenciesWithWordCounts, getAgencyWordCounts, getAllDates } from '@/db/agencies';
import { TabContainer } from './components/TabContainer';
import type { AgencyWithWordCount, WordCount } from '@/db/agencies';

export default async function Home() {
  let agencies: AgencyWithWordCount[] = [];
  const wordCountsByAgency = new Map<number, WordCount[]>();
  let dates: string[] = [];

  try {
    [agencies, dates] = await Promise.all([getAgenciesWithWordCounts(), getAllDates()]);
    // Pre-fetch word counts for all agencies
    for (const agency of agencies) {
      const wordCounts = await getAgencyWordCounts(agency.id);
      wordCountsByAgency.set(agency.id, wordCounts);
    }
  } catch (error) {
    console.error('Error fetching data:', error);
  }

  return (
    <div className="min-h-screen p-8 pb-20 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <main className="max-w-6xl mx-auto">
        {agencies.length === 0 && (
          <div className="text-sm text-amber-600 dark:text-amber-400 font-medium mb-4">
            Database initializing
          </div>
        )}
        <h1 className="text-3xl font-bold mb-8">Federal Agencies Word Count Analysis</h1>
        <TabContainer
          agencies={agencies}
          wordCountsByAgency={wordCountsByAgency}
          availableDates={dates}
        />
      </main>
    </div>
  );
}
