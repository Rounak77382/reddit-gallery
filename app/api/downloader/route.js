// app/api/downloader/route.js
import { NextResponse } from "next/server";
import { downloadImages } from "@/app/_lib/RedditMediaFetcher";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const url = searchParams.get("url");

  // If a direct URL is provided, handle it as a direct file download
  if (url) {
    try {
      // Fetch the media directly from the source
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(
          `Failed to fetch media: ${response.status} ${response.statusText}`
        );
      }

      // Get the content type from response headers
      const contentType =
        response.headers.get("content-type") || "application/octet-stream";

      // Extract filename from URL or use default
      const urlParts = url.split("/");
      const filename =
        urlParts[urlParts.length - 1].split("?")[0] || "download";

      // Stream the response back to the client
      const arrayBuffer = await response.arrayBuffer();

      return new Response(arrayBuffer, {
        headers: {
          "Content-Type": contentType,
          "Content-Disposition": `attachment; filename="${filename}"`,
        },
      });
    } catch (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
  }

  // Original implementation for subreddit downloads
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
