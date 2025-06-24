"use client";

import { useState, useEffect } from "react";
import { useAppContext } from "./AppContext";

export default function Carousel({ imageData }) {
  const [maxWidth, setMaxWidth] = useState(250);
  const [currentIndex, setCurrentIndex] = useState(0);
  const { state } = useAppContext();
  const { isNSFWAllowed } = state;

  useEffect(() => {
    let max_width = 250;
    const loadImages = imageData.url.map((url) => {
      return new Promise((resolve) => {
        const img = new Image();
        img.src = url;
        img.onload = () => {
          const aspectRatio = img.width / img.height;
          const width = aspectRatio * 400;
          if (width > max_width) {
            max_width = width;
          }
          resolve();
        };
      });
    });

    Promise.all(loadImages).then(() => {
      setMaxWidth(Math.floor(max_width));
    });
  }, [imageData.url]);

  const nextImage = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % imageData.url.length);
  };

  const prevImage = () => {
    setCurrentIndex(
      (prevIndex) =>
        (prevIndex - 1 + imageData.url.length) % imageData.url.length
    );
  };

  return (
    <div className="relative overflow-hidden">
      {imageData.isNSFW && !isNSFWAllowed && (
        <div className="absolute top-2 right-2 z-30">
          <span className="bg-red-500/80 text-white px-2 py-1 rounded text-sm font-bold">
            NSFW
          </span>
        </div>
      )}
      <div
        className="relative h-[400px] rounded-lg transition ease duration-500 z-10 bg-[#000000] object-cover overflow-clip flex justify-center items-center"
        style={{ width: `${maxWidth}px` }}
      >
        <img
          src={imageData.url[currentIndex]}
          alt={`Slide ${currentIndex}`}
          className={`
            w-auto h-full object-cover rounded-lg 
            transition-all duration-500 ease-in-out
            ${imageData.isNSFW && !isNSFWAllowed ? "blur-xl" : ""}
          `}
          onError={(e) => {
            e.target.onerror = null;
          }}
        />
        {(!imageData.isNSFW || isNSFWAllowed) && (
          <>
            <button
              onClick={prevImage}
              className="absolute top-1/2 left-4 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-75 transition-opacity duration-300 cursor-pointer opacity-0 group-hover:opacity-100"
            >
              &#9664;
            </button>
            <button
              onClick={nextImage}
              className="absolute top-1/2 right-4 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-75 transition-opacity duration-300 cursor-pointer opacity-0 group-hover:opacity-100"
            >
              &#9654;
            </button>
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
              {imageData.url.map((_, index) => (
                <span
                  key={index}
                  className={`h-2 w-2 rounded-full ${
                    index === currentIndex ? "bg-white" : "bg-gray-400"
                  } cursor-pointer`}
                  onClick={() => setCurrentIndex(index)}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
