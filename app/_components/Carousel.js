"use client";

import { useState, useEffect, forwardRef } from "react";
import { useAppContext } from "./AppContext";
import { motion, AnimatePresence } from "framer-motion";
import { slideAnimationVariants } from "../_lib/AnimationConfig";

const Carousel = forwardRef(({ imageData, onImageChange }, ref) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const { state } = useAppContext();
  const { isNSFWAllowed } = state;

  // Listen for fullscreen changes
  useEffect(() => {
    function handleFullscreenChange() {
      if (!ref || !ref.current) return;
      setIsFullscreen(document.fullscreenElement === ref.current);
    }
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
    };
  }, [ref]);

  // Create a custom event to notify the parent component of the current image URL
  useEffect(() => {
    if (Array.isArray(imageData.url) && imageData.url.length > 0) {
      const currentUrl = imageData.url[currentIndex];

      // Call the callback if provided
      if (onImageChange && typeof onImageChange === "function") {
        onImageChange(currentUrl);
      }

      // Create and dispatch a custom event when the carousel index changes
      const event = new CustomEvent("carouselImageChange", {
        detail: {
          id: imageData.id,
          currentUrl,
        },
        bubbles: true,
      });

      // Find a DOM element to dispatch from
      const element = document.querySelector(
        `[data-media-id="${imageData.id}"]`
      );
      if (element) {
        element.dispatchEvent(event);
      }

      // Also update the mediaurl property for direct access
      if (imageData.mediaurl !== currentUrl) {
        imageData.mediaurl = currentUrl;
      }
    }
  }, [currentIndex, imageData, onImageChange]);

  const nextImage = () => {
    setDirection(1);
    setCurrentIndex((prevIndex) => (prevIndex + 1) % imageData.url.length);
  };

  const prevImage = () => {
    setDirection(-1);
    setCurrentIndex(
      (prevIndex) =>
        (prevIndex - 1 + imageData.url.length) % imageData.url.length
    );
  };

  // Add a function to directly get the current image URL
  const getCurrentImageUrl = () => {
    if (Array.isArray(imageData.url) && imageData.url.length > 0) {
      return imageData.url[currentIndex];
    }
    return null;
  };

  return (
    <div
      className={`relative overflow-hidden h-full w-full ${
        isFullscreen ? "z-[9999] bg-black" : ""
      }`}
      data-media-id={imageData.id}
      ref={ref}
    >
      {imageData.isNSFW && !isNSFWAllowed && (
        <div className="absolute top-2 right-2 z-30">
          <span className="bg-red-500/80 text-white px-2 py-1 rounded text-sm font-bold">
            NSFW
          </span>
        </div>
      )}
      <div
        className={`relative rounded-lg z-10 bg-[#000000] object-cover overflow-hidden flex justify-center items-center transition-all duration-300 h-full min-h-0`}
        style={isFullscreen ? { height: "100%" } : {}}
      >
        <AnimatePresence initial={false} custom={direction} mode="popLayout">
          <motion.img
            key={currentIndex}
            custom={direction}
            variants={slideAnimationVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{
              x: { type: "spring", stiffness: 300, damping: 30 },
              opacity: { duration: 0.2 },
            }}
            src={imageData.url[currentIndex]}
            alt={`Slide ${currentIndex}`}
            className={`object-contain rounded-lg max-w-full max-h-full
              ${imageData.isNSFW && !isNSFWAllowed ? "blur-xl" : ""}
            `}
            style={isFullscreen ? { width: "100%", height: "100%" } : {}}
            onError={(e) => {
              e.target.onerror = null;
            }}
          />
        </AnimatePresence>
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
                <motion.span
                  key={index}
                  className={`h-2 w-2 rounded-full ${
                    index === currentIndex ? "bg-white" : "bg-gray-400"
                  } cursor-pointer`}
                  onClick={() => {
                    setDirection(index > currentIndex ? 1 : -1);
                    setCurrentIndex(index);
                  }}
                  whileHover={{ scale: 1.5 }}
                  transition={{ duration: 0.2 }}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
});

Carousel.displayName = "Carousel";

export default Carousel;
