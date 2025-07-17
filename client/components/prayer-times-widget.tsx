"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Clock } from "lucide-react"
import { useAuthStore } from "@/store/store"


export function PrayerTimesWidget() {
  const [currentTime, setCurrentTime] = useState(new Date())
  const [nextPrayer, setNextPrayer] = useState<string>("")
  const { prayerTime } = useAuthStore()
  

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 60000)

    const hour = currentTime.getHours()
    if (hour < 5) setNextPrayer("Fajr")
    else if (hour < 12) setNextPrayer("Dhuhr")
    else if (hour < 15) setNextPrayer("Asr")
    else if (hour < 18) setNextPrayer("Maghrib")
    else setNextPrayer("Isha")

    return () => clearInterval(timer)
  }, [currentTime])

  if(!prayerTime) return

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
