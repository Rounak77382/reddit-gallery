"use client";
import { useAppContext } from "./AppContext";
import { useEffect, useState, useRef } from "react";
import { minimumgap } from "../_lib/OptimalLayoutCalculator";

export default function Scale() {
  const { state, dispatch } = useAppContext();
  const [optimalScales, setOptimalScales] = useState([]);
  const [showOptimalScales, setShowOptimalScales] = useState(false);
  const [isSnapEnabled, setIsSnapEnabled] = useState(false);
  const previousSearchRef = useRef(null);
  const searchSubmittedRef = useRef(false);
  const calculateTimeoutRef = useRef(null);
  const autoModeActivatedRef = useRef(false); // Track if auto mode has been activated

  // Listen for search events from the Search component
  useEffect(() => {
    const handleSearchSubmit = () => {
      // Reset scale to 1.0
      dispatch({
        type: "RESET_SCALE",
      });

      // Turn off auto mode
      setIsSnapEnabled(false);
      setShowOptimalScales(false);

      // Clear optimal scales and mark for recalculation
      setOptimalScales([]);
      searchSubmittedRef.current = true;
      autoModeActivatedRef.current = false; // Reset auto mode flag for new search
    };

    window.addEventListener("searchSubmitted", handleSearchSubmit);
    return () =>
      window.removeEventListener("searchSubmitted", handleSearchSubmit);
  }, [dispatch]);

  // Reset scale to 1.0 and turn off auto mode when a new search is performed
  useEffect(() => {
    // Check if there's state.searchQuery or similar property that changes with new searches
    if (state.searchQuery && state.searchQuery !== previousSearchRef.current) {
      // Reset scale to 1.0
      dispatch({
        type: "RESET_SCALE",
      });

      // Turn off auto mode
      setIsSnapEnabled(false);
      setShowOptimalScales(false);
      autoModeActivatedRef.current = false; // Reset auto mode flag

      // Update the previous search ref
      previousSearchRef.current = state.searchQuery;
    }
  }, [state.searchQuery, dispatch]);

  // If searchQuery isn't available, you might need to check for other indicators
  // like posts array length changing or similar
  useEffect(() => {
    if (state.posts && previousSearchRef.current !== state.posts.length) {
      // Reset scale to 1.0
      dispatch({
        type: "RESET_SCALE",
      });

      // Turn off auto mode
      setIsSnapEnabled(false);
      setShowOptimalScales(false);
      autoModeActivatedRef.current = false; // Reset auto mode flag

      // Update the previous search ref
      previousSearchRef.current = state.posts.length;
    }
  }, [state.posts, dispatch]);

  // Automatically enable snap mode when optimal scales are available
  useEffect(() => {
    if (optimalScales.length > 0 && !autoModeActivatedRef.current) {
      console.log(
        "Auto-enabling snap mode with optimal scales:",
        optimalScales
      );
      setIsSnapEnabled(true);
      setShowOptimalScales(true);
      autoModeActivatedRef.current = true;

      // Apply the scale closest to 1.0 but less than or equal to 1.0
      if (optimalScales.length > 0) {
        // Filter scales that are less than or equal to 1.0
        const scalesLessThanOne = optimalScales.filter((scale) => scale <= 1.0);

        // If we have scales <= 1.0, choose the largest (closest to 1.0)
        // Otherwise, pick the smallest scale (closest to 1.0 from above)
        const scaleClosestToOne =
          scalesLessThanOne.length > 0
            ? Math.max(...scalesLessThanOne)
            : Math.min(...optimalScales);

        console.log(
          "Applying scale closest to 1.0 but ≤ 1.0:",
          scaleClosestToOne
        );

        dispatch({
          type: "SET_SCALE",
          payload: scaleClosestToOne.toFixed(3),
        });
      }
    }
  }, [optimalScales, dispatch]);

  // Add a new effect to listen for the imagesLoaded event
  useEffect(() => {
    const handleImagesLoaded = (event) => {
      console.log("Scale.js: Received imagesLoaded event", event.detail);

      // Clear any existing timeout
      if (calculateTimeoutRef.current) {
        clearTimeout(calculateTimeoutRef.current);
      }

      // Set a timeout to calculate optimal scales after a short delay
      calculateTimeoutRef.current = setTimeout(() => {
        calculateOptimalScales();
      }, 500);
    };

    // Listen for both event types that Download.js dispatches
    window.addEventListener("imagesLoaded", handleImagesLoaded);
    window.addEventListener("imagesComplete", calculateOptimalScales);

    return () => {
      window.removeEventListener("imagesLoaded", handleImagesLoaded);
      window.removeEventListener("imagesComplete", calculateOptimalScales);
      if (calculateTimeoutRef.current) {
        clearTimeout(calculateTimeoutRef.current);
      }
    };
  }, []);

  // Find all cards and calculate their widths
  const calculateOptimalScales = () => {
    console.log("Calculating optimal scales");
    // Your existing calculation code
    const cards = document.querySelectorAll('[id^="scaleOptimizer"]');
    if (cards.length === 0) {
      console.log("No cards found");
      return;
    }

    // Extract the actual widths of all cards based on aspect ratio
    const cardWidths = Array.from(cards)
      .map((card) => {
        // Get the card ID to extract the image data
        const cardId = card.id.split("-")[1];

        // Try to find the aspect ratio data attribute or compute it from the image
        const mediaElement = card.querySelector("[data-aspect-ratio]");
        if (mediaElement) {
          const aspectRatio = parseFloat(mediaElement.dataset.aspectRatio);
          // Calculate width based on a fixed height (400px) and the aspect ratio
          return Math.max(aspectRatio * 400, 250); // Min width of 250px
        }

        // Fallback to measuring the actual rendered element
        const renderedMedia = card.querySelector('div[class*="rounded-lg"]');
        return renderedMedia ? renderedMedia.offsetWidth : 250;
      })
      .filter((width) => width > 0);

    if (cardWidths.length === 0) {
      console.log("No valid card widths found");
      return;
    }

    // Calculate the screen width
    const screenWidth = window.innerWidth;

    console.log("cardWidths: ", cardWidths);
    console.log("screenWidth: ", screenWidth);

    // Calculate optimal scales
    const scales = minimumgap(cardWidths, screenWidth, 15, 4);
    if (scales.length > 0) {
      console.log("Found optimal scales:", scales);
      setOptimalScales(scales);
      // Auto mode will be activated by the useEffect that watches optimalScales
    } else {
      console.log("No optimal scales found");
    }
  };

  useEffect(() => {
    // Create a mutation observer to watch for new cards
    const observer = new MutationObserver((mutations) => {
      // Check if all images have loaded
      const allCards = document.querySelectorAll('[id^="scaleOptimizer"]');
      if (allCards.length === 0) return;

      const allLoaded = Array.from(allCards).every(
        (card) => card.getAttribute("data-loaded") === "true"
      );

      if (allLoaded && allCards.length > 0) {
        console.log("Mutation observer: All cards are loaded");
        // Set a timeout to ensure all DOM updates are complete
        if (calculateTimeoutRef.current) {
          clearTimeout(calculateTimeoutRef.current);
        }
        calculateTimeoutRef.current = setTimeout(() => {
          calculateOptimalScales();
        }, 500);
      }
    });

    // Start observing the body for changes
    observer.observe(document.body, { childList: true, subtree: true });

    // Also calculate when window is resized
    window.addEventListener("resize", calculateOptimalScales);

    // If a search was submitted, we need to recalculate the optimal scales
    if (searchSubmittedRef.current) {
      if (calculateTimeoutRef.current) {
        clearTimeout(calculateTimeoutRef.current);
      }
      calculateTimeoutRef.current = setTimeout(() => {
        calculateOptimalScales();
        searchSubmittedRef.current = false;
      }, 1500); // Wait for new content to load
    }

    return () => {
      observer.disconnect();
      window.removeEventListener("resize", calculateOptimalScales);
      if (calculateTimeoutRef.current) {
        clearTimeout(calculateTimeoutRef.current);
      }
    };
  }, []); // Run only once

  const handleScaleChange = (e) => {
    const currentValue = parseFloat(e.target.value);

    if (isSnapEnabled && optimalScales.length > 0) {
      // Find the closest optimal scale
      const closestScale = optimalScales.reduce((prev, curr) =>
        Math.abs(curr - currentValue) < Math.abs(prev - currentValue)
          ? curr
          : prev
      );

      // In Auto mode, immediately snap to the closest optimal scale
      dispatch({
        type: "SET_SCALE",
        payload: closestScale.toFixed(3),
      });

      // Set the slider's value directly to ensure visual feedback
      e.target.value = closestScale;
      return;
    }

    // Normal mode - any value is allowed
    dispatch({
      type: "SET_SCALE",
      payload: parseFloat(currentValue).toFixed(3),
    });
  };

  const toggleSnapMode = () => {
    const newSnapState = !isSnapEnabled;
    setIsSnapEnabled(newSnapState);
    setShowOptimalScales(newSnapState);

    // When enabling snap mode, immediately snap to the closest optimal scale
    if (newSnapState && optimalScales.length > 0) {
      // Find the scale closest to 1.0
      const scaleClosestToOne = optimalScales.reduce((prev, curr) =>
        Math.abs(curr - 1.0) < Math.abs(prev - 1.0) ? curr : prev
      );

      dispatch({
        type: "SET_SCALE",
        payload: scaleClosestToOne.toFixed(3),
      });
    }
  };

  return (
    <div className="flex items-center relative h-10">
      <div
        id="scaleControl"
        className="flex items-center justify-between p-3 py-2 bg-primary rounded-full h-10"
      >
        <label
          htmlFor="scaleSlider"
          className="mx-2.5 text-foreground text-[15px] w-[40px]"
        >
          Scale
        </label>
        <input
          type="range"
          id="scaleSlider"
          min="0.500"
          max="1.800"
          step={isSnapEnabled && optimalScales.length > 0 ? "0.001" : "0.001"}
          value={state.scaleValue}
          onChange={handleScaleChange}
          className="cursor-pointer w-[180px] h-2.5 rounded-lg bg-gray-300 outline-none opacity-70 transition-opacity duration-200"
          style={{
            WebkitAppearance: "none",
            appearance: "none",
            height: "10px",
            borderRadius: "7.5px",
            background:
              isSnapEnabled && optimalScales.length > 0
                ? `linear-gradient(to right, #f0f0f0, ${optimalScales
                    .map(
                      (scale, i) =>
                        `#ff4500 ${((scale - 0.5) / 1.5) * 100}%, #f0f0f0 ${
                          ((scale - 0.5) / 1.5) * 100 + 1
                        }%`
                    )
                    .join(", ")}, #f0f0f0)`
                : "#f0f0f0",
            outline: "none",
            opacity: "0.7",
            transition: "opacity .2s, background .3s",
          }}
        />
        <span className="mx-2.5 text-foreground text-[15px] w-[40px] text-center">
          {parseFloat(state.scaleValue).toFixed(3)}
        </span>
        <button
          onClick={toggleSnapMode}
          className={`ml-2 ${
            isSnapEnabled && optimalScales.length > 0
              ? "bg-[#ff4400]"
              : "bg-gray-600"
          } text-white px-2 py-1 rounded-full text-xs hover:bg-[#ff440073] transition-colors`}
          title={
            isSnapEnabled && optimalScales.length > 0
              ? "Disable snap to optimal scales"
              : "Enable snap to optimal scales"
          }
          disabled={optimalScales.length === 0}
        >
          Auto
        </button>
      </div>

      <style jsx>{`
        #scaleSlider::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 15px;
          height: 15px;
          background: #ff4500;
          border-radius: 50%;
          cursor: pointer;
        }
      `}</style>
    </div>
  );
}
