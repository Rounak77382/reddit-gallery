"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useAppContext } from "./Context";

export default function Options() {
  const [showDropdown, setShowDropdown] = useState(false);
  const [smartScale, setSmartScale] = useState(true);
  const [safeSearch, setSafeSearch] = useState(true);
  const [darkMode, setDarkMode] = useState(true);
  const dropdownRef = useRef(null);
  const { state, dispatch } = useAppContext();
  const [authWindow, setAuthWindow] = useState(null);

  const nameRef = useRef("Nan");
  const profilePictureRef = useRef("/icons/dp.png");

  const handleLogin = useCallback(() => {
    const width = window.innerWidth * 0.75;
    const height = window.innerHeight * 0.75;
    const left = window.screenX + (window.outerWidth - width) / 2;
    const top = window.screenY + (window.outerHeight - height) / 2;

    const newAuthWindow = window.open(
      "/api/auth/authorize",
      "Reddit Authorization",
      `width=${width},height=${height},left=${left},top=${top}`
    );

    setAuthWindow(newAuthWindow);
  }, []);

  const handleLogout = useCallback(() => {
    dispatch({ type: "LOGOUT" });
    nameRef.current = "Nan";
    profilePictureRef.current = "/icons/dp.png";
  }, [dispatch]);

  useEffect(() => {
    const handleOAuthCallback = (event) => {
      if (event.origin !== window.location.origin) return;

      if (event.data.type === "oauth-callback") {
        console.log("Received OAuth callback:", event.data);

        const { r, name, dp } = event.data;
        if (r) {
          console.log("Login successful:", r);
          dispatch({
            type: "LOGIN",
            payload: r,
          });
          if (authWindow) authWindow.close();

          nameRef.current = name;
          profilePictureRef.current = dp;
        }
      }
    };

    window.addEventListener("message", handleOAuthCallback);

    return () => {
      window.removeEventListener("message", handleOAuthCallback);
    };
  }, [authWindow, dispatch]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    if (darkMode) {
      root.classList.add("dark-mode");
    } else {
      root.classList.remove("dark-mode");
    }
  }, [darkMode]);

  const handleNSFWToggle = () => {
    if (state.isNSFWAllowed) {
      dispatch({ type: "BLOCK_NSFW" });
    } else {
      dispatch({ type: "ALLOW_NSFW" });
    }
  };

  return (
    <>
      <div className="flex justify-center w-[60px] p-2 mx-[2px] rounded-[20px] bg-[#1a282d] text-white hover:bg-[#472323] active:scale-90 transition-all duration-300 ease-in-out">
        <button
          onClick={handleNSFWToggle}
          className="text-white bg-transparent border-none font-medium cursor-pointer text-[15px]"
        >
          {state.isNSFWAllowed ? "NSFW" : "SFW"}
        </button>
      </div>

      {!state.isLoggedIn && (
        <div className="flex justify-center w-[60px] p-2 mx-[5px] rounded-[20px] bg-[#ff4400e7] text-white hover:bg-[#ff440073] active:scale-90 transition-all duration-300 ease-in-out">
          <button
            className="text-white bg-transparent border-none font-medium cursor-pointer text-[15px]"
            onClick={handleLogin}
          >
            Login
          </button>
        </div>
      )}

      <div className="relative">
        <div
          onClick={() => setShowDropdown(!showDropdown)}
          className="mx-[5px] w-[35px] h-[35px] rounded-full bg-gradient-to-b from-black to-[#7b7b7b] hover:cursor-pointer active:scale-90 transition-all duration-300 ease-in-out"
        >
          <img
            src={profilePictureRef.current}
            alt="Profile"
            className="w-[33px] h-[33px] flex rounded-full border-none m-[1px]"
          />
        </div>

        {showDropdown && (
          <div
            ref={dropdownRef}
            className="absolute right-0 mt-2 w-80 bg-[#1a282d] rounded-lg shadow-xl py-2 z-50"
          >
            {state.isLoggedIn ? (
              <div className="px-4 py-3 border-b border-gray-700">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-b from-black to-[#7b7b7b] p-0.5">
                    <img
                      src={profilePictureRef.current}
                      className="w-full h-full rounded-full"
                      alt="Profile"
                    />
                  </div>
                  <div className="flex flex-col">
                    <button className="text-white hover:text-gray-300 text-left text-sm font-medium">
                      View Profile
                    </button>
                    <span className="text-gray-400 text-xs">
                      u/{nameRef.current}
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="px-4 py-2 hover:bg-[#2a383d] flex items-center justify-between">
                <button
                  onClick={handleLogin}
                  className="flex items-center space-x-3"
                >
                  <img
                    src="/icons/logout.png"
                    className="w-5 h-5 opacity-80"
                    alt=""
                  />
                  <span className="text-white text-sm">Log In / Sign Up</span>
                </button>
              </div>
            )}

            <div className="px-4 py-2 hover:bg-[#2a383d] flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <img
                  src="/icons/scale.png"
                  className="w-5 h-5 opacity-80"
                  alt=""
                />
                <span className="text-white text-sm">Smart Scale</span>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={smartScale}
                  onChange={() => setSmartScale(!smartScale)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-600 rounded-full peer peer-checked:bg-[#ff4400] peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all"></div>
              </label>
            </div>

            <div className="px-4 py-2 hover:bg-[#2a383d] flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <img
                  src="/icons/adult.png"
                  className="w-5 h-5 opacity-80"
                  alt=""
                />
                <span className="text-white text-sm">Safe Search</span>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={safeSearch}
                  onChange={() => setSafeSearch(!safeSearch)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-600 rounded-full peer peer-checked:bg-[#ff4400] peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all"></div>
              </label>
            </div>

            <div className="px-4 py-2 hover:bg-[#2a383d] flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <img
                  src="/icons/dark.png"
                  className="w-5 h-5 opacity-80"
                  alt=""
                />
                <span className="text-white text-sm">Dark Mode</span>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={darkMode}
                  onChange={() => setDarkMode(!darkMode)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-600 rounded-full peer peer-checked:bg-[#ff4400] peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all"></div>
              </label>
            </div>

            {state.isLoggedIn && (
              <div className="px-4 py-2 hover:bg-[#2a383d] flex items-center space-x-3">
                <img
                  src="/icons/logout.png"
                  className="w-5 h-5 opacity-80"
                  alt=""
                />
                <button
                  className="text-white hover:text-gray-300 text-sm"
                  onClick={handleLogout}
                >
                  Log Out
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
}
