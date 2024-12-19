// [app/_components/Media.js](app/_components/Media.js)
"use client";

import Carousel from "./Carousel";
import SimpleImage from "./SimpleImage";
import Video from "./Video";

export default function Media({ image }) {
  return image.isVideo ||
    (typeof image.url === "string" && image.url.endsWith(".mp4")) ? (
    <Video image={image} />
  ) : Array.isArray(image.url) ? (
    <Carousel urls={image.url} />
  ) : (
    <SimpleImage url={image.url} />
  );
}