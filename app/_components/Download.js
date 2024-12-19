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

          if (!response.body) {
            throw new Error("ReadableStream not supported in this browser.");
          }

          const reader = response.body
            .pipeThrough(new TextDecoderStream())
            .pipeThrough(parseNDJSON())
            .getReader();

          while (true) {
            const { value: image, done } = await reader.read();
            if (done) break;
            setImages((prevImages) => [...prevImages, image]);
          }
        } catch (error) {
          console.warn("Error fetching images:", error);
        }
      }
    }

    fetchImages();
  }, [formData]);

  function parseNDJSON() {
    let ndjsonBuffer = "";

    return new TransformStream({
      transform(chunk, controller) {
        try {
          ndjsonBuffer += chunk;
          const lines = ndjsonBuffer.split("\n");
          ndjsonBuffer = lines.pop() || "";

          for (const line of lines) {
            if (line.trim()) {
              try {
                const parsedLine = JSON.parse(line);
                controller.enqueue(parsedLine);
              } catch (e) {
                // Try to split potentially concatenated JSON objects
                const jsonStrings = line.match(/\{[^}]+\}/g);
                if (jsonStrings) {
                  jsonStrings.forEach((jsonStr) => {
                    try {
                      const parsed = JSON.parse(jsonStr);
                      controller.enqueue(parsed);
                    } catch (err) {
                      console.warn("Failed to parse JSON substring:", jsonStr);
                    }
                  });
                }
              }
            }
          }
        } catch (error) {
          console.warn("Transform error:", error);
        }
      },

      flush(controller) {
        if (ndjsonBuffer.trim()) {
          try {
            // Try to split potentially concatenated JSON objects in final buffer
            const jsonStrings = ndjsonBuffer.match(/\{[^}]+\}/g);
            if (jsonStrings) {
              jsonStrings.forEach((jsonStr) => {
                try {
                  const parsed = JSON.parse(jsonStr);
                  controller.enqueue(parsed);
                } catch (err) {
                  console.warn(
                    "Failed to parse JSON in final buffer:",
                    jsonStr
                  );
                }
              });
            }
          } catch (e) {
            console.warn("Flush error:", e);
          }
        }
      },
    });
  }

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
        <div key={index} style={{ position: "relative", width: "auto" }}>
          <Card imageData={image} />
        </div>
      ))}
    </div>
  );
}
