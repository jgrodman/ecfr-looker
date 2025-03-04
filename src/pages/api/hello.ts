import { NextApiRequest, NextApiResponse } from 'next';
import { Agency, saveAgencies } from '../../db';

interface AgencyResponse {
  agencies: Agency[];
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
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

    res.status(200).json({
      message: 'Agencies successfully saved to database',
      count: data.agencies.length,
    });
  } catch (error) {
    console.error('Error processing agencies:', error);
    res.status(500).json({ error: 'Failed to process agencies data' });
  }
}
