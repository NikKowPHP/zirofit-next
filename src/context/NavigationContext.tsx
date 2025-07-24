"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";

type NavigationContextType = {
  isNavigating: boolean;
  setIsNavigating: React.Dispatch<React.SetStateAction<boolean>>;
  optimisticPath: string | null;
  setOptimisticPath: React.Dispatch<React.SetStateAction<string | null>>;
};

const NavigationContext = createContext<NavigationContextType | undefined>(
  undefined,
);

export const NavigationProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [isNavigating, setIsNavigating] = useState(false);
  const [optimisticPath, setOptimisticPath] = useState<string | null>(null);
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    // When the path or search params change, the navigation is complete.
    setIsNavigating(false);
    setOptimisticPath(null);
  }, [pathname, searchParams]);

  return (
    <NavigationContext.Provider
      value={{
        isNavigating,
        setIsNavigating,
        optimisticPath,
        setOptimisticPath,
      }}
    >
      {children}
    </NavigationContext.Provider>
  );
};

export const useNavigation = () => {
  const context = useContext(NavigationContext);
  if (context === undefined) {
    throw new Error("useNavigation must be used within a NavigationProvider");
  }
  return context;
};