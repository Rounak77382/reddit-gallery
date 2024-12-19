// app/_lib/list_subreddits.js
import snoowrap from "snoowrap";
import dotenv from "dotenv";
import fetch from "node-fetch";
import NodeCache from "node-cache";

dotenv.config({ path: '.env' });

const cache = new NodeCache({ stdTTL: 3600 }); // Cache TTL set to 1 hour

async function getReadOnlyAccessToken() {
  const response = await fetch("https://www.reddit.com/api/v1/access_token", {
    method: "POST",
    headers: {
      Authorization:
        "Basic " +
        Buffer.from(
          `${process.env.praw_api_client_id}:${process.env.praw_api_client_secret}`
        ).toString("base64"),
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
  });

  const data = await response.json();
  return data.access_token;
}

async function getStoredRefreshToken() {
  const token = cache.get("refreshToken");
  return token || null;
}

async function storeRefreshToken(token) {
  cache.set("refreshToken", token);
}

async function validateToken(token) {
  try {
    const response = await fetch("https://oauth.reddit.com/api/v1/me", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.ok;
  } catch (error) {
    return false;
  }
}

export async function listSubreddits(subredditName) {
  let accessToken = await getStoredRefreshToken();

  if (!accessToken || !(await validateToken(accessToken))) {
    accessToken = await getReadOnlyAccessToken();
    await storeRefreshToken(accessToken);
  }

  const r = new snoowrap({
    userAgent: "testscript by RS_ted",
    clientId: process.env.praw_api_client_id,
    clientSecret: process.env.praw_api_client_secret,
    accessToken: accessToken,
  });

  const subredditResults = await r.searchSubredditNames(
    { query: subredditName },
    { includeNsfw: true }
  );
  return subredditResults;
}