// app/api/downloader/route.js
import { NextResponse } from "next/server";
import { downloadImages } from "@/app/_lib/downloader";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const subredditName = searchParams.get("subredditName");
  const limit = parseInt(searchParams.get("limit")) || 10;
  const postType = searchParams.get("postType") || "top";
  const since = searchParams.get("since") || "all";
  const r = searchParams.get("accessToken") || null;

  if (!subredditName) {
    return NextResponse.json(
      { error: "Subreddit name is required" },
      { status: 400 }
    );
  }

  try {
    const stream = new ReadableStream({
      async start(controller) {
        for await (const imageData of downloadImages(
          subredditName,
          limit,
          postType,
          since,
          r
        )) {
          controller.enqueue(JSON.stringify(imageData));
          console.log("Route side - Image data:", imageData);
        }
        controller.close();
      },
    });

    return new Response(stream, {
      headers: { "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
