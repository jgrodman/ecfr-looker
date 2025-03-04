import type { AgencyWithWordCount } from '@/db/agencies';

export function AgencyList({ agencies }: { agencies: AgencyWithWordCount[] }) {
  return (
    <div className="w-full">
      <ul className="divide-y divide-gray-200 dark:divide-gray-700">
        {agencies.map((agency) => {
          // Remove duplicate references
          const uniqueRefs = agency.cfr_refs.reduce((acc, ref) => {
            const key = `${ref.title}-${ref.chapter}`;
            if (!acc.has(key)) {
              acc.set(key, ref);
            }
            return acc;
          }, new Map());

          return (
            <li key={agency.slug} className="py-6">
              <div className="flex flex-col gap-3">
                <h3 className="text-2xl font-semibold">{agency.display_name || agency.name}</h3>
                {agency.short_name && (
                  <p className="text-lg text-gray-600 dark:text-gray-300">{agency.short_name}</p>
                )}

                {uniqueRefs.size > 0 && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      CFR References:
                    </h4>
                    <ul className="space-y-1">
                      {Array.from(uniqueRefs.values())
                        .sort((a, b) => a.title - b.title || a.chapter.localeCompare(b.chapter))
                        .map((ref) => (
                          <li
                            key={`${agency.id}-${ref.title}-${ref.chapter}`}
                            className="text-sm text-gray-600 dark:text-gray-400"
                          >
                            Title {ref.title}, Chapter {ref.chapter}
                          </li>
                        ))}
                    </ul>
                  </div>
                )}
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
