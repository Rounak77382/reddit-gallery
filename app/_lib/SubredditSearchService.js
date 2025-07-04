// app/_lib/list_subreddits.js
import snoowrap from "snoowrap";
import dotenv from "dotenv";
import fetch from "node-fetch";
import NodeCache from "node-cache";

dotenv.config({ path: ".env" });

// Cache with a short TTL for search results to prevent duplicate requests
const cache = new NodeCache({ stdTTL: 3600 }); // Cache TTL set to 1 hour
const searchCache = new NodeCache({ stdTTL: 60 }); // Short cache for search results (1 minute)

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
  // Check if this exact search term has been cached recently
  const cachedResults = searchCache.get(subredditName);
  if (cachedResults) {
    console.log(`Using cached results for "${subredditName}"`);
    return cachedResults;
  }

  // Proceed with API call if not cached
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

  // First get the basic subreddit names that match the search
  const subredditNames = await r.searchSubredditNames(
    { query: subredditName },
    { includeNsfw: true }
  );

  const detailedSubreddits = await Promise.all(
    subredditNames.slice(0, 7).map(async (name) => {
      try {
        const subreddit = await r.getSubreddit(name).fetch();
        return {
          name: subreddit.display_name,
          displayName: subreddit.display_name_prefixed,
          iconImg:
            subreddit.icon_img || subreddit.community_icon || "/icons/dp.png",
          subscribers: subreddit.subscribers || 0,
          isNSFW: subreddit.over18,
        };
      } catch (error) {
        console.error(`Error fetching details for ${name}:`, error);
        return {
          name: name,
          displayName: "r/" + name,
          iconImg: "/icons/dp.png",
          subscribers: 0,
          description: "",
          isNSFW: false,
        };
      }
    })
  );

  detailedSubreddits.sort((a, b) => b.subscribers - a.subscribers);
  
  // Cache the results for this search term
  searchCache.set(subredditName, detailedSubreddits);
  
  return detailedSubreddits;
}