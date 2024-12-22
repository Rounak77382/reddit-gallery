// [app/_components/AppContext.js](app/_components/AppContext.js)
"use client";
import { createContext, useReducer, useContext } from "react";

const initialState = {
  scaleValue: 1.0,
  isLoggedIn: false,
  isNSFWAllowed: false,
  accessToken: null,
};

function appReducer(state, action) {
  switch (action.type) {
    case "SET_SCALE":
      return { ...state, scaleValue: action.payload };
    case "LOGIN":
      return { ...state, isLoggedIn: true, accessToken: action.payload };
    case "LOGOUT":
      return { ...state, isLoggedIn: false };
    case "ALLOW_NSFW":
      return { ...state, isNSFWAllowed: true };
    case "BLOCK_NSFW":
      return { ...state, isNSFWAllowed: false };
    default:
      return state;
  }
}

const AppContext = createContext();
AppContext.displayName = "AppContext";

export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(appReducer, initialState);
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
