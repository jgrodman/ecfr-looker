import { NextResponse } from 'next/server';
import { getAgencyWordCounts } from '@/db/agencies';

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const agencyId = parseInt(params.id, 10);
    if (isNaN(agencyId)) {
      return NextResponse.json({ error: 'Invalid agency ID' }, { status: 400 });
    }

    const wordCounts = await getAgencyWordCounts(agencyId);
    return NextResponse.json(wordCounts);
  } catch (error) {
    console.error('Error fetching agency word counts:', error);
    return NextResponse.json({ error: 'Failed to fetch word counts' }, { status: 500 });
  }
}
