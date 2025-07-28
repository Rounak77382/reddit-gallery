import snoowrap from "snoowrap";
import qs from "qs";
import { getGif } from "../_components/RedGifsClient";
import { marked } from "marked";
import dotenv from "dotenv";
dotenv.config({ path: ".env" });

function processMarkdown(text) {
  try {
    return marked.parse(text);
  } catch (error) {
    console.error("Error parsing markdown:", error);
    return text;
  }
}

async function getReadOnlyAccessToken() {
  const authString = `${process.env.praw_api_client_id}:${process.env.praw_api_client_secret}`;
  const authBuffer = Buffer.from(authString, "utf8");
  const authBase64 = authBuffer.toString("base64");

  const response = await fetch("https://www.reddit.com/api/v1/access_token", {
    method: "POST",
    headers: {
      Authorization: `Basic ${authBase64}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: qs.stringify({
      grant_type: "client_credentials",
    }),
  });

  const data = await response.json();

  const r = new snoowrap({
    userAgent: "testscript by RS_ted",
    clientId: process.env.praw_api_client_id,
    clientSecret: process.env.praw_api_client_secret,
    accessToken: data.access_token,
  });

  console.log("Access Token: ", r.accessToken);

  return r;
}

function postedSinceCalc(post) {
  const units = [
    { name: "yr.", ms: 12 * 30 * 24 * 60 * 60 * 1000 },
    { name: "mo.", ms: 30 * 24 * 60 * 60 * 1000 },
    { name: "day", ms: 24 * 60 * 60 * 1000 },
    { name: "hr.", ms: 60 * 60 * 1000 },
    { name: "min.", ms: 60 * 1000 },
    { name: "sec.", ms: 1000 },
  ];

  let timeDifference = Date.now() - post.created_utc * 1000;

  for (let unit of units) {
    const value = Math.floor(timeDifference / unit.ms);
    if (value > 0) {
      return `${value} ${unit.name} ago`;
    }
  }
  return "just now";
}

export async function* downloadImages(
  subredditName,
  limit = 10,
  postType = "top",
  since = "all",
  r = null,
  signal = null
) {
  if (!r) {
    r = await getReadOnlyAccessToken();
    console.log("guest mode");
  } else {
    console.log("user mode");
  }

  const snooWrap = new snoowrap({
    userAgent: r.userAgent,
    clientId: r.clientId,
    clientSecret: r.clientSecret,
    refreshToken: r.refreshToken,
    accessToken: r.accessToken,
  });

  r = snooWrap;

  console.log("r: ", r);

  let name = subredditName;

  let subreddit;
  let Posts;
  if (name === "") {
    Posts = await r.getHot();
    name = "_other_";
  } else {
    subreddit = await r.getSubreddit(name);
    switch (postType) {
      case "top":
        Posts = await subreddit.getTop({ time: since, limit });
        break;
      case "hot":
        Posts = await subreddit.getHot({ limit });
        break;
      case "new":
        Posts = await subreddit.getNew({ limit });
        break;
      case "rising":
        Posts = await subreddit.getRising({ limit });
        break;
      default:
        Posts = await subreddit.getTop({ time: since, limit });
    }
  }

  for (const post of Posts) {
    if (signal && signal.aborted) {
      console.log("Generator aborted.");
      return;
    }

    let url;

    try {
      url = post.url;
      let aspectRatio;
      if (post.is_gallery) {
        const galleryData = post.media_metadata || {};
        let maxAspectRatio = -1;
        for (let key in galleryData) {
          const media = galleryData[key];
          if ((media.e === "Image" || media.e === "AnimatedImage") && media.s) {
            const mediaAspectRatio = media.s.x / media.s.y;
            if (mediaAspectRatio > maxAspectRatio) {
              maxAspectRatio = mediaAspectRatio;
            }
          }
        }
        aspectRatio = maxAspectRatio > 0 ? maxAspectRatio : 1.33;
      } else if (
        post.is_video &&
        post.is_reddit_media_domain === true &&
        post.secure_media &&
        post.secure_media.reddit_video
      ) {
        aspectRatio =
          post.secure_media.reddit_video.width /
          post.secure_media.reddit_video.height;
      } else if (
        post.is_reddit_media_domain === false &&
        post.preview &&
        post.preview.reddit_video_preview != null
      ) {
        try {
          if (post.preview.reddit_video_preview) {
            aspectRatio =
              post.preview.reddit_video_preview.width /
              post.preview.reddit_video_preview.height;
          } else {
            aspectRatio = 1.33; // Default 4:3 aspect ratio
          }
        } catch {
          aspectRatio = 1.33;
        }
      } else if (
        post.preview &&
        post.preview.images &&
        post.preview.images.length > 0 &&
        post.preview.images[0].source
      ) {
        try {
          aspectRatio =
            post.preview.images[0].source.width /
            post.preview.images[0].source.height;
        } catch {
          aspectRatio = 1.33; // Default to 4:3 aspect ratio
        }
      } else {
        // Default aspect ratio if none could be determined
        aspectRatio = 1.33;
      }

      const id = post.id || "";
      const title = post.title || "";
      const author = post.author ? post.author.name : "[deleted]";
      let authorDp;
      let body = post.selftext;
      try {
        authorDp = await post.author.icon_img;
        if (!authorDp) {
          authorDp =
            "https://i.redd.it/snoovatar/avatars/8658e16c-55fa-486f-b7c7-00726de2e742.png";
        }
      } catch {
        authorDp =
          "https://i.redd.it/snoovatar/avatars/8658e16c-55fa-486f-b7c7-00726de2e742.png";
      }
      const postedSince = postedSinceCalc(post);
      const flair = post.link_flair_text || "none";

      // Handle potentially undefined num_comments
      const comments =
        post.num_comments !== undefined
          ? post.num_comments >= 1000
            ? `${Math.floor(post.num_comments / 1000)}k`
            : post.num_comments.toString()
          : "0";

      // Handle potentially undefined score
      const upvotes =
        post.score !== undefined
          ? post.score >= 1000
            ? `${Math.floor(post.score / 1000)}k`
            : post.score.toString()
          : "0";

      // Handle potentially undefined upvote_ratio or score
      const downvotes =
        post.score !== undefined && post.upvote_ratio !== undefined
          ? Math.floor(post.score * (1 - post.upvote_ratio)) >= 1000
            ? `${Math.floor((post.score * (1 - post.upvote_ratio)) / 1000)}k`
            : Math.floor(post.score * (1 - post.upvote_ratio)).toString()
          : "0";

      const isNSFW = post.over_18 || false;

      if (url && url.includes("reddit.com/gallery")) {
        // This is a gallery post
        const localUrls = [];
        if (post.media_metadata) {
          for (let key in post.media_metadata) {
            const media = post.media_metadata[key];
            if (
              media &&
              (media.e === "Image" || media.e === "AnimatedImage") &&
              media.s
            ) {
              let mediaUrl;
              if (media.s.gif) {
                mediaUrl = media.s.gif;
              } else if (media.s.u) {
                mediaUrl = media.s.u;
              } else {
                // Skip if no valid URL
                continue;
              }
              localUrls.push(mediaUrl);
            }
          }
        }
        url = localUrls.length > 0 ? localUrls : url; // Fall back to original URL if no gallery images found
      } else if (url && url.includes("redgifs")) {
        // This is a redgifs vid
        try {
          const gifId = url.split("/").pop().split("#")[0].split(".")[0];
          const link = await getGif(gifId);
          url = link || url; // Fall back to original URL if getGif fails
        } catch (error) {
          console.error("Error processing redgifs URL:", error);
          // Keep original URL if there's an error
        }
      } else if (url && url.includes("v.redd.it")) {
        try {
          if (
            post.secure_media &&
            post.secure_media.reddit_video &&
            post.secure_media.reddit_video.hls_url
          ) {
            url = post.secure_media.reddit_video.hls_url;
          }
        } catch (error) {
          console.error("Error processing v.redd.it URL:", error);
          // Keep original URL if there's an error
        }
      }

      // Make sure all data is valid before returning
      const imageData = {
        id: id || "",
        url: url || "",
        aspect_ratio: isNaN(aspectRatio) ? 1.33 : aspectRatio,
        title: title || "",
        body: body || "",
        author: author || "[deleted]",
        author_dp: authorDp || "https://www.reddit.com/static/noavatar.png",
        posted_since: postedSince || "unknown time ago",
        flair: flair || "none",
        comments: comments || "0",
        upvotes: upvotes || "0",
        downvotes: downvotes || "0",
        siteurl: post.permalink
          ? `https://www.reddit.com${post.permalink}`
          : "",
        userurl: author ? `https://www.reddit.com/user/${author}` : "",
        mediaurl: url || "",
        isNSFW: isNSFW || false,
      };
      yield imageData;
    } catch (err) {
      console.error("Error in url:", url);
      console.error(err);
    }
  }
}
