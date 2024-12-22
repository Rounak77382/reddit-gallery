// [app/_components/Media.js](app/_components/Media.js)
"use client";

import Carousel from "./Carousel";
import SimpleImage from "./SimpleImage";
import Video from "./Video";


export default function Media({ imageData }) {


  return imageData.isVideo ||
    (typeof imageData.url === "string" && imageData.url.endsWith(".mp4")) ? (
    <Video imageData={imageData} />
  ) : Array.isArray(imageData.url) ? (
    <Carousel imageData={imageData} />
  ) : (
    <SimpleImage imageData={imageData} />
  );
}
