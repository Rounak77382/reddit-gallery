"use client";
import { useAppContext } from "./AppContext";
import { useEffect, useState, useRef } from "react";
import Card from "./MediaCard";
import { ShimmerThumbnail } from "react-shimmer-effects";

export default function Download({ formData }) {
  const [images, setImages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [shimmerCount, setShimmerCount] = useState(0);
  const { state, dispatch } = useAppContext();
  const allImagesLoaded = useRef(false);
  const [remainingPlaceholders, setRemainingPlaceholders] = useState(0);
  const imagesLoadedTriggered = useRef(false);

  useEffect(() => {
    if (formData?.postLimit) {
      console.log("Updating shimmer count to:", formData.postLimit);
      const limit = Number(formData.postLimit);
      setShimmerCount(limit);
      setRemainingPlaceholders(limit);
      // Reset the images loaded flag when new form data comes in
      imagesLoadedTriggered.current = false;
    }
  }, [formData]);

  useEffect(() => {
    async function fetchImages() {
      if (formData) {
        setImages([]);
        setIsLoading(true);
        allImagesLoaded.current = false;
        imagesLoadedTriggered.current = false;

        const { searchTerm, postTime, postType, postLimit } = formData;
        setRemainingPlaceholders(Number(postLimit));

        try {
          const response = await fetch(
            `/api/downloader?subredditName=${searchTerm}&limit=${postLimit}&postType=${postType}&since=${postTime}${
              state.isLoggedIn && state.accessToken
                ? `&r=${state.accessToken}`
                : ""
            }`
          );

          if (!response.body) {
            throw new Error("ReadableStream not supported in this browser.");
          }

          const reader = response.body.getReader();
          const decoder = new TextDecoder();

          while (true) {
            try {
              const { value, done: doneReading } = await reader.read();

              if (doneReading) {
                console.log("Stream reading done");
                break;
              }
              const chunk = decoder.decode(value, { stream: true });
              const jsonObjects = extractJsonObjects(chunk);
              jsonObjects.forEach((jsonObj) => {
                try {
                  const image = JSON.parse(jsonObj);
                  setImages((prevImages) => [...prevImages, image]);
                  // Reduce remaining placeholders as we add real content
                  setRemainingPlaceholders((prev) => Math.max(0, prev - 1));
                } catch (e) {
                  console.warn("Failed to parse JSON:", jsonObj);
                }
              });
            } catch (err) {
              console.log("Error reading stream:", err);
            }
          }
        } catch (error) {
          console.warn("Error fetching images:", error);
        } finally {
          setIsLoading(false);
          setRemainingPlaceholders(0);
          // Signal that all images have loaded
          allImagesLoaded.current = true;
          // Don't dispatch here - we'll do it in the other useEffect after a delay
        }
      }
    }

    fetchImages();
  }, [formData, state.accessToken, state.isLoggedIn]);

  // Helper function to extract complete JSON objects from a string
  function extractJsonObjects(str) {
    const results = [];
    let depth = 0;
    let startIndex = -1;

    for (let i = 0; i < str.length; i++) {
      if (str[i] === "{") {
        if (depth === 0) startIndex = i;
        depth++;
      } else if (str[i] === "}") {
        depth--;
        if (depth === 0 && startIndex !== -1) {
          results.push(str.substring(startIndex, i + 1));
          startIndex = -1;
        }
      }
    }

    return results;
  }

  // Use an effect to trigger scale calculation when all images are loaded
  useEffect(() => {
    if (
      images.length > 0 &&
      !isLoading &&
      remainingPlaceholders === 0 &&
      !imagesLoadedTriggered.current
    ) {
      console.log("All images loaded, triggering scale calculation");

      // Mark that we've triggered the images loaded event
      imagesLoadedTriggered.current = true;

      // Add a delay to ensure all images are fully rendered
      const timer = setTimeout(() => {
        // Dispatch the event for Scale.js to listen to
        window.dispatchEvent(
          new CustomEvent("imagesLoaded", {
            detail: {
              count: images.length,
              timestamp: Date.now(),
            },
          })
        );

        // Also dispatch a different event type to try to catch any issues
        window.dispatchEvent(new Event("imagesComplete"));

        console.log(
          "Dispatched imagesLoaded event with",
          images.length,
          "images"
        );
      }, 1000); // Increased delay to ensure images are fully rendered

      return () => clearTimeout(timer);
    }
  }, [images.length, isLoading, remainingPlaceholders]);

  const ShimmerCard = () => (
    <div className="relative w-[400px] h-[400px] m-1 opacity-5 shadow-lg shadow-black/50">
      <ShimmerThumbnail height={400} rounded />
    </div>
  );

  return (
    <div className="gallery-container-wrapper" style={{ width: "100%" }}>
      <div
        className="gallery-container"
        style={{
          display: "flex",
          flexWrap: "wrap",
          width: `${100 / parseFloat(state.scaleValue)}%`, // Adjust width inversely to scale
          padding: "1px",
          paddingBottom: "75px", // Ensure enough space for the footer
          transform: `scale(${state.scaleValue})`,
          transformOrigin: "top left",
          transition: "transform 0.5s ease-in-out", // Smooth transition
        }}
      >
        {/* Real images that have already loaded */}
        {images.map((image, index) => (
          <div
            key={`image-${index}`}
            style={{
              width: "auto",
              position: "relative",
              zIndex: 5,
            }}
            id={`scaleOptimizer-${index}`}
            className="scale-optimizer-card"
            data-loaded="true"
            onMouseEnter={(e) => {
              e.currentTarget.style.zIndex = "999";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.zIndex = "5";
            }}
          >
            <Card imageData={image} />
          </div>
        ))}

        {/* Placeholder shimmer cards for remaining items */}
        {remainingPlaceholders > 0 &&
          Array(remainingPlaceholders)
            .fill(0)
            .map((_, index) => <ShimmerCard key={`shimmer-${index}`} />)}
      </div>
    </div>
  );
}
