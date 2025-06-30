"use client";

import { useState, useEffect } from "react";
import { useAppContext } from "./AppContext";

export default function Sidebar() {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("history");
  const [topChannels, setTopChannels] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const { state, dispatch } = useAppContext();

  // Toggle sidebar open/closed
  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  // Fetch top subreddits once on component mount
  useEffect(() => {
    const fetchTopChannels = async () => {
      setIsLoading(true);
      try {
        // Fetch some popular subreddits - in a real app you'd have an API for this
        const popularSubreddits = [
          { name: "pics", followers: "29.8M" },
          { name: "funny", followers: "42.6M" },
          { name: "AskReddit", followers: "40.5M" },
          { name: "gaming", followers: "36.2M" },
          { name: "aww", followers: "32.4M" },
          { name: "Music", followers: "31.8M" },
          { name: "worldnews", followers: "30.4M" },
          { name: "movies", followers: "29.7M" },
          { name: "videos", followers: "26.3M" },
          { name: "science", followers: "28.9M" },
        ];

        setTopChannels(popularSubreddits);
      } catch (error) {
        console.error("Error fetching top channels:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTopChannels();
  }, []);

  const handleSelectSubreddit = (historyItem) => {
    if (typeof historyItem === "string") {
      historyItem = { name: historyItem };
    }

    // Create a synthetic event to update form fields without auto-submitting
    const searchEvent = new CustomEvent("sidebarSubredditSelected", {
      detail: {
        subredditName: historyItem.name,
        postTime: historyItem.postTime,
        postType: historyItem.postType,
        postLimit: historyItem.postLimit,
        // Add a flag to indicate not to auto-submit
        skipAutoSubmit: true,
      },
    });
    window.dispatchEvent(searchEvent);
  };

  return (
    <div
      className={`fixed top-0 left-0 h-full z-40 transition-all duration-300 ${
        isOpen ? "translate-x-0" : "-translate-x-[calc(100%-24px)]"
      }`}
    >
      {/* Sidebar Content */}
      <div className="flex h-full">
        <div className="w-64 bg-primary shadow-lg shadow-black/30 pt-16 flex flex-col">
          {/* Tabs */}
          <div className="flex border-b border-gray-700 mx-2">
            <button
              className={`flex-1 py-2 text-sm font-medium ${
                activeTab === "history"
                  ? "text-[#ff4500] border-b-2 border-[#ff4500]"
                  : "text-foreground"
              }`}
              onClick={() => setActiveTab("history")}
            >
              History
            </button>
            <button
              className={`flex-1 py-2 text-sm font-medium ${
                activeTab === "channels"
                  ? "text-[#ff4500] border-b-2 border-[#ff4500]"
                  : "text-foreground"
              }`}
              onClick={() => setActiveTab("channels")}
            >
              Top Channels
            </button>
          </div>

          {/* Content based on active tab */}
          <div className="flex-1 overflow-y-auto">
            {activeTab === "history" && (
              <div className="p-2">
                <h3 className="text-foreground text-xs uppercase font-semibold mb-2 px-2">
                  Recently Visited
                </h3>
                {state.searchHistory.length === 0 ? (
                  <p className="text-gray-500 text-sm px-2">No history yet</p>
                ) : (
                  <ul>
                    {state.searchHistory.map((item, index) => (
                      <li key={item.id || index} className="mb-1">
                        <button
                          onClick={() => handleSelectSubreddit(item)}
                          className="w-full text-left px-3 py-2 rounded hover:bg-secondary flex items-center justify-between text-foreground"
                        >
                          <div className="flex flex-col">
                            <span className="text-sm font-medium">
                              r/{item.name}
                            </span>
                            <span className="text-xs text-gray-400">
                              {item.postType}/{item.postTime}
                            </span>
                          </div>
                          <span className="text-xs text-gray-400">
                            {item.postLimit} posts
                          </span>
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}

            {activeTab === "channels" && (
              <div className="p-2">
                <h3 className="text-foreground text-xs uppercase font-semibold mb-2 px-2">
                  Popular Subreddits
                </h3>
                {isLoading ? (
                  <p className="text-gray-500 text-sm px-2">Loading...</p>
                ) : (
                  <ul>
                    {topChannels.map((channel, index) => (
                      <li key={index} className="mb-1">
                        <button
                          onClick={() => handleSelectSubreddit(channel.name)}
                          className="w-full text-left px-3 py-2 rounded hover:bg-secondary flex items-center justify-between text-foreground"
                        >
                          <span className="text-sm">r/{channel.name}</span>
                          <span className="text-xs text-gray-400">
                            {channel.followers}
                          </span>
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Toggle button */}
        <div className="flex items-center">
          <button
            onClick={toggleSidebar}
            className="bg-primary h-16 w-6 rounded-r-md flex items-center justify-center shadow-md"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className={`h-4 w-4 text-foreground transition-transform ${
                isOpen ? "rotate-180" : ""
              }`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
