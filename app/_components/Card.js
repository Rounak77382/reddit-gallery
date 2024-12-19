"use client";

import React from "react";
import Media from "./Media";

export default function Card({ imageData }) {
  const {
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

  return (
    <div className="relative h-[400px] min-w-[275px] flex justify-center items-center m-5 group hover:z-50 hover:scale-105 transition-transform duration-500 ease-in-out">
      <div className="flex flex-col justify-between absolute w-full bg-primary text-foreground h-full rounded-lg transform transition-transform duration-500 ease  group-hover:scale-y-[1.3] group-hover:-translate-y-2.5 z-10 p-1">
        <div className="flex flex-col justify-start items-start m-0 p-0 h-fit space-y-1">
          <a href={userurl} className="flex items-center space-x-1">
            <img
              src={author_dp}
              alt={`${author}'s profile`}
              className="opacity-0 group-hover:opacity-100 text-foreground w-6 h-6 rounded-full transition-opacity duration-500"
            />
            <div
              title={author}
              className="opacity-0 group-hover:opacity-100 text-aqua font-bold text-sm max-h-4 transition-opacity duration-500 -mt-1 px-2"
            >
              {author}
            </div>
            <div
              title={flair}
              className="opacity-0 group-hover:opacity-100 bg-[#d3f5ff] text-[#0b1416] px-1 rounded-lg max-h-4 text-xs overflow-hidden transition-opacity duration-500"
            >
              {flair}
            </div>
            <img
              src="/icons/dot.svg"
              alt="Separator"
              className="opacity-0 group-hover:opacity-100 h-3 transition-opacity duration-500"
            />
            <div
              title={`${posted_since}`}
              className="opacity-0 group-hover:opacity-100 text-foreground text-xs transition-opacity duration-500"
            >
              {posted_since}
            </div>
          </a>
          <p
            title={title}
            className="opacity-0 group-hover:opacity-100 mx-1.5 py-0 text-sm text-foreground truncate transition-opacity duration-500"
          >
            {title}
          </p>
        </div>
        <a href={siteurl} className="flex items-center m-0 mx-1.25 p-1 h-fit">
          <div className="flex justify-center items-center bg-secondary px-1 mr-2 py-0.5 rounded-lg m-0.25 hover:bg-[#1e4c57] cursor-pointer transition-colors duration-300">
            <img
              src="/icons/upvote.png"
              alt="Upvote"
              className="opacity-0 group-hover:opacity-100 h-4  transition-opacity duration-500"
            />
            <div className="flex items-center justify-center opacity-0 group-hover:opacity-100 text-foreground h-4 transition-opacity duration-500 mx-1">
              {upvotes}
            </div>
            <img
              src="/icons/downvote.png"
              alt="Downvote"
              className="opacity-0 group-hover:opacity-100 h-4  transition-opacity duration-500"
            />
            <div className="flex items-center justify-center opacity-0 group-hover:opacity-100 text-foreground h-4 transition-opacity duration-500 mx-1">
              {downvotes}
            </div>
          </div>
          <div className="flex justify-center items-center bg-secondary px-1.25 py-0.5 rounded-lg m-0.25 hover:bg-[#1e4c57] cursor-pointer transition-colors duration-300 px-1">
            <img
              src="/icons/comment.svg"
              alt="Comments"
              className="opacity-0 group-hover:opacity-100 h-4 mr-1 transition-opacity duration-500 mx-1"
            />
            <div className="flex items-center justify-center opacity-0 group-hover:opacity-100 text-foreground h-4 transition-opacity duration-500 mr-1">
              {comments}
            </div>
          </div>
        </a>
      </div>
      <Media image={imageData} />
    </div>
  );
}
