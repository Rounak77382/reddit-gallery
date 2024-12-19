// [app/_components/Download.js](app/_components/Download.js)
"use client";
import { useScale } from "./ScaleContext";
import { useEffect, useState } from "react";
import Card from "./Card";

export default function Download({ formData }) {
  const [images, setImages] = useState([]);
  const { scaleValue } = useScale();

  useEffect(() => {
    async function fetchImages() {
      if (formData) {
        try {
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
            console.log("--Image DATA--", image);
            setImages((prevImages) => [...prevImages, image]);
          }
        } catch (error) {
          console.log("Error fetching images:", error);
        }
      }
    }

    fetchImages();
  }, [formData]);

  return (
    <div
      style={{
        display: "flex",
        flexWrap: "wrap",
        width: "100%",
        padding: "1px",
        zoom: scaleValue,
      }}
    >
      {images.map((image, index) => (
        <div
          key={index}
          style={{
            position: "relative",
            width: "auto",
          }}
        >
          <Card imageData={image} />
        </div>
      ))}
    </div>
  );
}