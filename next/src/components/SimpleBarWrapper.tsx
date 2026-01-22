"use client";

import React, { createContext, useContext, useRef } from "react";
import SimpleBar from "simplebar-react";
import "simplebar-react/dist/simplebar.min.css";

interface SimpleBarContextValue {
  scrollContainerRef: React.RefObject<HTMLDivElement | null>;
}

const SimpleBarContext = createContext<SimpleBarContextValue | null>(null);

export const SimpleBarWrapper: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  return (
    <SimpleBarContext.Provider value={{ scrollContainerRef }}>
      <div style={{ height: "100vh", overflow: "hidden" }}>
        <SimpleBar scrollableNodeProps={{ ref: scrollContainerRef }} style={{ height: "100%" }}>
          {children}
        </SimpleBar>
      </div>
    </SimpleBarContext.Provider>
  );
};

export const useSimpleBar = (): SimpleBarContextValue => {
  const context = useContext(SimpleBarContext);
  if (!context) {
    throw new Error(
      "useSimpleBar must be used within a SimpleBarWrapper"
    );
  }
  return context;
};