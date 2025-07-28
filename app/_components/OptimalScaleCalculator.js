"use client";
import { useAppContext } from "./AppContext";
import { useEffect, useState, useRef, Fragment } from "react";
import { minimumgap } from "../_lib/OptimalLayoutCalculator";
import { motion } from "framer-motion";

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

        // Use a small animation effect when applying new scale
        dispatch({
          type: "SET_SCALE",
          payload: scaleClosestToOne.toFixed(3),
        });

        // Dispatch a UI event that can be used for animation
        window.dispatchEvent(
          new CustomEvent("optimalScaleApplied", {
            detail: { scale: scaleClosestToOne.toFixed(3) },
          })
        );
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
        <motion.label
          htmlFor="scaleSlider"
          className="mx-2.5 text-foreground text-[15px] w-[40px] font-medium"
        >
          Scale
        </motion.label>
        <div className="relative w-[180px]">
          <motion.div
            className="absolute top-1/2 left-0 right-0 h-[6px] -translate-y-1/2 rounded-full overflow-hidden"
            style={{
              background: "rgba(240, 240, 240, 0.6)",
              boxShadow: "inset 0 1px 2px rgba(0, 0, 0, 0.1)",
            }}
          >
            {/* Parallel line markers for optimal scales when in auto mode */}
            {isSnapEnabled &&
              optimalScales.length > 0 &&
              optimalScales.map((scale, index) => (
                <Fragment key={`marker-group-${index}`}>
                  {/* Main marker line */}
                  <div
                    className="absolute top-0 h-full w-[2px]"
                    style={{
                      left: `${((scale - 0.5) / 1) * 100}%`,
                      background: "#ff4500",
                      transform: "translateX(-50%)",
                      boxShadow: "0 0 4px rgba(255, 69, 0, 0.5)",
                      zIndex: 2,
                    }}
                  />
                  {/* Top highlight dot */}
                  <div
                    className="absolute top-0 w-[4px] h-[4px] rounded-full"
                    style={{
                      left: `${((scale - 0.5) / 1) * 100}%`,
                      background: "#ffffff",
                      transform: "translateX(-50%)",
                      boxShadow: "0 0 2px rgba(255, 255, 255, 0.8)",
                      zIndex: 3,
                    }}
                  />
                  {/* Bottom highlight dot */}
                  <div
                    className="absolute bottom-0 w-[4px] h-[4px] rounded-full"
                    style={{
                      left: `${((scale - 0.5) / 1) * 100}%`,
                      background: "#ffffff",
                      transform: "translateX(-50%)",
                      boxShadow: "0 0 2px rgba(255, 255, 255, 0.8)",
                      zIndex: 3,
                    }}
                  />
                </Fragment>
              ))}
            {/* Slider progress fill */}
            <motion.div
              className="absolute top-0 left-0 h-full"
              style={{
                width: `${((parseFloat(state.scaleValue) - 0.5) / 1) * 100}%`,
                background:
                  "linear-gradient(90deg, rgba(255,69,0,0.7) 0%, rgba(255,87,34,0.9) 100%)",
                borderRadius: "inherit",
                zIndex: 1,
              }}
            />
          </motion.div>
          <input
            type="range"
            id="scaleSlider"
            min="0.500"
            max="1.500"
            step="0.001"
            value={state.scaleValue}
            onChange={handleScaleChange}
            className="cursor-pointer w-[180px] rounded-full bg-transparent relative z-10 outline-none opacity-100 transition-opacity duration-200"
            style={{
              WebkitAppearance: "none",
              appearance: "none",
              height: "6px",
              borderRadius: "999px",
              verticalAlign: "middle",
              margin: "0 auto",
            }}
          />
        </div>
        <span
          className={`mx-2.5 text-foreground text-[15px] w-[40px] text-center font-medium ${
            isSnapEnabled ? "text-[#ff4500]" : "text-white"
          }`}
        >
          {parseFloat(state.scaleValue).toFixed(3)}
        </span>
        <button
          onClick={toggleSnapMode}
          className={`ml-2 text-white px-3 py-1 rounded-full text-xs font-medium relative overflow-hidden`}
          style={{
            background:
              isSnapEnabled && optimalScales.length > 0
                ? "linear-gradient(135deg, #ff5722, #ff4500)"
                : "linear-gradient(135deg, #757575, #616161)",
            boxShadow:
              isSnapEnabled && optimalScales.length > 0
                ? "0 2px 5px rgba(255, 69, 0, 0.3)"
                : "0 2px 5px rgba(0, 0, 0, 0.2)",
          }}
          disabled={optimalScales.length === 0}
          title={
            isSnapEnabled && optimalScales.length > 0
              ? "Disable snap to optimal scales"
              : "Enable snap to optimal scales"
          }
        >
          Auto
        </button>
      </div>

      <style jsx>{`
        #scaleSlider::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 12px;
          height: 12px;
          background: linear-gradient(135deg, #ff5722, #ff4500);
          border-radius: 50%;
          cursor: pointer;
          box-shadow: 0 0 0 2px rgba(255, 69, 0, 0.1),
            0 1px 3px rgba(0, 0, 0, 0.2);
          border: 1px solid rgba(255, 255, 255, 0.3);
          position: relative;
          top: -1px;
          transition: transform 0.15s ease, box-shadow 0.15s ease;
        }

        #scaleSlider::-webkit-slider-thumb:hover {
          box-shadow: 0 0 0 3px rgba(255, 69, 0, 0.15),
            0 2px 5px rgba(0, 0, 0, 0.25);
        }

        #scaleSlider::-webkit-slider-thumb:active {
          transform: scale(0.92);
          box-shadow: 0 0 0 2px rgba(255, 69, 0, 0.2),
            0 1px 2px rgba(0, 0, 0, 0.3);
        }

        #scaleSlider:focus {
          outline: none;
        }
      `}</style>
    </div>
  );
}
