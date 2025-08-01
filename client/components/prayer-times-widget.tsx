"use client";

import { Clock, LocateFixed } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { to12HourFormat } from "@/lib/utils";
import { useStore } from "@/store/store";

function getNextPrayer(prayerTime: Record<string, string>, currentTime: Date) {
  const prayerOrder = ["Fajr", "Dhuhr", "Asr", "Maghrib", "Isha"];

  for (let i = 0; i < prayerOrder.length; i++) {
    const prayer = prayerOrder[i];
    const timeStr = prayerTime[prayer];
    if (!timeStr)
      continue;

    const [hour, minute] = timeStr.split(":").map(Number);
    const prayerDate = new Date(currentTime);
    prayerDate.setHours(hour, minute, 0, 0);

    if (currentTime < prayerDate) {
      return prayer;
    }
  }

  return "Fajr";
}

export function PrayerTimesWidget() {
  const [nextPrayer, setNextPrayer] = useState<string>("");
  const [locationError, setLocationError] = useState<string | null>(null);
  const { prayerTime, fetchPrayerTimes } = useStore();

  const requestLocation = async () => {
    try {
      if (!navigator.geolocation) {
        throw new Error("Geolocation is not supported by your browser");
      }

      toast.promise(
        new Promise((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(
            async (position) => {
              try {
                await fetchPrayerTimes(position.coords.latitude, position.coords.longitude);
                setLocationError(null);
                resolve(true);
              }
              catch (error) {
                reject(error);
              }
            },
            (error) => {
              let message = "Error getting location";
              if (error.code === error.PERMISSION_DENIED) {
                message = "Location permission denied. Please enable it in your browser settings.";
              }
              reject(new Error(message));
            },
          );
        }),
        {
          loading: "Fetching prayer times...",
          success: "Prayer times loaded successfully!",
          error: error => error.message,
        },
      );
    }
    catch (error) {
      setLocationError(error instanceof Error ? error.message : "Failed to get location");
    }
  };

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      if (prayerTime) {
        const next = getNextPrayer(prayerTime, now);
        setNextPrayer(next);
      }
    }, 1000 * 60);

    if (prayerTime) {
      const next = getNextPrayer(prayerTime, new Date());
      setNextPrayer(next);
    }

    return () => clearInterval(timer);
  }, [prayerTime]);

  if (!prayerTime) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Prayer Times
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-center py-4">
          <p className="text-sm text-muted-foreground">
            {locationError || "We need your location to show prayer times"}
          </p>
          <Button
            onClick={requestLocation}
            size="sm"
            className="gap-2"
          >
            <LocateFixed className="h-4 w-4" />
            Enable Location
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base flex items-center gap-2">
          <Clock className="h-4 w-4" />
          Prayer Times
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {Object.entries(prayerTime).map(([prayer, time]) => (
          <div
            key={prayer}
            className={`flex justify-between text-sm ${nextPrayer === prayer ? "font-bold text-primary" : ""
            }`}
          >
            <span className="capitalize">{prayer}</span>
            <span>{to12HourFormat(time)}</span>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
