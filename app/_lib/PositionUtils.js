"use client";

import { useState, useEffect, useRef } from "react";

/**
 * Custom hook to detect an element's position relative to the viewport edges.
 * This helps determine appropriate transform adjustments when an element is zoomed.
 *
 * @param {React.RefObject} ref - React ref object pointing to the DOM element to track
 * @param {number} edgeMargin - Distance from viewport edge to consider "at edge" (in pixels)
 * @param {number} headerHeight - Height of any fixed header to account for (in pixels)
 * @returns {Object} Position state object with isLeftEdge, isRightEdge, isTopEdge, isBottomEdge
 */
export function usePositionDetection(ref, edgeMargin = 180, headerHeight = 64) {
  const [position, setPosition] = useState({
    isLeftEdge: false,
    isRightEdge: false,
    isTopEdge: false,
    isBottomEdge: false,
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    width: 0,
    height: 0,
    viewportWidth: 0,
    viewportHeight: 0,
  });

  // Use a ref for the position to avoid excessive rerenders
  const positionRef = useRef(position);

  // Use a ref for the handler to maintain stable identity between renders
  const checkPositionRef = useRef();

  checkPositionRef.current = () => {
    if (!ref.current) return;

    const rect = ref.current.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    // Add extra top margin for the first row of items to account for header
    const topEdgeMargin =
      rect.top < 120
        ? edgeMargin + headerHeight + 30
        : edgeMargin + headerHeight;

    const newPosition = {
      isLeftEdge: rect.left < edgeMargin,
      isRightEdge: rect.right > viewportWidth - edgeMargin,
      isTopEdge: rect.top < topEdgeMargin,
      isBottomEdge: rect.bottom > viewportHeight - edgeMargin,
      left: rect.left,
      right: rect.right,
      top: rect.top,
      bottom: rect.bottom,
      width: rect.width,
      height: rect.height,
      viewportWidth,
      viewportHeight,
    };

    // Check if position changed significantly - increased threshold to reduce updates
    const hasPositionChanged =
      position.isLeftEdge !== newPosition.isLeftEdge ||
      position.isRightEdge !== newPosition.isRightEdge ||
      position.isTopEdge !== newPosition.isTopEdge ||
      position.isBottomEdge !== newPosition.isBottomEdge ||
      Math.abs(position.left - newPosition.left) > 10 || // Increased threshold further
      Math.abs(position.right - newPosition.right) > 10 ||
      Math.abs(position.top - newPosition.top) > 10 ||
      Math.abs(position.bottom - newPosition.bottom) > 10;

    // Only update if needed
    if (hasPositionChanged) {
      positionRef.current = newPosition;
      setPosition(newPosition);
    }
  };

  useEffect(() => {
    // Call the current version of the check function
    const checkPosition = () => {
      if (!ref.current) return;

      // Use requestAnimationFrame to debounce layout reads
      window.requestAnimationFrame(() => {
        const rect = ref.current.getBoundingClientRect();
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;

        // Add extra top margin for the first row of items to account for header
        const topEdgeMargin =
          rect.top < 120
            ? edgeMargin + headerHeight + 30
            : edgeMargin + headerHeight;

        const newPosition = {
          isLeftEdge: rect.left < edgeMargin,
          isRightEdge: rect.right > viewportWidth - edgeMargin,
          isTopEdge: rect.top < topEdgeMargin,
          isBottomEdge: rect.bottom > viewportHeight - edgeMargin,
          left: rect.left,
          right: rect.right,
          top: rect.top,
          bottom: rect.bottom,
          width: rect.width,
          height: rect.height,
          viewportWidth,
          viewportHeight,
        };

        // Check if position changed significantly - increased threshold to reduce updates
        const hasPositionChanged =
          position.isLeftEdge !== newPosition.isLeftEdge ||
          position.isRightEdge !== newPosition.isRightEdge ||
          position.isTopEdge !== newPosition.isTopEdge ||
          position.isBottomEdge !== newPosition.isBottomEdge ||
          Math.abs(position.left - newPosition.left) > 15 || // Increased threshold further
          Math.abs(position.right - newPosition.right) > 15 ||
          Math.abs(position.top - newPosition.top) > 15 ||
          Math.abs(position.bottom - newPosition.bottom) > 15;

        // Only update if needed
        if (hasPositionChanged) {
          positionRef.current = newPosition;
          setPosition(newPosition);
        }
      });
    };

    // Check position on mount
    checkPosition();

    // Create throttled versions of event handlers
    let scrollTicking = false;
    const throttledScrollHandler = () => {
      if (!scrollTicking) {
        scrollTicking = true;
        window.requestAnimationFrame(() => {
          checkPosition();
          scrollTicking = false;
        });
      }
    };

    let resizeTicking = false;
    const throttledResizeHandler = () => {
      if (!resizeTicking) {
        resizeTicking = true;
        window.requestAnimationFrame(() => {
          checkPosition();
          resizeTicking = false;
        });
      }
    };

    // Create a ResizeObserver to detect changes in the element's size
    const resizeObserver = new ResizeObserver(throttledResizeHandler);

    // Store current ref value for cleanup
    const currentRef = ref.current;

    if (currentRef) {
      resizeObserver.observe(currentRef);
    }

    // Check on scroll, resize, and during animations - with throttling
    window.addEventListener("resize", throttledResizeHandler);
    window.addEventListener("scroll", throttledScrollHandler);

    // Use MutationObserver to detect style changes (for transforms) - with throttling
    let mutationTicking = false;
    const throttledMutationHandler = () => {
      if (!mutationTicking) {
        mutationTicking = true;
        window.requestAnimationFrame(() => {
          checkPosition();
          mutationTicking = false;
        });
      }
    };

    const mutationObserver = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        if (
          mutation.attributeName === "style" ||
          mutation.attributeName === "class"
        ) {
          throttledMutationHandler();
          break; // Process only once per batch
        }
      }
    });

    if (currentRef) {
      mutationObserver.observe(currentRef, {
        attributes: true,
        attributeFilter: ["style", "class"],
      });
    }

    return () => {
      window.removeEventListener("resize", throttledResizeHandler);
      window.removeEventListener("scroll", throttledScrollHandler);
      if (currentRef) {
        resizeObserver.disconnect();
        mutationObserver.disconnect();
      }
    };
    // Only depend on the ref and configuration values, not on the position itself
  }, [ref, edgeMargin, headerHeight, position]);

  return position;
}

/**
 * Generate Framer Motion animation variants based on element position
 * to ensure zoomed elements stay in the visual viewport.
 *
 * @param {Object} position - Position object from usePositionDetection
 * @param {number} scale - Scale factor for the zoomed state (default: 1.05)
 * @param {number} offsetX - Horizontal offset to apply at edges (default: 20px)
 * @param {number} offsetY - Vertical offset to apply at edges (default: 30px)
 * @returns {Object} Framer Motion variants object
 */
export function getPositionAwareVariants(
  position,
  scale = 1.05,
  offsetX = 20,
  offsetY = 30
) {
  // Create variants with dynamic offsets - optimized for performance
  const variants = {
    normal: {
      scale: 1,
      x: 0,
      y: 0,
      zIndex: 5,
      transition: {
        type: "tween",
        duration: 0.3, // Faster transition
        ease: "easeOut", // Consistent easing function
      },
    },
    zoomed: {
      scale: scale,
      // Calculate x offset based on position
      x: !("left" in position)
        ? position.isLeftEdge
          ? offsetX
          : position.isRightEdge
          ? -offsetX
          : 0
        : position.left < 20
        ? Math.min(offsetX, 20 - position.left)
        : position.viewportWidth - position.right < 20
        ? Math.max(-offsetX, position.viewportWidth - 20 - position.right)
        : 0,
      // Calculate y offset based on position
      y: !("top" in position)
        ? position.isTopEdge
          ? offsetY
          : position.isBottomEdge
          ? -offsetY
          : 0
        : position.top < 20 + 64 // 64 is header height
        ? Math.min(offsetY, 20 + 64 - position.top)
        : position.viewportHeight - position.bottom < 20
        ? Math.max(-offsetY, position.viewportHeight - 20 - position.bottom)
        : 0,
      zIndex: 50,
      transition: {
        type: "tween",
        duration: 0.3, // Faster transition
        ease: "easeOut",
      },
    },
  };

  return variants;
}
