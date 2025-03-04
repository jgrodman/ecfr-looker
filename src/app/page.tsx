import Image from 'next/image';
import { getAgenciesWithWordCounts } from '@/db/agencies';
import { WordCountChart } from './components/WordCountChart';

export default async function Home() {
  const agencies = await getAgenciesWithWordCounts();

  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <main className="flex flex-col gap-8 row-start-2 items-center sm:items-start w-full max-w-6xl">
        <h1 className="text-3xl font-bold">Federal Agencies Word Count Analysis</h1>

        <div className="w-full bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
          <WordCountChart agencies={agencies} />
        </div>

        <div className="w-full">
          <h2 className="text-2xl font-semibold mb-4">Detailed List</h2>
          <ul className="divide-y divide-gray-200 dark:divide-gray-700">
            {agencies.map((agency) => (
              <li key={agency.slug} className="py-4">
                <div className="flex flex-col gap-1">
                  <h3 className="text-lg font-semibold">{agency.display_name || agency.name}</h3>
                  <div className="flex gap-4">
                    {agency.short_name && (
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {agency.short_name}
                      </p>
                    )}
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {agency.total_word_count.toLocaleString()} words
                    </p>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </main>
      <footer className="row-start-3 flex gap-6 flex-wrap items-center justify-center">
        <a
          className="flex items-center gap-2 hover:underline hover:underline-offset-4"
          href="https://nextjs.org/learn?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Image aria-hidden src="/file.svg" alt="File icon" width={16} height={16} />
          Learn
        </a>
        <a
          className="flex items-center gap-2 hover:underline hover:underline-offset-4"
          href="https://vercel.com/templates?framework=next.js&utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Image aria-hidden src="/window.svg" alt="Window icon" width={16} height={16} />
          Examples
        </a>
        <a
          className="flex items-center gap-2 hover:underline hover:underline-offset-4"
          href="https://nextjs.org?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Image aria-hidden src="/globe.svg" alt="Globe icon" width={16} height={16} />
          Go to nextjs.org →
        </a>
      </footer>
    </div>
  );
}
