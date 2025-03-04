import { NextRequest } from 'next/server';
import { getAgencyWordCounts } from '@/db/agencies';

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const agencyId = parseInt(params.id, 10);
    if (isNaN(agencyId)) {
      return Response.json({ error: 'Invalid agency ID' }, { status: 400 });
    }

    const wordCounts = await getAgencyWordCounts(agencyId);
    return Response.json(wordCounts);
  } catch (error) {
    console.error('Error fetching agency word counts:', error);
    return Response.json({ error: 'Failed to fetch word counts' }, { status: 500 });
  }
}
