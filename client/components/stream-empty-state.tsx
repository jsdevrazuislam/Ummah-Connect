import { VideoOff } from "lucide-react";

export function NoLiveStreams() {
  return (
    <div className="flex mt-10 flex-col items-center justify-center py-12 px-4 text-center h-full rounded-lg">
      <div className="relative mb-6">
        <div className="absolute inset-0 bg-primary/10 rounded-full animate-ping opacity-75"></div>
        <div className="relative flex items-center justify-center h-20 w-20 bg-primary/20 rounded-full">
          <VideoOff className="h-10 w-10 text-primary" />
        </div>
      </div>

      <h3 className="text-xl font-semibold mb-2">No Live Streams Right Now</h3>
      <p className="text-muted-foreground max-w-md mb-6">
        There are currently no active live streams. Check back later or subscribe to get notified when we go live.
      </p>
    </div>
  );
}
