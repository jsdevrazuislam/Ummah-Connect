"use client";
import { Loader2 } from "lucide-react";
import { useEffect } from "react";

type Props = {
  loading: boolean;
};

export function LoadingOverlay({ loading }: Props) {
  useEffect(() => {
    if (loading) {
      document.body.style.overflow = "hidden";
    }
    else {
      document.body.style.overflow = "";
    }
  }, [loading]);

  if (!loading)
    return null;

  return (
    <div className="fixed inset-0 z-[9999] bg-black/50 flex items-center justify-center">
      <div className="text-white flex items-center gap-2 text-lg font-medium">
        <Loader2 className="animate-spin h-6 w-6" />
        loading...
      </div>
    </div>
  );
}
