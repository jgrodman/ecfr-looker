import { NextResponse } from 'next/server';
import { XMLParser } from 'fast-xml-parser';
import { Agency, saveAgencies } from '@/db';
import { saveChapterWordCount, saveTitles, Title } from '@/db/titles';

interface AgencyResponse {
  agencies: Agency[];
}

function generateDates(): string[] {
  const dates: string[] = [];
  const endYear = 2025;
  const startYear = endYear - 10;

  for (let year = startYear; year <= endYear; year++) {
    dates.push(`${year}-01-01`);
  }
  return dates;
}

export async function GET() {
  return NextResponse.json({ message: 'Remove me to enable initialization' });
  initializeDb()
    .catch((error) => {
      console.error('Error initializing database:', error);
    })
    .then(() => {
      console.log('Database initialized');
    });

  return NextResponse.json({ message: 'Database initializing' });
}

async function initializeDb() {
  try {
    await fetchAgencies();
    await fetchTitles();
  } catch (error) {
    console.error('Error initializing database:', error);
    throw error;
  }
}

async function fetchAgencies() {
  const response = await fetch('https://www.ecfr.gov/api/admin/v1/agencies.json', {
    headers: {
      accept: 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  const data: AgencyResponse = await response.json();
  await saveAgencies(data.agencies);
}

interface TitleResponse {
  titles: Title[];
}

async function fetchTitles() {
  const response = await fetch('https://www.ecfr.gov/api/versioner/v1/titles.json', {
    headers: {
      accept: 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  const data: TitleResponse = await response.json();
  const titles = data.titles;
  await saveTitles(titles);

  const dates = generateDates();
  for (const title of titles) {
    for (const date of dates) {
      console.log(`Fetching title ${title.number} for date ${date}`);
      await fetchTitleBody(title, date);
    }
  }
}

async function fetchTitleBody(title: Title, date: string) {
  try {
    const response = await fetch(
      `https://www.ecfr.gov/api/versioner/v1/full/${date}/title-${title.number}.xml`,
      {
        headers: {
          accept: 'application/xml',
        },
      },
    );

    if (!response.ok) {
      console.error(`Failed to fetch title ${title.number} for date ${date}: ${response.status}`);
      return;
    }

    const text = await response.text();

    const parser = new XMLParser({
      ignoreAttributes: false,
    });
    const xml = parser.parse(text);

    const chapters = nestedObjectSearch(xml, 'DIV3');
    for (const chapter of chapters) {
      const paragraphs = nestedObjectSearch(chapter, 'p');
      const paragraphsWithText = paragraphs.map((p) => {
        if (typeof p === 'object') {
          return Object.values(p).join(' ');
        }
        return String(p);
      });

      const wordCount = paragraphsWithText.reduce((acc, p) => {
        const text = p.toLowerCase().replace(/[^a-zA-Z'\s]/g, '');
        const words = text.split(/\s+/).filter(Boolean);
        const longWords = words.filter((w: string) => w.length >= 3);
        longWords.forEach((word: string) => {
          acc[word] = (acc[word] || 0) + 1;
        });
        return acc;
      }, {} as Record<string, number>);

      await saveChapterWordCount({
        titleNumber: title.number,
        chapterName: chapter['@_N'],
        wordCount,
        date,
      });
    }
  } catch (error) {
    console.error(`Error processing title ${title.number} for date ${date}:`, error);
  }
}

/* eslint-disable  @typescript-eslint/no-explicit-any */
function nestedObjectSearch(obj: any, key: string, array?: any[]): any[] {
  array = array || [];
  if ('object' === typeof obj) {
    for (const k in obj) {
      if (k.toLowerCase() === key.toLowerCase()) {
        if (Array.isArray(obj[k])) {
          array.push(...obj[k]);
        } else {
          array.push(obj[k]);
        }
      } else {
        nestedObjectSearch(obj[k], key, array);
      }
    }
  }
  return array;
}
