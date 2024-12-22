"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import searchIcon from "../../public/icons/search.svg";
import Image from "next/image";
import Download from "./Download";

export default function Search() {
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
    const data = {
      searchTerm,
      postTime,
      postType,
      postLimit,
    };
    if (JSON.stringify(data) !== JSON.stringify(formData)) {
      setFormData(data);
      console.log("handleSubmit Form Data:", data);
    }
  };

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
          className="mx-1 w-[14%] p-2 m-0 border-none rounded-full bg-secondary text-foreground text-base outline-none text-center appearance-none"
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
          className="mx-1 w-[14%] p-2 m-0 border-none rounded-full bg-secondary text-foreground text-base outline-none text-center appearance-none"
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
        <button id="formbutton" type="submit" className="h-10 w-10 flex justify-center items-center mx-1" >
          <Image id="searchbtn" src={searchIcon} alt="Search Icon" />
        </button>
      </form>
      {formData &&
        createPortal(<Download formData={formData} />, document.body)}
    </>
  );
}
