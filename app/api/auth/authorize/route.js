// /api/auth/authorize

import { NextResponse } from "next/server";
import snoowrap from "snoowrap";
import crypto from "crypto";

const state = crypto.randomBytes(16).toString("hex");

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
