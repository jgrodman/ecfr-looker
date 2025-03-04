import { NextApiRequest, NextApiResponse } from 'next';
import { XMLParser } from 'fast-xml-parser';
import { Agency, saveAgencies } from '../../db';
import { saveTitles, Title } from '@/db/titles';

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

  const date = '2025-02-28';
  for (const title of titles) {
    //curl -X GET "https://www.ecfr.gov/api/versioner/v1/full/2025-02-28/title-1.xml" -H "accept: application/xml"
    const response = await fetch(
      `https://www.ecfr.gov/api/versioner/v1/full/${date}/title-${title.number}.xml`,
      {
        headers: {
          accept: 'application/xml',
        },
      },
    );
    const text = await response.text();

    const parser = new XMLParser();
    const xml = parser.parse(text);
  }
}
