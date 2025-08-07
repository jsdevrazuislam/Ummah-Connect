import { ArrowDown, ArrowUp } from "lucide-react";
import React from "react";

function ShortLoading() {
  return (
    <div>
      <div className="relative">
        <div className="relative flex justify-center items-center w-[350px] mx-auto h-[90vh] bg-black">
          <div className="absolute -right-20 bottom-32 flex flex-col gap-3 z-10">
            <div className="w-6 h-6 rounded-full bg-gray-500 opacity-50" />
            <div className="w-6 h-6 rounded-full bg-gray-500 opacity-50" />
            <div className="w-6 h-6 rounded-full bg-gray-500 opacity-50" />
          </div>

          <div className="h-[90%] w-full bg-gray-300 rounded-xl animate-pulse relative flex flex-col justify-end p-4 gap-2">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-gray-400" />
              <div className="h-3 w-40 bg-gray-400 rounded" />
            </div>
            <div className="h-3 w-48 bg-gray-400 rounded" />
            <div className="h-3 w-24 bg-gray-400 rounded" />
          </div>
        </div>

        <div className="absolute top-[30%] right-[5%] flex flex-col gap-4">
          <button
            aria-label="Previous short"
          >
            <div className="bg-white/10 rounded-full p-2">
              <ArrowUp />
            </div>
          </button>
          <button
            aria-label="Next short"
          >
            <div className="bg-white/10 rounded-full p-2">
              <ArrowDown />
            </div>
          </button>
        </div>

      </div>
    </div>
  );
}

export default ShortLoading;
