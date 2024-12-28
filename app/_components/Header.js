"use client";

import { useState, useRef, useEffect } from "react";
import Scale from "./Scale";
import Search from "./Search";
import Options from "./Options";
import { AppProvider } from "./Context";
import localFont from "next/font/local";

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
