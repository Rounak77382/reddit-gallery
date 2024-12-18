let cookies;

import { Buffer } from "node:buffer";

const apiUrl = "https://api.redgifs.com";

async function accessToken() {
  try {
    const response = await fetch(apiUrl + "/v2/auth/temporary");
    const data = await response.json();
    cookies = response.headers.get("set-cookie");
    return data.token;
  } catch (error) {
    throw new Error("Error getting token.");
  }
}

async function getGif(gifId) {
  try {
    const response = await fetch(apiUrl + `/v2/gifs/${gifId}`, {
      headers: {
        Authorization: `Bearer ${await accessToken()}`,
        Cookie: cookies,
      },
    });
    const data = await response.json();
    let downloadUrl;

    if (data?.error) {
      throw new Error(`${data.error.description}`);
    } else if (data.gif?.urls && data.gif.urls?.hd) {
      downloadUrl = data.gif.urls.hd;
    } else if (data.gif?.urls && data.gif.urls?.sd) {
      downloadUrl = data.gif.urls.sd;
    }

    return downloadUrl;
  } catch (error) {
    throw new Error(`Error getting gif:\n${error}`);
  }
}

export { getGif };