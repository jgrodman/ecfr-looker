import type { AgencyWithWordCount } from '@/db/agencies';

export function AgencyList({ agencies }: { agencies: AgencyWithWordCount[] }) {
  return (
    <div className="w-full">
      <ul className="divide-y divide-gray-200 dark:divide-gray-700">
        {agencies.map((agency) => (
          <li key={agency.slug} className="py-4">
            <div className="flex flex-col gap-1">
              <h3 className="text-lg font-semibold">{agency.display_name || agency.name}</h3>
              <div className="flex gap-4">
                {agency.short_name && (
                  <p className="text-sm text-gray-500 dark:text-gray-400">{agency.short_name}</p>
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
  );
}
