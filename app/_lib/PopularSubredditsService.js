import snoowrap from "snoowrap";
import dotenv from "dotenv";

dotenv.config({ path: ".env" });

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

export async function fetchPopularSubs(limit = 25) {
  try {
    const accessToken = await getReadOnlyAccessToken();
    
    const r = new snoowrap({
      userAgent: "testscript by RS_ted",
      clientId: process.env.praw_api_client_id,
      clientSecret: process.env.praw_api_client_secret,
      accessToken: accessToken,
    });

    const listing = await r.getPopularSubreddits({ limit });
    const subs = listing.map(sr => ({
      name: sr.display_name,
      title: sr.title,
      subscribers: sr.subscribers
    })).sort((a, b) => b.subscribers - a.subscribers);
    
    return subs;
  } catch (error) {
    console.error("Error fetching popular subreddits:", error);
    throw error;
  }
}