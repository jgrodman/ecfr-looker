import { NextApiRequest, NextApiResponse } from 'next';
import { Agency, initializeDatabase, saveAgencies } from '../../db';

interface AgencyResponse {
  agencies: Agency[];
}

export default async function initialize(req: NextApiRequest, res: NextApiResponse) {
  try {
    await initializeDatabase();
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

interface Title {
  number: number;
  name: string;
  latest_amended_on: string;
  latest_issue_date: string;
  up_to_date_as_of: string;
  reserved: boolean;
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

  console.log(data);
}
