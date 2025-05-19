"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Clock } from "lucide-react"

// Mock data for prayer times
const mockPrayerTimes = {
  fajr: "5:12 AM",
  sunrise: "6:43 AM",
  dhuhr: "12:30 PM",
  asr: "3:45 PM",
  maghrib: "6:32 PM",
  isha: "8:00 PM",
}

export function PrayerTimesWidget() {
  const [currentTime, setCurrentTime] = useState(new Date())
  const [nextPrayer, setNextPrayer] = useState<string>("")

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 60000)

    // Determine next prayer (simplified logic for demo)
    const hour = currentTime.getHours()
    if (hour < 5) setNextPrayer("fajr")
    else if (hour < 12) setNextPrayer("dhuhr")
    else if (hour < 15) setNextPrayer("asr")
    else if (hour < 18) setNextPrayer("maghrib")
    else setNextPrayer("isha")

    return () => clearInterval(timer)
  }, [currentTime])

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base flex items-center gap-2">
          <Clock className="h-4 w-4" />
          Prayer Times
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {Object.entries(mockPrayerTimes).map(([prayer, time]) => (
          <div
            key={prayer}
            className={`flex justify-between text-sm ${nextPrayer === prayer ? "font-bold text-primary" : ""}`}
          >
            <span className="capitalize">{prayer}</span>
            <span>{time}</span>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
