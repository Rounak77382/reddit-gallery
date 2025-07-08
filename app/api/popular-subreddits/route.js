import { NextResponse } from 'next/server';
import { fetchPopularSubs } from '@/app/_lib/PopularSubredditsService';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const limit = parseInt(searchParams.get('limit')) || 25;

  try {
    const popularSubreddits = await fetchPopularSubs(limit);
    return NextResponse.json(popularSubreddits, { status: 200 });
  } catch (error) {
    console.error("Error fetching popular subreddits:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}