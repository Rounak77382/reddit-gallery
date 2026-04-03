"use client";

import { useEffect, useState, forwardRef } from "react";
import Carousel from "./Carousel";
import SimpleImage from "./StaticImage";
import Video from "./Video";
import LinkPreview from "./LinkPreview";
import TextContent from "./TextContent";
import { marked } from "marked";

const Media = forwardRef(({ imageData, onCarouselImageChange }, ref) => {
  const [parsedContent, setParsedContent] = useState("");
  const imageFormats = [".jpg", ".jpeg", ".png", ".gif"];
  const urlWithoutParams =
    typeof imageData.url === "string" ? imageData.url.split("?")[0] : "";

  useEffect(() => {
    if (imageData.body) {
      try {
        // Parse markdown to HTML
        const html = marked.parse(imageData.body);
        setParsedContent(html);
      } catch (error) {
        console.error("Error parsing markdown:", error);
        setParsedContent(imageData.body);
      }
    }
  }, [imageData.body]);

  if (
    imageData.isVideo ||
    (typeof imageData.url === "string" && imageData.url.endsWith(".mp4")) ||
    imageData.url.includes("v.redd.it")
  ) {
    return <Video imageData={imageData} ref={ref} />;
  } else if (Array.isArray(imageData.url)) {
    return (
      <Carousel
        imageData={imageData}
        ref={ref}
        onImageChange={onCarouselImageChange}
      />
    );
  } else if (imageFormats.some((format) => urlWithoutParams.endsWith(format))) {
    return <SimpleImage imageData={imageData} ref={ref} />;
  } else {
    // If there's body content, display that
    if (imageData.body) {
      return <TextContent content={parsedContent} ref={ref} />;
    } else if (imageData.url) {
      return <LinkPreview imageData={imageData} ref={ref} />;
    }
  }
});

// Add display name to the forwarded ref component
Media.displayName = "Media";

export default Media;
