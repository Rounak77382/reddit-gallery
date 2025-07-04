"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { createPortal } from "react-dom";
import searchIcon from "../../public/icons/search.svg";
import Image from "next/image";
import Download from "./GalleryContent";
import { useAppContext } from "./AppContext";

// Custom debounce hook that properly prevents intermediate requests
function useDebounce(value, delay) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => clearTimeout(timer);
  }, [value, delay]);

  return debouncedValue;
}

export default function Search() {
  const { state, dispatch } = useAppContext();
  const [searchTerm, setSearchTerm] = useState("");
  const [subreddits, setSubreddits] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [postTime, setPostTime] = useState("day");
  const [postType, setPostType] = useState("top");
  const [postLimit, setPostLimit] = useState(10);
  const [formData, setFormData] = useState(null);
  const searchRef = useRef(null);
  const dropdownRef = useRef(null);
  const fetchingRef = useRef(false);

  // Apply debounce to search term
  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  useEffect(() => {
    // Click outside handler to close dropdown
    function handleClickOutside(event) {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Use the debounced search term to trigger API calls
  useEffect(() => {
    if (debouncedSearchTerm.length > 1) {
      fetchSubreddits();
    } else {
      setSubreddits([]);
      setShowDropdown(false);
    }
  }, [debouncedSearchTerm]);

  const fetchSubreddits = useCallback(async () => {
    if (!debouncedSearchTerm || fetchingRef.current) return;

    fetchingRef.current = true;
    setIsLoading(true);

    try {
      const response = await fetch(
        `/api/subreddits?subredditName=${debouncedSearchTerm}`
      );
      if (!response.ok) throw new Error("Failed to fetch subreddits");

      const results = await response.json();
      setSubreddits(results);
      setShowDropdown(results.length > 0);
    } catch (error) {
      console.error("Error fetching subreddits:", error);
    } finally {
      setIsLoading(false);
      fetchingRef.current = false;
    }
  }, [debouncedSearchTerm]);

  const formatSubscribers = (count) => {
    if (count >= 1000000) {
      return `${(count / 1000000).toFixed(1)}m members`;
    } else if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}k members`;
    } else {
      return `${count} members`;
    }
  };

  const handleSubredditSelect = (subreddit) => {
    // Just set the search term and close dropdown
    setSearchTerm(subreddit.name);
    setShowDropdown(false);

    // Remove the auto-submission code
    // No need to reset scale, add to history, or update formData here
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Reset the scale to 1.0
    dispatch({ type: "RESET_SCALE" });

    // Dispatch a custom event to notify Scale component
    const searchEvent = new Event("searchSubmitted");
    window.dispatchEvent(searchEvent);

    const data = {
      searchTerm,
      postType,
      postLimit,
    };

    // Only include postTime when the type is 'top'
    if (postType === "top") {
      data.postTime = postTime;
    }

    if (searchTerm) {
      // Add to search history using the context
      const historyPayload = {
        name: searchTerm,
        postType: postType,
        postLimit: postLimit,
      };

      // Only include postTime in history when the type is 'top'
      if (postType === "top") {
        historyPayload.postTime = postTime;
      }

      dispatch({
        type: "ADD_TO_HISTORY",
        payload: historyPayload,
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
      const { subredditName, postTime, postType, postLimit, skipAutoSubmit } =
        event.detail;

      // Set all search parameters
      setSearchTerm(subredditName);

      // Only update these if they were provided in the event
      if (postType) setPostType(postType);
      if (postLimit) setPostLimit(postLimit);

      // Only set postTime if postType is 'top'
      if (postType === "top" && postTime) {
        setPostTime(postTime);
      }

      // Only auto-submit if not explicitly skipped
      if (!skipAutoSubmit) {
        // Auto-submit the form
        const submitButton = document.getElementById("formbutton");
        if (submitButton) {
          submitButton.click();
        }
      }
    };

    window.addEventListener("sidebarSubredditSelected", handleSidebarSelection);

    return () => {
      window.removeEventListener(
        "sidebarSubredditSelected",
        handleSidebarSelection
      );
    };
  }, []);

  return (
    <>
      <div ref={searchRef} className="relative flex flex-col w-7/10 mx-5">
        <form
          className="flex justify-center items-center m-2.5 w-full rounded-3xl p-0.5 px-2 bg-primary z-10 h-10"
          onSubmit={handleSubmit}
        >
          <input
            className="w-full p-2 border-none rounded-2xl bg-primary text-foreground text-base outline-none h-full"
            type="text"
            placeholder="Search subreddits"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onFocus={() => searchTerm.length > 1 && setShowDropdown(true)}
          />

          {postType === "top" ? (
            <select
              id="postTime"
              className="min-w-fit p-1.5 m-1 mx-[1px] border-none rounded-full bg-secondary text-foreground text-base outline-none text-center appearance-none"
              value={postTime}
              onChange={(e) => setPostTime(e.target.value)}
            >
              <option value="day">Today</option>
              <option value="week">Week</option>
              <option value="month">Month</option>
              <option value="year">Year</option>
              <option value="all">All</option>
            </select>
          ) : (
            // Use an actual select element but make it invisible
            <select
              tabIndex="-1"
              aria-hidden="true"
              disabled
              className="min-w-fit p-1.5 m-1 mx-[1px] border-none rounded-full bg-secondary text-foreground text-base outline-none text-center appearance-none"
              style={{
                opacity: "0",
                position: "relative",
                pointerEvents: "none",
              }}
            >
              <option>Month</option>
            </select>
          )}
          <select
            id="postType"
            className="min-w-fit p-1.5 m-1 mx-[1px] border-none rounded-full bg-secondary text-foreground text-base outline-none text-center appearance-none"
            value={postType}
            onChange={(e) => {
              setPostType(e.target.value);
              // Set default time period when switching to top
              if (e.target.value === "top" && postTime === "") {
                setPostTime("day");
              }
            }}
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
            className="w-[9%] p-1.5 m-1 mx-[1px] border-none rounded-full bg-secondary text-foreground text-base outline-none text-center appearance-none"
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

            .scrollbar-hide::-webkit-scrollbar {
              display: none;
            }

            .scrollbar-hide {
              -ms-overflow-style: none;
              scrollbar-width: none;
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

        {/* Reddit-style dropdown - with descriptions removed */}
        {showDropdown && (
          <div
            ref={dropdownRef}
            className="absolute top-full left-0 w-[60%] bg-[#1a282d] rounded-lg shadow-xl mt-1 z-50 max-h-[450px] overflow-y-auto scrollbar-hide"
          >
            {isLoading ? (
              <div className="flex justify-center items-center p-4 text-gray-400">
                Loading...
              </div>
            ) : subreddits.length > 0 ? (
              <div className="py-2">
                {subreddits.map((subreddit) => (
                  <div
                    key={subreddit.name}
                    className="flex items-center px-4 py-2 hover:bg-[#263940] cursor-pointer"
                    onClick={() => handleSubredditSelect(subreddit)}
                  >
                    <div className="w-8 h-8 rounded-full overflow-hidden mr-3 flex-shrink-0">
                      <img
                        src={subreddit.iconImg}
                        alt={subreddit.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.src = "/icons/dp.png";
                        }}
                      />
                    </div>
                    <div className="flex-grow">
                      <div className="flex items-center">
                        <span className="font-medium text-white">
                          {subreddit.displayName}
                        </span>
                        {subreddit.isNSFW && (
                          <span className="ml-2 px-1 py-0.5 text-xs bg-red-500 text-white rounded">
                            NSFW
                          </span>
                        )}
                      </div>
                      <div className="text-sm text-gray-400">
                        {formatSubscribers(subreddit.subscribers)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-4 text-center text-gray-400">
                No subreddits found
              </div>
            )}
          </div>
        )}
      </div>

      {formData &&
        createPortal(<Download formData={formData} />, document.body)}
    </>
  );
}
