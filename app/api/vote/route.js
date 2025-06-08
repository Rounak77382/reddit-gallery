import { NextResponse } from "next/server";
import snoowrap from "snoowrap";

export async function POST(request) {
  try {
    const { id, direction, accessToken } = await request.json();

    console.log('id : ', id);
    console.log('direction : ', direction);
    console.log('accessToken : ', accessToken ? 'exists' : 'missing'); // Fixed: removed reference to undefined 'r'

    const snooWrap = new snoowrap({
      userAgent: "testscript by RS_ted",
      clientId: process.env.praw_api_client_id,
      clientSecret: process.env.praw_api_client_secret,
      accessToken: accessToken.accessToken, // You might need to use accessToken.accessToken based on your state structure
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
    console.error("Vote error:", error);
    console.error("Error details:", {
      message: error.message,
      stack: error.stack,
      name: error.name,
    });
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}