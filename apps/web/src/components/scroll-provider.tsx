// app/context/ScrollContext.tsx
"use client";
import { createContext, useContext, useState } from "react";

type ScrollContextType = {
  hasScroll: boolean;
  setHasScroll: (value: boolean) => void;
  scrollHeight: number;
  setScrollHeight: (value: number) => void;
};

const ScrollContext = createContext<ScrollContextType | undefined>(undefined);

export const useScroll = () => {
  const context = useContext(ScrollContext);
  if (!context) {
    throw new Error("useScroll must be used within a ScrollProvider");
  }
  return context;
};

export const ScrollProvider = ({ children }: { children: React.ReactNode }) => {
  const [hasScroll, setHasScroll] = useState(false);
  const [scrollHeight, setScrollHeight] = useState(0);

  return (
    <ScrollContext.Provider value={{ hasScroll, setHasScroll, scrollHeight, setScrollHeight }}>
      {children}
    </ScrollContext.Provider>
  );
};
