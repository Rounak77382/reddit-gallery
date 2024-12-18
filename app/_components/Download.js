"use client";

import { useEffect, useState } from "react";
import Carousel from "./Carousel";
import SimpleImage from "./SimpleImage";
import Video from "./Video";

export default function Download({ formData }) {
  const [images, setImages] = useState([]);

  useEffect(() => {
    async function fetchImages() {
      if (formData) {
        const { searchTerm, postTime, postType, postLimit } = formData;
        const response = await fetch(
          `/api/downloader?subredditName=${searchTerm}&limit=${postLimit}&postType=${postType}&since=${postTime}`
        );

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let done = false;

        while (!done) {
          const { value, done: doneReading } = await reader.read();
          done = doneReading;
          const chunk = decoder.decode(value, { stream: true });
          const image = JSON.parse(chunk);
          setImages((prevImages) => [...prevImages, image]);
        }
      }
    }

    fetchImages();
  }, [formData]);

  return (
    <div style={{ display: "flex", flexWrap: "wrap" }}>
      {images.map((image, index) => (
        <div
          key={index}
          style={{
            position: "relative",
            width: "auto",
            height: "400px",
            padding: "1%",
          }}
        >
          {image.isVideo ||
          (typeof image.url === "string" && image.url.endsWith(".mp4")) ? (
            <Video image={image} />
          ) : Array.isArray(image.url) ? (
            <Carousel urls={image.url} />
          ) : (
            <SimpleImage url={image.url} />
          )}
        </div>
      ))}
    </div>
  );
}