import { NextApiRequest, NextApiResponse } from 'next';
import { Agency, initializeDatabase, saveAgencies } from '../../db';

interface AgencyResponse {
  agencies: Agency[];
}

export default async function initialize(req: NextApiRequest, res: NextApiResponse) {
  try {
    await initializeDatabase();
    await agencies();
    res.status(200).json({ message: 'Database initialized successfully' });
  } catch (error) {
    console.error('Error initializing database:', error);
    res.status(500).json({ error: 'Failed to initialize database' });
  }
}

async function agencies() {
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
