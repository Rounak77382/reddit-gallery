import snoowrap from "snoowrap";
import dotenv from "dotenv";
import crypto from "crypto";

dotenv.config({ path: ".env" });

const state = crypto.randomBytes(16).toString("hex");

export function getAuthUrl() {
  let authUrl = snoowrap.getAuthUrl({
    clientId: process.env.praw_api_client_id,
    scope: ["read", "identity"],
    redirectUri: "http://localhost:3000/receive_code",
    permanent: true,
    state: state,
  });

  authUrl = authUrl.replace("www.reddit", "old.reddit");
  console.log("authUrl: ", authUrl);

  return authUrl;
}

export async function handleAuthCode(req, res, io) {
  if (req.query.state !== state) {
    return res.status(403).send("State does not match");
  }
  if (!req.query.code) {
    console.log("Authorization was not successful. No action taken.");
    res.status(401).send("Authorization was not successful");
    io.emit("authorized", false);
    return;
  }

  const userCode = req.query.code;
  console.log("userCode: ", userCode);

  const r = await snoowrap.fromAuthCode({
    code: userCode,
    userAgent: "testscript by RS_ted",
    clientId: process.env.praw_api_client_id,
    clientSecret: process.env.praw_api_client_secret,
    redirectUri: "http://localhost:3000/receive_code",
  });

  try {
    return res.json({ r });
  } catch (error) {
    console.error("Error getting access code:", error);
    return res.status(500).send("Internal Server Error");
  }
}