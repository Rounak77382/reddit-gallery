"use client";

/**
 * Animation Configuration Settings
 *
 * This file provides shared animation configuration settings that can be
 * used across the Reddit Gallery application to ensure consistent animations.
 */

// Main animation variants used across the application
export const zoomAnimationVariants = {
  normal: {
    scale: 1,
    zIndex: 5,
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 30,
    },
  },
  zoomed: {
    scale: 1.15,
    zIndex: 50,
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 30,
    },
  },
};

// Slide animation variants for carousel
export const slideAnimationVariants = {
  enter: (direction) => {
    return {
      x: direction > 0 ? 500 : -500,
      opacity: 0,
    };
  },
  center: {
    x: 0,
    opacity: 1,
  },
  exit: (direction) => {
    return {
      x: direction < 0 ? 500 : -500,
      opacity: 0,
    };
  },
};

// Default transition settings
export const defaultTransition = {
  type: "spring",
  stiffness: 300,
  damping: 30,
};

// Quick transition for simple animations
export const quickTransition = {
  duration: 0.2,
  ease: "easeInOut",
};

/**
 * Helper comments for developers:
 *
 * 1. The 'layout' prop in Framer Motion
 *    When you add the 'layout' prop to a motion component, Framer Motion
 *    will automatically animate that component's position and size changes.
 *    This enables the smooth reflow effect when items resize.
 *
 * 2. Using 'transform: scale()' vs changing dimensions
 *    Scale transforms are handled by the GPU and don't trigger browser layout
 *    recalculations. This makes animations smoother and more performant
 *    than changing width/height directly.
 *
 * 3. Customizing transitions
 *    You can modify transition behavior by adjusting:
 *    - type: "spring" (natural movement) or "tween" (linear)
 *    - stiffness: higher values = more rigid springs (spring only)
 *    - damping: higher values = less bounce (spring only)
 *    - duration: animation length in seconds (tween only)
 *    - ease: "linear", "easeIn", "easeOut", "easeInOut", etc.
 */
