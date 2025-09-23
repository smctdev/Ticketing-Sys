"use client";

import {
  createContext,
  Dispatch,
  ReactNode,
  SetStateAction,
  useContext,
  useState,
} from "react";

type IsRefreshContextType = {
  isRefresh: boolean;
  setIsRefresh: Dispatch<SetStateAction<boolean>>;
};

export const IsRefreshContext = createContext<IsRefreshContextType | undefined>(
  undefined
);

export const IsRefreshProvider = ({ children }: { children: ReactNode }) => {
  const [isRefresh, setIsRefresh] = useState<boolean>(false);

  return (
    <IsRefreshContext.Provider value={{ isRefresh, setIsRefresh }}>
      {children}
    </IsRefreshContext.Provider>
  );
};

export const useIsRefresh = () => {
  const context = useContext(IsRefreshContext);

  if (context === undefined) {
    throw new Error("useIsRefresh must be used within a IsRefreshProvider");
  }

  return context;
};
