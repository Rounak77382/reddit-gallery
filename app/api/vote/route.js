import { NextResponse } from "next/server";
import snoowrap from "snoowrap";

export async function POST(request) {
  try {
    const { id, direction, r } = await request.json();

    console.log('id : ', id);
    console.log('direction : ', direction);
    console.log('r : ', r);

    const snooWrap = new snoowrap({
        userAgent: r.userAgent,
        clientId: r.clientId,
        clientSecret: r.clientSecret,
        refreshToken: r.refreshToken,
        accessToken: r.accessToken,
      });

    const submission = snooWrap.getSubmission(id);
    
    if (direction === 1) {
      await submission.upvote();
    } else if (direction === -1) {
      await submission.downvote();
    } else {
      await submission.unvote();
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Vote error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}