// [app/_components/AppContext.js](app/_components/AppContext.js)
"use client";
import {
  createContext,
  useReducer,
  useContext,
  useState,
  useEffect,
} from "react";
import Cookies from "js-cookie";
import CryptoJS from "crypto-js";

// Encryption key - stored in environment variables or use a consistent fallback
const ENCRYPTION_KEY =
  process.env.NEXT_PUBLIC_ENCRYPTION_KEY || "A7F3D8E9B2C4G6H1J5K9L0M3N4P7Q2R8";

// Improved encryption function with error handling
const encryptData = (data) => {
  try {
    // Convert data to string if it's an object
    const dataString =
      typeof data === "object" ? JSON.stringify(data) : String(data);

    // Use AES encryption with the key
    return CryptoJS.AES.encrypt(dataString, ENCRYPTION_KEY).toString();
  } catch (error) {
    console.error("Encryption error:", error);
    return null;
  }
};

// Improved decryption function with robust error handling
const decryptData = (encryptedData) => {
  try {
    // Verify that encryptedData is a string and not empty
    if (!encryptedData || typeof encryptedData !== "string") {
      throw new Error("Invalid encrypted data format");
    }

    // Decrypt the data
    const bytes = CryptoJS.AES.decrypt(encryptedData, ENCRYPTION_KEY);

    // Convert to string and handle potential errors
    const decryptedString = bytes.toString(CryptoJS.enc.Utf8);

    if (!decryptedString) {
      throw new Error("Decryption resulted in empty string");
    }

    // Parse the JSON data
    return JSON.parse(decryptedString);
  } catch (error) {
    console.error("Decryption error:", error);

    // Clear the corrupted cookie to prevent future errors
    if (typeof window !== "undefined") {
      Cookies.remove("redditGalleryState");
      console.log("Removed corrupted cookie");
    }
    return null;
  }
};

// Always return default state for initial render to avoid hydration mismatch.
// Persisted data (cookies/localStorage) is loaded via useEffect after mount.
const defaultState = {
  scaleValue: 1.0,
  isLoggedIn: false,
  isNSFWAllowed: false,
  accessToken: null,
  username: null,
  profilePicture: null,
  isAdult: false,
  searchHistory: [],
};

const getInitialState = () => defaultState;

// Add history actions to the reducer
function appReducer(state, action) {
  switch (action.type) {
    case "SET_SCALE":
      return { ...state, scaleValue: action.payload };
    case "RESET_SCALE":
      return {
        ...state,
        scaleValue: "1.000",
      };
    case "LOGIN":
      console.log("LOGIN action with payload:", action.payload);
      return {
        ...state,
        isLoggedIn: true,
        accessToken: action.payload.accessToken,
        username: action.payload.username,
        profilePicture: action.payload.profilePicture,
        isAdult: action.payload.isAdult,
      };
    case "LOGOUT":
      return {
        ...state,
        isLoggedIn: false,
        accessToken: null,
        username: null,
        profilePicture: null,
        isAdult: false,
      };
    case "ALLOW_NSFW":
      return { ...state, isNSFWAllowed: true };
    case "BLOCK_NSFW":
      return { ...state, isNSFWAllowed: false };
    case "ADD_TO_HISTORY": {
      // Create a unique ID for this search configuration
      // Only include postTime in the ID if the postType is 'top'
      const searchId =
        action.payload.postType === "top"
          ? `${action.payload.name}_${action.payload.postType}_${action.payload.postTime}`
          : `${action.payload.name}_${action.payload.postType}`;

      // Add ID to the payload
      const historyEntry = {
        ...action.payload,
        id: searchId,
        timestamp: Date.now(),
      };

      // Check if this exact configuration is already in history
      const existingIndex = state.searchHistory.findIndex(
        (item) => item.id === searchId
      );

      let newHistory;
      if (existingIndex >= 0) {
        // Update existing entry with new timestamp
        newHistory = [...state.searchHistory];
        newHistory[existingIndex] = {
          ...newHistory[existingIndex],
          timestamp: Date.now(),
        };
      } else {
        // Add to beginning of history
        newHistory = [historyEntry, ...state.searchHistory];
      }

      // Limit to 20 items
      newHistory = newHistory.slice(0, 14);

      // Also update localStorage for backwards compatibility
      if (typeof window !== "undefined") {
        localStorage.setItem(
          "redditGalleryHistory",
          JSON.stringify(newHistory)
        );
      }

      return { ...state, searchHistory: newHistory };
    }
    case "LOAD_HISTORY": {
      return { ...state, searchHistory: action.payload };
    }
    default:
      return state;
  }
}

const AppContext = createContext();
AppContext.displayName = "AppContext";

export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(appReducer, getInitialState());
  const [isHydrated, setIsHydrated] = useState(false);

  // Restore persisted state from cookies/localStorage after mount (avoids hydration mismatch)
  useEffect(() => {
    try {
      const encryptedState = Cookies.get("redditGalleryState");
      if (encryptedState) {
        console.log("Found encrypted state in cookies");
        const parsedState = decryptData(encryptedState);
        if (parsedState) {
          if (parsedState.isLoggedIn) {
            dispatch({
              type: "LOGIN",
              payload: {
                accessToken: parsedState.accessToken,
                username: parsedState.username,
                profilePicture: parsedState.profilePicture,
                isAdult: parsedState.isAdult,
              },
            });
          }
          if (parsedState.isNSFWAllowed) {
            dispatch({ type: "ALLOW_NSFW" });
          }
          if (parsedState.searchHistory && parsedState.searchHistory.length > 0) {
            dispatch({ type: "LOAD_HISTORY", payload: parsedState.searchHistory });
          }
        }
      }

      // Also try loading history from localStorage as fallback
      const savedHistory = localStorage.getItem("redditGalleryHistory");
      if (savedHistory) {
        try {
          const parsedHistory = JSON.parse(savedHistory);
          if (parsedHistory.length > 0) {
            dispatch({ type: "LOAD_HISTORY", payload: parsedHistory });
          }
        } catch (e) {
          console.error("Error parsing search history:", e);
        }
      }
    } catch (error) {
      console.error("Error restoring state:", error);
    }
    setIsHydrated(true);
  }, []);

  // Save state to cookies whenever it changes (skip until hydrated to avoid overwriting with defaults)
  useEffect(() => {
    if (!isHydrated) return;

    // Create a serializable version of the state
    const serializableState = {
      ...state,
      accessToken: state.accessToken
        ? {
            accessToken: state.accessToken.accessToken,
            refreshToken: state.accessToken.refreshToken,
            tokenExpiration: state.accessToken.tokenExpiration || null,
            scope: state.accessToken.scope || null,
          }
        : null,
    };

    try {
      const encryptedState = encryptData(serializableState);
      if (encryptedState) {
        Cookies.set("redditGalleryState", encryptedState, {
          expires: 7,
          path: "/",
          sameSite: "Lax",
          secure: process.env.NODE_ENV === "production",
        });
      }
    } catch (error) {
      console.error("Error saving encrypted cookie:", error);
    }
  }, [state, isHydrated]);

  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useAppContext must be used within an AppProvider");
  }
  return context;
}
