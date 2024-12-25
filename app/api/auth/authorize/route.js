// /api/auth/authorize

import { NextResponse } from "next/server";
import snoowrap from "snoowrap";
import crypto from "crypto";

 const state = crypto.randomBytes(16).toString("hex");

export async function GET() {
  let authUrl = snoowrap.getAuthUrl({
    clientId: process.env.praw_api_client_id,
    scope: ["read", "identity", "vote", "submit", "edit", "history", "save"],
    redirectUri: "http://localhost:3000/api/auth/callback",
    permanent: true,
    state: state,
  });

  authUrl = authUrl.replace("www.reddit", "old.reddit");
  return NextResponse.redirect(authUrl);
}
