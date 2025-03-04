import { NextApiRequest, NextApiResponse } from 'next';
import { XMLParser } from 'fast-xml-parser';
import { Agency, saveAgencies } from '../../db';
import { saveTitleChapterWordCount, saveTitles, Title } from '@/db/titles';

interface AgencyResponse {
  agencies: Agency[];
}

export default async function initialize(req: NextApiRequest, res: NextApiResponse) {
  try {
    await fetchAgencies();
    await fetchTitles();
    res.status(200).json({ message: 'Database initialized successfully' });
  } catch (error) {
    console.error('Error initializing database:', error);
    res.status(500).json({ error: 'Failed to initialize database' });
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
  const titles = data.titles.slice(0, 1); // TODO for dev, only get 1
  await saveTitles(titles);

  for (const title of titles) {
    await fetchTitleBody(title);
  }
}

async function fetchTitleBody(title: Title) {
  const date = '2025-02-28';
  const response = await fetch(
    `https://www.ecfr.gov/api/versioner/v1/full/${date}/title-${title.number}.xml`,
    {
      headers: {
        accept: 'application/xml',
      },
    },
  );
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
      return p;
    });

    // there's more cleanup we can do here
    // for now, keep alphanumeric characters only and only words with 3+ characters
    const wordCount = paragraphsWithText.reduce((acc, p) => {
      const text = p.toLowerCase().replace(/[^a-zA-Z\s]/g, '');
      const words = text.split(/\s+/).filter(Boolean);
      const longWords = words.filter((w: string) => w.length >= 3);
      longWords.forEach((word: string) => {
        acc[word] = (acc[word] || 0) + 1;
      });
      return acc;
    }, {});

    await saveTitleChapterWordCount({
      titleNumber: title.number,
      chapterName: chapter['@_N'],
      wordCount,
    });
  }
}

/* eslint-disable  @typescript-eslint/no-explicit-any */
function nestedObjectSearch(obj: any, key: string, array?: any[]) {
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
