"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Clock } from "lucide-react"
import { useAuthStore } from "@/store/store"
import { to12HourFormat } from "@/lib/utils"

function getNextPrayer(prayerTime: Record<string, string>, currentTime: Date) {
  const prayerOrder = ["Fajr", "Dhuhr", "Asr", "Maghrib", "Isha"]

  for (let i = 0; i < prayerOrder.length; i++) {
    const prayer = prayerOrder[i]
    const timeStr = prayerTime[prayer] 
    if (!timeStr) continue

    const [hour, minute] = timeStr.split(":").map(Number)
    const prayerDate = new Date(currentTime)
    prayerDate.setHours(hour, minute, 0, 0)

    if (currentTime < prayerDate) {
      return prayer
    }
  }

  return "Fajr"
}

export function PrayerTimesWidget() {
  const [nextPrayer, setNextPrayer] = useState<string>("")
  const { prayerTime } = useAuthStore()

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date()
      if (prayerTime) {
        const next = getNextPrayer(prayerTime, now)
        setNextPrayer(next)
      }
    }, 1000 * 60) 

    if (prayerTime) {
      const next = getNextPrayer(prayerTime, new Date())
      setNextPrayer(next)
    }

    return () => clearInterval(timer)
  }, [prayerTime])

  if (!prayerTime) return null

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
            className={`flex justify-between text-sm ${
              nextPrayer === prayer ? "font-bold text-primary" : ""
            }`}
          >
            <span className="capitalize">{prayer}</span>
            <span>{to12HourFormat(time)}</span>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
