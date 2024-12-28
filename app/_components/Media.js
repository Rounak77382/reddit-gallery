// [app/_components/Media.js](app/_components/Media.js)
"use client";

import Carousel from "./Carousel";
import SimpleImage from "./SimpleImage";
import Video from "./Video";

export default function Media({ imageData }) {
  console.log("imageData: ", imageData);
  const imageFormats = [
    ".jpg",
    ".jpeg",
    ".png",
    ".gif",
    ".bmp",
    ".webp",
    ".tiff",
  ];
  const urlWithoutParams =
    typeof imageData.url === "string" ? imageData.url.split("?")[0] : "";

  if (
    imageData.isVideo ||
    (typeof imageData.url === "string" && imageData.url.endsWith(".mp4")) ||
    imageData.url.includes("v.redd.it")
  ) {
    return <Video imageData={imageData} />;
  } else if (Array.isArray(imageData.url)) {
    return <Carousel imageData={imageData} />;
  } else if (imageFormats.some((format) => urlWithoutParams.endsWith(format))) {
    return <SimpleImage imageData={imageData} />;
  } else {
    return (
      <div className="w-full h-[400px] rounded-lg max-w-[560px] min-w-[250px] bg-primary overflow-y-hidden hover:overflow-y-auto prose prose-invert">
        <div
          className="text-white h-full text-sm relative z-20 hover:z-40 p-4 bg-black rounded-t-lg"
          dangerouslySetInnerHTML={{ __html: imageData.body }}
        />
      </div>
    );
  }
}
