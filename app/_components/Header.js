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
      <div className="flex justify-between items-center flex-wrap border-b border-[#1a282d] h-auto mt-2 relative z-1">
        <h1
          className={`${VAG.variable} px-5 w-fit my-2 text-4xl font-extrabold `}
        >
          reddit gallery
        </h1>
        <div className="flex items-center justify-center w-[8/10]">
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
