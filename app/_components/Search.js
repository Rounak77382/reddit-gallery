"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import searchIcon from "../../public/icons/search.svg";
import Image from "next/image";
import Download from "./GalleryContent";
import { useAppContext } from "./AppContext";

export default function Search() {
  const { state, dispatch } = useAppContext();
  const [searchTerm, setSearchTerm] = useState("");
  const [subreddits, setSubreddits] = useState([]);
  const [postTime, setPostTime] = useState("day");
  const [postType, setPostType] = useState("top");
  const [postLimit, setPostLimit] = useState(10);
  const [formData, setFormData] = useState(null);

  useEffect(() => {
    async function fetchSubreddits() {
      if (searchTerm) {
        const response = await fetch(
          `/api/subreddits?subredditName=${searchTerm}`
        );
        const results = await response.json();
        setSubreddits(results);
      } else {
        setSubreddits([]);
      }
    }
    fetchSubreddits();
  }, [searchTerm]);

  const handleSubmit = (e) => {
    e.preventDefault();

    // Reset the scale to 1.0
    dispatch({ type: "RESET_SCALE" });

    // Dispatch a custom event to notify Scale component
    const searchEvent = new Event("searchSubmitted");
    window.dispatchEvent(searchEvent);

    const data = {
      searchTerm,
      postTime,
      postType,
      postLimit,
    };

    if (searchTerm) {
      // Add to search history using the context
      dispatch({
        type: "ADD_TO_HISTORY",
        payload: {
          name: searchTerm,
          postTime: postTime,
          postType: postType,
          postLimit: postLimit,
        }
      });
    }

    if (JSON.stringify(data) !== JSON.stringify(formData)) {
      setFormData(data);
      console.log("handleSubmit Form Data:", data);
    }
  };

  useEffect(() => {
    // Listen for sidebar subreddit selections
    const handleSidebarSelection = (event) => {
      const { subredditName, postTime, postType, postLimit, skipAutoSubmit } = event.detail;
      
      // Set all search parameters
      setSearchTerm(subredditName);
      
      // Only update these if they were provided in the event
      if (postTime) setPostTime(postTime);
      if (postType) setPostType(postType);
      if (postLimit) setPostLimit(postLimit);
      
      // Only auto-submit if not explicitly skipped
      if (!skipAutoSubmit) {
        // Auto-submit the form
        const submitButton = document.getElementById('formbutton');
        if (submitButton) {
          submitButton.click();
        }
      }
    };
  
    window.addEventListener('sidebarSubredditSelected', handleSidebarSelection);
    
    return () => {
      window.removeEventListener('sidebarSubredditSelected', handleSidebarSelection);
    };
  }, []);

  return (
    <>
      <form
        className="flex justify-center items-center m-2.5 w-7/10 rounded-3xl p-0.5 px-2 bg-primary z-10"
        onSubmit={handleSubmit}
      >
        <input
          className="w-full p-2 border-none rounded-2xl bg-primary text-foreground text-base outline-none"
          type="text"
          placeholder="Search subreddits"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          list="subreddit-list"
        />
        <datalist id="subreddit-list">
          {subreddits.map((subreddit) => (
            <option key={subreddit}>{subreddit}</option>
          ))}
        </datalist>
        <select
          id="postTime"
          className="mx-1 min-w-fit p-2 m-0 border-none rounded-full bg-secondary text-foreground text-base outline-none text-center appearance-none"
          value={postTime}
          onChange={(e) => setPostTime(e.target.value)}
        >
          <option value="day">Today</option>
          <option value="week">Week</option>
          <option value="month">Month</option>
          <option value="year">Year</option>
          <option value="all">All</option>
        </select>
        <select
          id="postType"
          className="mx-1 min-w-fit p-2 m-0 border-none rounded-full bg-secondary text-foreground text-base outline-none text-center appearance-none"
          value={postType}
          onChange={(e) => setPostType(e.target.value)}
        >
          <option value="top">Top</option>
          <option value="new">New</option>
          <option value="hot">Hot</option>
          <option value="rising">Rising</option>
        </select>
        <input
          type="number"
          id="postLimit"
          placeholder="10"
          className="mx-1 w-[9%] p-2 m-0 border-none rounded-full bg-secondary text-foreground text-base outline-none text-center appearance-none"
          style={{ appearance: "textfield" }}
          value={postLimit}
          onChange={(e) => setPostLimit(e.target.value)}
        />
        <style jsx>{`
          input[type="number"]::-webkit-outer-spin-button,
          input[type="number"]::-webkit-inner-spin-button {
            -webkit-appearance: none;
            margin: 0;
          }

          input[type="number"] {
            -moz-appearance: textfield;
          }
        `}</style>
        <button
          id="formbutton"
          type="submit"
          className="h-10 w-10 flex justify-center items-center mx-1"
        >
          <Image id="searchbtn" src={searchIcon} alt="Search Icon" />
        </button>
      </form>
      {formData &&
        createPortal(<Download formData={formData} />, document.body)}
    </>
  );
}