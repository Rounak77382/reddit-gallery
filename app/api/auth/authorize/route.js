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

export async function GET(request) {
  const isProd = process.env.NODE_ENV === "production";
  
  // Always use the Vercel URL for Reddit OAuth, because Reddit only allows one registered URI
  const redirectUri = "https://reddit-gallery-real.vercel.app/api/auth/callback";
  
  // Generate a fresh state and append '_local' if we are in development
  const freshState = generateRandomState();
  const state = isProd ? freshState : `${freshState}_local`;

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