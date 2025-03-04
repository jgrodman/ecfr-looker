import { NextApiRequest, NextApiResponse } from "next";

interface Agency {
  name: string;
  short_name: string;
  display_name: string;
  sortable_name: string;
  slug: string;
  children: Agency[];
  cfr_references: {
    title: number;
    chapter: string;
  }[];
}

interface AgencyResponse {
  agencies: Agency[];
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const response = await fetch('https://www.ecfr.gov/api/admin/v1/agencies.json', {
      headers: {
        'accept': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data: AgencyResponse = await response.json();
    res.status(200).json(data);
  } catch (error) {
    console.error('Error fetching agencies:', error);
    res.status(500).json({ error: 'Failed to fetch agencies data' });
  }
}