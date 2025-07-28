"use client";

import React, { useRef, useState } from "react";
import Media from "./Media";
import { useAppContext } from "./AppContext";
import { motion } from "framer-motion"; // Import framer-motion
import {
  usePositionDetection,
  getPositionAwareVariants,
} from "../_lib/PositionUtils";

// Helper function to convert vote string (like "10K", "1.5M") to number
const parseVotes = (voteStr) => {
  if (typeof voteStr === "number") return voteStr;
  if (!voteStr) return 0;

  const str = String(voteStr).trim().toUpperCase();
  if (str.endsWith("K")) {
    return parseFloat(str.replace("K", "")) * 1000;
  } else if (str.endsWith("M")) {
    return parseFloat(str.replace("M", "")) * 1000000;
  } else {
    return parseInt(str) || 0;
  }
};

// Helper function to format number back to string with K, M notation
const formatVotes = (votes) => {
  if (votes >= 1000000) {
    return Math.floor(votes / 1000000) + "M";
  } else if (votes >= 1000) {
    return Math.floor(votes / 1000) + "K";
  } else {
    return votes.toString();
  }
};

export default function Card({ imageData }) {
  const {
    id,
    url,
    aspect_ratio,
    title,
    author,
    author_dp,
    posted_since,
    flair,
    comments,
    upvotes,
    downvotes,
    siteurl,
    userurl,
    mediaurl,
    isNSFW,
  } = imageData;

  const { state } = useAppContext();
  const [voteStatus, setVoteStatus] = useState(0);
  const [localUpvotes, setLocalUpvotes] = useState(
    upvotes ? upvotes.toString().toUpperCase() : "0"
  );
  const [localDownvotes, setLocalDownvotes] = useState(
    downvotes ? downvotes.toString().toUpperCase() : "0"
  );
  const [isZoomed, setIsZoomed] = useState(false);

  // Add refs for position detection
  const cardRef = useRef(null);

  // Use our custom hook to detect position
  const position = usePositionDetection(cardRef, 180, 64);

  const handleVote = React.useCallback(
    async (direction) => {
      if (!state.isLoggedIn) {
        alert("Please log in to vote");
        return;
      }

      try {
        const response = await fetch(`/api/vote`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            id: id,
            direction: direction,
            accessToken: state.accessToken,
          }),
        });

        if (response.ok) {
          // Update local state
          const newVoteStatus = direction === voteStatus ? 0 : direction;
          setVoteStatus(newVoteStatus);

          // Don't update displayed vote counts if they're in K or M format
          const upvotesHasNotation =
            typeof localUpvotes === "string" &&
            (localUpvotes.includes("K") || localUpvotes.includes("M"));

          const downvotesHasNotation =
            typeof localDownvotes === "string" &&
            (localDownvotes.includes("K") || localDownvotes.includes("M"));

          // Only update when not in K/M notation
          if (newVoteStatus === 1) {
            if (!upvotesHasNotation) {
              const upvotesNum = parseVotes(localUpvotes) + 1;
              setLocalUpvotes(formatVotes(upvotesNum));
            }

            if (voteStatus === -1 && !downvotesHasNotation) {
              const downvotesNum = parseVotes(localDownvotes) - 1;
              setLocalDownvotes(formatVotes(downvotesNum));
            }
          } else if (newVoteStatus === -1) {
            if (!downvotesHasNotation) {
              const downvotesNum = parseVotes(localDownvotes) + 1;
              setLocalDownvotes(formatVotes(downvotesNum));
            }

            if (voteStatus === 1 && !upvotesHasNotation) {
              const upvotesNum = parseVotes(localUpvotes) - 1;
              setLocalUpvotes(formatVotes(upvotesNum));
            }
          } else {
            // Removing vote
            if (voteStatus === 1 && !upvotesHasNotation) {
              const upvotesNum = parseVotes(localUpvotes) - 1;
              setLocalUpvotes(formatVotes(upvotesNum));
            } else if (voteStatus === -1 && !downvotesHasNotation) {
              const downvotesNum = parseVotes(localDownvotes) - 1;
              setLocalDownvotes(formatVotes(downvotesNum));
            }
          }
        } else {
          alert("Failed to vote");
        }
      } catch (error) {
        console.error("Error voting:", error);
      }
    },
    [
      id,
      localDownvotes,
      localUpvotes,
      state.accessToken,
      state.isLoggedIn,
      voteStatus,
    ]
  );

  // Generate position-based transform classes - memoized to avoid recalculations
  const getPositionClasses = React.useMemo(() => {
    // Base classes that always apply
    let classes =
      "relative h-[400px] flex justify-center items-center m-1 group hover:z-50 transition-all duration-700 ease-in-out shadow-lg shadow-black/50";

    // Origin classes based on position
    if ("left" in position && "right" in position) {
      // If we have detailed position data, use it for more precise calculations
      // Removed unused variables for performance
      // Determine the dominant edge for transform-origin
      if (
        Math.abs(position.left) <
        Math.abs(position.right - position.viewportWidth)
      ) {
        classes += " origin-left";
      } else {
        classes += " origin-right";
      }

      if (
        Math.abs(position.top - 64) <
        Math.abs(position.bottom - position.viewportHeight)
      ) {
        classes += " origin-top";
      } else {
        classes += " origin-bottom";
      }
    } else {
      // Fallback to basic position flags
      if (position.isLeftEdge) {
        classes += " origin-left";
      } else if (position.isRightEdge) {
        classes += " origin-right";
      }

      if (position.isTopEdge) {
        classes += " origin-top";
      } else if (position.isBottomEdge) {
        classes += " origin-bottom";
      }
    }

    return classes;
  }, [position]); // Only recalculate when position changes

  // Get position-aware animation variants - memoized to avoid recalculation
  const cardVariants = React.useMemo(
    () => getPositionAwareVariants(position, 1.05, 20, 30),
    [position]
  );

  // More precise detection of first row: check if top edge is within header height + some margin
  // This ensures we only apply special behavior to cards directly under the header
  const headerHeight = 64; // Header height in pixels
  const isFirstRow =
    position.top !== undefined && position.top < headerHeight + 80;

  // Memoize content variants to avoid recreation on each render
  const contentVariants = React.useMemo(
    () => ({
      hidden: {
        opacity: 0,
        scaleY: 0.75,
        y: 0,
        zIndex: 1, // Lower z-index when hidden
        transition: {
          duration: 0.2, // Faster exit transition
          ease: "easeOut", // Changed to easeOut for smoother exit
        },
      },
      visible: {
        opacity: 1,
        scaleY: 1,
        // Only first row gets extra downward movement on hover
        y: isFirstRow ? 60 : 0,
        zIndex: 5, // Higher z-index when visible, but still below media
        transition: {
          duration: 0.3, // Slightly faster transition
          ease: "easeOut",
        },
      },
    }),
    [isFirstRow]
  );

  // Create separate variants for the media to match the card movement - memoized
  const mediaVariants = React.useMemo(
    () => ({
      normal: {
        y: 0,
        zIndex: 10, // Always keep media on top
        transition: {
          duration: 0.3, // Match content transition duration
          ease: "easeOut", // Changed to easeOut for smoother exit
        },
      },
      zoomed: {
        // Move media down by the same amount as the card content for first row
        y: isFirstRow ? 60 : 0,
        zIndex: 10, // Always keep media on top
        transition: {
          duration: 0.3, // Match content transition duration
          ease: "easeOut",
        },
      },
    }),
    [isFirstRow]
  );

  return (
    <motion.div
      ref={cardRef}
      className={getPositionClasses}
      style={{
        width: `${Math.max(
          Math.round(Math.min(parseFloat(aspect_ratio || 1.33), 2) * 400),
          250
        )}px`,
        willChange: "transform", // Help browser optimize animations
      }}
      data-aspect-ratio={Math.min(parseFloat(aspect_ratio || 1.33), 2)}
      // Optimized Framer Motion props
      layout="position" // Use "position" instead of true for better performance
      initial="normal"
      animate={isZoomed ? "zoomed" : "normal"}
      variants={cardVariants}
      whileHover="zoomed" // Use the zoomed variant on hover
      onHoverStart={() => setIsZoomed(true)}
      onHoverEnd={() => setIsZoomed(false)}
      transition={{ layout: { type: "tween", duration: 0.3 } }} // Optimize layout transition
    >
      <motion.div
        className={`flex flex-col justify-between absolute w-full bg-primary text-foreground rounded-lg z-[5] p-1 shadow-lg shadow-black/50 sharp-text ${
          isZoomed ? "h-[125%]" : "h-0"
        }`}
        initial="hidden"
        animate={isZoomed ? "visible" : "hidden"}
        variants={contentVariants}
        exit="hidden"
        style={{
          transformOrigin: "top",
          overflow: "hidden",
          transition:
            "height 0.3s cubic-bezier(0.4, 0.0, 0.2, 1), top 0.3s cubic-bezier(0.4, 0.0, 0.2, 1)",
          top: isZoomed ? "-65px" : "0",
        }}
      >
        {/* Title and author section - simplified for performance */}
        <div className="flex flex-col justify-start items-start m-0 p-0 h-fit space-y-2">
          <a href={userurl} className="flex items-center">
            <img
              src={author_dp || "https://www.reddit.com/static/noavatar.png"}
              alt={`${author || "User"}'s profile`}
              className="text-foreground w-6 h-6 rounded-full"
            />
            <div
              title={author || "Unknown"}
              className="text-aqua font-bold text-sm max-h-4 -mt-1 ml-1 px-1 truncate"
            >
              {author || "Unknown"}
            </div>
            {flair && flair !== "none" && (
              <div
                title={flair}
                className="bg-[#d3f5ff] text-[#0b1416] px-1 rounded-lg max-h-4 text-xs overflow-hidden"
              >
                {flair}
              </div>
            )}
            <img src="/icons/dot.svg" alt="Separator" className="w-5" />

            <div
              title={`${posted_since || "Unknown time"}`}
              className="text-foreground text-xs whitespace-nowrap text-ellipsis flex-shrink-0 truncate"
            >
              {posted_since || "Unknown time"}
            </div>
          </a>
          <p
            title={title || ""}
            className="text-base text-foreground truncate max-w-full"
          >
            {title || ""}
          </p>
        </div>
        <div className="flex items-center m-0 mx-1.25 p-1 h-fit">
          <div className="flex justify-center items-center bg-secondary px-1 mr-2 py-0.5 rounded-lg m-0.25 hover:bg-[#1e4c57] cursor-pointer transition-colors duration-300">
            <button
              onClick={() => handleVote(1)}
              className="flex items-center border-none bg-transparent cursor-pointer"
            >
              <img
                src={
                  voteStatus === 1
                    ? "/icons/upvote_clicked.png"
                    : "/icons/upvote.png"
                }
                alt="Upvote"
                className="h-4"
                onMouseEnter={(e) =>
                  (e.target.src =
                    voteStatus === 1
                      ? "/icons/upvote_clicked.png"
                      : "/icons/upvote_hovered.png")
                }
                onMouseLeave={(e) =>
                  (e.target.src =
                    voteStatus === 1
                      ? "/icons/upvote_clicked.png"
                      : "/icons/upvote.png")
                }
              />
              <div className="flex items-center justify-center text-foreground h-4 mx-1">
                {localUpvotes}
              </div>
            </button>
            <button
              onClick={() => handleVote(-1)}
              className="flex items-center border-none bg-transparent cursor-pointer"
            >
              <img
                src={
                  voteStatus === -1
                    ? "/icons/downvote_clicked.png"
                    : "/icons/downvote.png"
                }
                alt="Downvote"
                className="h-4"
                onMouseEnter={(e) =>
                  (e.target.src =
                    voteStatus === -1
                      ? "/icons/downvote_clicked.png"
                      : "/icons/downvote_hovered.png")
                }
                onMouseLeave={(e) =>
                  (e.target.src =
                    voteStatus === -1
                      ? "/icons/downvote_clicked.png"
                      : "/icons/downvote.png")
                }
              />
              <div className="flex items-center justify-center text-foreground h-4 mx-1">
                {localDownvotes}
              </div>
            </button>
          </div>
          <div className="flex justify-center items-center bg-secondary px-1.25 py-0.5 rounded-lg m-0.25 hover:bg-[#1e4c57] cursor-pointer transition-colors duration-300 px-1">
            <img
              src="/icons/comment.svg"
              alt="Comments"
              className="h-4 mr-1 mx-1"
            />
            <div className="flex items-center justify-center text-foreground h-4 mr-1">
              {comments || "0"}
            </div>
          </div>
        </div>
      </motion.div>
      <motion.div
        className="absolute w-full h-full z-[10]"
        variants={mediaVariants}
        initial="normal"
        animate={isZoomed ? "zoomed" : "normal"}
        style={{
          pointerEvents: "auto", // Make sure media always receives mouse events
        }}
      >
        <Media imageData={imageData} />
      </motion.div>
    </motion.div>
  );
}
