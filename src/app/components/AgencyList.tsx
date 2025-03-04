'use client';

import { useState } from 'react';
import type { AgencyWithWordCount } from '@/db/agencies';

interface CfrRef {
  title: number;
  chapter: string;
}

// Extend AgencyWithWordCount to include cfr_references
interface AgencyWithRefs extends AgencyWithWordCount {
  cfr_references: CfrRef[];
  id: number;
}

export function AgencyList({ agencies }: { agencies: AgencyWithRefs[] }) {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredAgencies = agencies.filter((agency) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      (agency.display_name || agency.name).toLowerCase().includes(searchLower) ||
      (agency.short_name || '').toLowerCase().includes(searchLower)
    );
  });

  return (
    <div className="flex gap-8">
      {/* Search bar */}
      <div className="w-64 shrink-0">
        <div className="sticky top-8">
          <label htmlFor="search" className="block text-sm font-medium mb-2">
            Search Agencies
          </label>
          <input
            type="search"
            id="search"
            className="w-full p-2 border rounded-md"
            placeholder="Enter agency name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Content box */}
      <div className="flex-1">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
          <ul className="divide-y divide-gray-200 dark:divide-gray-700">
            {filteredAgencies.map((agency) => {
              // Remove duplicate references
              const uniqueRefs = (agency.cfr_references || []).reduce(
                (acc: Map<string, CfrRef>, ref: CfrRef) => {
                  const key = `${ref.title}-${ref.chapter}`;
                  if (!acc.has(key)) {
                    acc.set(key, ref);
                  }
                  return acc;
                },
                new Map(),
              );

              return (
                <li key={agency.slug} className="py-6 first:pt-0 last:pb-0">
                  <div className="flex flex-col gap-3">
                    <h3 className="text-2xl font-semibold">{agency.display_name || agency.name}</h3>
                    {agency.short_name && (
                      <p className="text-lg text-gray-600 dark:text-gray-300">
                        {agency.short_name}
                      </p>
                    )}

                    {uniqueRefs.size > 0 && (
                      <div>
                        <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          CFR References:
                        </h4>
                        <ul className="space-y-1">
                          {Array.from(uniqueRefs.values())
                            .sort(
                              (a: CfrRef, b: CfrRef) =>
                                a.title - b.title || a.chapter.localeCompare(b.chapter),
                            )
                            .map((ref: CfrRef) => (
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
      </div>
    </div>
  );
}
