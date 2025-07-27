"use client";

import React, { useRef, useEffect, useState } from "react";
import Media from "./Media";
import { useAppContext } from "./AppContext";

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

  // Add refs and state for position detection
  const cardRef = useRef(null);
  const positionCheckerRef = useRef(null);
  const [position, setPosition] = useState({
    isLeftEdge: false,
    isRightEdge: false,
    isTopEdge: false,
    isBottomEdge: false,
  });

  // Effect to detect card position relative to viewport
  useEffect(() => {
    const checkPosition = () => {
      if (!cardRef.current) return;

      const rect = cardRef.current.getBoundingClientRect();
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;

      // Define margins (distance from edge to consider "at edge")
      const edgeMargin = 150;
      const headerHeight = 64;

      const newPosition = {
        isLeftEdge: rect.left < edgeMargin,
        isRightEdge: rect.right > viewportWidth - edgeMargin,
        isTopEdge: rect.top < edgeMargin + headerHeight,
        isBottomEdge: rect.bottom > viewportHeight - edgeMargin,
      };

      // Only update state if position actually changed
      if (JSON.stringify(newPosition) !== JSON.stringify(position)) {
        setPosition(newPosition);
      }
    };

    // Check position on mount
    checkPosition();

    // Check on scroll and resize
    window.addEventListener("resize", checkPosition);
    window.addEventListener("scroll", checkPosition);

    // Use IntersectionObserver instead of interval for better performance
    const observer = new IntersectionObserver(
      (entries) => {
        // When visibility changes, check position
        checkPosition();
      },
      { threshold: [0, 0.5, 1] }
    );

    // Store current ref value in a variable for cleanup
    const currentRef = cardRef.current;

    if (currentRef) {
      observer.observe(currentRef);
    }

    return () => {
      window.removeEventListener("resize", checkPosition);
      window.removeEventListener("scroll", checkPosition);
      if (currentRef) {
        observer.unobserve(currentRef);
      }
      observer.disconnect();
    };
  }, [position]);

  const handleVote = async (direction) => {
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
  };

  // Generate position-based transform classes
  const getPositionClasses = () => {
    // Base classes that always apply
    let classes =
      "relative h-[400px] flex justify-center items-center m-1 group hover:z-50 transition-all duration-500 ease-in-out shadow-lg shadow-black/50";

    // Default hover scaling
    let hoverTransform = "hover:scale-105";

    // Adjust hover transform based on position
    if (position.isLeftEdge) {
      hoverTransform = "hover:scale-105 hover:translate-x-3";
    } else if (position.isRightEdge) {
      hoverTransform = "hover:scale-105 hover:-translate-x-3";
    }

    if (position.isTopEdge) {
      // Add more downward propagation for content at the top edge to account for header
      hoverTransform += " hover:translate-y-16";
    } else if (position.isBottomEdge) {
      hoverTransform += " hover:-translate-y-10";
    }

    return `${classes} ${hoverTransform}`;
  };

  return (
    <div
      ref={cardRef}
      className={getPositionClasses()}
      style={{
        width: `${Math.max(
          Math.round(Math.min(parseFloat(aspect_ratio || 1.33), 2) * 400),
          250
        )}px`,
      }}
      data-aspect-ratio={Math.min(parseFloat(aspect_ratio || 1.33), 2)}
    >
      <div className="flex flex-col justify-between absolute w-full bg-primary text-foreground h-[125%] rounded-lg transform scale-y-[0.75] transition-transform duration-500 ease group-hover:scale-y-[1] group-hover:-translate-y-3.5 z-10 p-1 shadow-lg shadow-black/50 opacity-0 group-hover:opacity-100 ">
        {/* Card content remains the same */}
        <div className="flex flex-col justify-start items-start m-0 p-0 h-fit space-y-2 ">
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
      </div>
      <Media imageData={imageData} />
    </div>
  );
}
