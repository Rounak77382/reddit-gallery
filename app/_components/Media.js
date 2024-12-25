// [app/_components/Media.js](app/_components/Media.js)
"use client";

import Carousel from "./Carousel";
import SimpleImage from "./SimpleImage";
import Video from "./Video";

export default function Media({ imageData }) {
  if (imageData.isVideo || (typeof imageData.url === "string" && imageData.url.endsWith(".mp4")) || imageData.url.includes("v.redd.it")) {
    return <Video imageData={imageData} />;
  } else if (Array.isArray(imageData.url)) {
    return <Carousel imageData={imageData} />;
  } else {
    return <SimpleImage imageData={imageData} />;
  }
}
