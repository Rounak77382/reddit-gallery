"use client";
import { createContext, useContext, useState } from "react";

const ScaleContext = createContext();

export function ScaleProvider({ children }) {
  const [scaleValue, setScaleValue] = useState(1.0);
  
  return (
    <ScaleContext.Provider value={{ scaleValue, setScaleValue }}>
      {children}
    </ScaleContext.Provider>
  );
}

export function useScale() {
  const context = useContext(ScaleContext);
  if (!context) {
    throw new Error("useScale must be used within a ScaleProvider");
  }
  return context;
}