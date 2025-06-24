// app/api/subreddits/route.js
import { NextResponse } from 'next/server';
import { listSubreddits } from '@/app/_lib/SubredditSearchService';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const subredditName = searchParams.get('subredditName');

  if (!subredditName) {
    return NextResponse.json({ error: 'Subreddit name is required' }, { status: 400 });
  }

  try {
    const results = await listSubreddits(subredditName);
    return NextResponse.json(results, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}