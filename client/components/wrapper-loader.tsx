"use client";
import React, { useEffect, useState } from "react";

import { useStore } from "@/store/store";

function WrapperLoader({ children }: { children: React.ReactNode }) {
  const { isLoading } = useStore();
  const [showLoader, setShowLoader] = useState(false);

  useEffect(() => {
    if (isLoading) {
      const timeout = setTimeout(() => setShowLoader(true), 300);
      return () => clearTimeout(timeout);
    }
    else {
      setShowLoader(false);
    }
  }, [isLoading]);

  if (showLoader) {
    return (
      <div className="absolute inset-0 z-10 flex items-center justify-center gap-y-2 flex-col bg-background pointer-events-none">
        <div className="w-10 h-10 bg-primary flex justify-center items-center rounded-full text-2xl">
          U
        </div>
        Ummah Connect
      </div>
    );
  }

  return children;
}

export default WrapperLoader;
