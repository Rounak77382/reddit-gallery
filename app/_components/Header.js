"use client";

import { useState, useRef, useEffect } from "react";
import Scale from "./OptimalScaleCalculator";
import Search from "./Search";
import dynamic from "next/dynamic";
import { AppProvider } from "./AppContext";
import localFont from "next/font/local";

// Dynamically import Options with SSR disabled
const Options = dynamic(() => import("./UserSettings"), {
  ssr: false,
  loading: () => (
    <div className="flex items-center m-0 mx-[5px] animate-pulse">
      <div className="w-[60px] h-[35px] bg-gray-600 rounded-[20px]"></div>
    </div>
  ),
});

const VAG = localFont({
  src: [
    {
      path: "../../public/fonts/VAG Rounded Regular.ttf",
    },
  ],
  variable: "--font-vagrounded",
});

export default function Header() {
  return (
    <AppProvider>
      <div className="flex justify-between items-center flex-nowrap border-b border-[#1a282d] h-auto sticky top-0 bg-background z-50">
        <div className="flex items-center px-5">
          <img
            src="/icons/test_out_33.png"
            alt="icon"
            className="w-12 h-12 mr-2"
          />
          <h1 className={`${VAG.variable} w-fit my-2 text-3xl font-extrabold`}>
            reddit gallery
          </h1>
        </div>
        <div className="flex items-center justify-center flex-grow">
          <Search />
          <Scale />
        </div>
        <div className="flex items-center m-0 mx-[5px] ">
          <Options />
        </div>
      </div>
    </AppProvider>
  );
}
