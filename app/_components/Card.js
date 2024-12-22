"use client";

import React from "react";
import Media from "./Media";
import { useState } from "react";
import { useAppContext } from "./Context";

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
  const [voteStatus, setVoteStatus] = useState(0); // -1 for downvote, 0 for no vote, 1 for upvote
  const [localUpvotes, setLocalUpvotes] = useState(parseInt(upvotes));
  const [localDownvotes, setLocalDownvotes] = useState(parseInt(downvotes));

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
          r: state.accessToken,
        }),
      });

      if (response.ok) {
        // Update local state
        const newVoteStatus = direction === voteStatus ? 0 : direction;
        setVoteStatus(newVoteStatus);

        // Update vote counts
        if (newVoteStatus === 1) {
          setLocalUpvotes((prev) => prev + 1);
          if (voteStatus === -1) {
            setLocalDownvotes((prev) => prev - 1);
          }
        } else if (newVoteStatus === -1) {
          setLocalDownvotes((prev) => prev + 1);
          if (voteStatus === 1) {
            setLocalUpvotes((prev) => prev - 1);
          }
        } else {
          // Removing vote
          if (voteStatus === 1) {
            setLocalUpvotes((prev) => prev - 1);
          } else {
            setLocalDownvotes((prev) => prev - 1);
          }
        }
        const message = `${direction === 1 ? "up" : "down"}voted to ${title}`;
        console.log(message);
      } else {
        alert("Failed to vote");
      }
    } catch (error) {
      console.error("Error voting:", error);
    }
  };

  return (
    <div
      id={id}
      className="relative h-[400px] flex justify-center items-center m-5 group hover:z-50 hover:scale-105 transition-transform duration-500 ease-in-out shadow-lg shadow-black/50"
    >
      <div className="flex flex-col justify-between absolute w-full bg-primary text-foreground h-[125%] rounded-lg transform scale-y-[0.75] transition-transform duration-500 ease group-hover:scale-y-[1] group-hover:-translate-y-3.5 z-10 p-1 shadow-lg shadow-black/50 opacity-0 group-hover:opacity-100">
        <div className="flex flex-col justify-start items-start m-0 p-0 h-fit space-y-2">
          <a href={userurl} className="flex items-center space-x-1">
            <img
              src={author_dp}
              alt={`${author}'s profile`}
              className="text-foreground w-6 h-6 rounded-full"
            />
            <div
              title={author}
              className="text-aqua font-bold text-sm max-h-4 -mt-1 px-1"
            >
              {author}
            </div>
            <div
              title={flair}
              className="bg-[#d3f5ff] text-[#0b1416] px-1 rounded-lg max-h-4 text-xs overflow-hidden"
            >
              {flair}
            </div>
            <img
              src="/icons/dot.svg"
              alt="Separator"
              className="h-3"
            />
            <div
              title={`${posted_since}`}
              className="text-foreground text-xs"
            >
              {posted_since}
            </div>
          </a>
          <p
            title={title}
            className="mx-1.5 py-0 text-sm text-foreground truncate"
          >
            {title}
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
              {comments}
            </div>
          </div>
        </div>
      </div>
      <Media imageData={imageData} />
    </div>
  );
}
