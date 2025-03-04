import { getAgenciesWithWordCounts } from '@/db/agencies';
import { TabContainer } from './components/TabContainer';

export default async function Home() {
  const agencies = await getAgenciesWithWordCounts();

  return (
    <div className="min-h-screen p-8 pb-20 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <main className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Federal Agencies Word Count Analysis</h1>
        <TabContainer agencies={agencies} />
      </main>
    </div>
  );
}
