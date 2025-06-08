import { NextResponse } from "next/server";
import snoowrap from "snoowrap";
import { randomBytes } from "crypto";

// Create the state in a safe way
function generateRandomState() {
  try {
    return randomBytes(16).toString("hex");
  } catch (error) {
    // Fallback for environments where randomBytes isn't available
    return Math.random().toString(36).substring(2, 15) + 
           Math.random().toString(36).substring(2, 15);
  }
}

const state = generateRandomState();

export async function GET(request) {
  const host = request.headers.get("host");
  const protocol = process.env.NODE_ENV === "production" ? "https" : "http";
  const redirectUri = `${protocol}://${host}/api/auth/callback`;
  console.log("RedirectUri : ", redirectUri);

  let authUrl = snoowrap.getAuthUrl({
    clientId: process.env.praw_api_client_id,
    scope: ["read", "identity", "vote", "submit", "edit", "history", "save"],
    redirectUri: redirectUri,
    permanent: true,
    state: state,
  });

  authUrl = authUrl.replace("www.reddit", "old.reddit");
  return NextResponse.redirect(authUrl);
}