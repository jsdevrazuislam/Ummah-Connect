"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Bell, Clock, MapPin } from "lucide-react"
import { cn } from "@/lib/utils"

// Prayer times calculation would normally use a proper algorithm
// This is a simplified mock version
const calculateMockPrayerTimes = (date: Date, latitude: number, longitude: number) => {
  // Mock prayer times - in a real app, these would be calculated based on location and date
  return {
    fajr: new Date(date.setHours(5, 12)),
    sunrise: new Date(date.setHours(6, 43)),
    dhuhr: new Date(date.setHours(12, 30)),
    asr: new Date(date.setHours(15, 45)),
    maghrib: new Date(date.setHours(18, 32)),
    isha: new Date(date.setHours(20, 0)),
  }
}

export function AIPrayerReminder() {
  const [currentTime, setCurrentTime] = useState(new Date())
  const [nextPrayer, setNextPrayer] = useState<{ name: string; time: Date } | null>(null)
  const [timeUntilNextPrayer, setTimeUntilNextPrayer] = useState<string>("")
  const [location, setLocation] = useState({ latitude: 3.139, longitude: 101.6869, name: "Kuala Lumpur" }) // Default to Kuala Lumpur

  useEffect(() => {
    // Update current time every minute
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 60000)

    return () => clearInterval(timer)
  }, [])

  useEffect(() => {
    // Calculate prayer times based on location
    const prayerTimes = calculateMockPrayerTimes(new Date(), location.latitude, location.longitude)

    // Determine next prayer
    const prayers = [
      { name: "Fajr", time: prayerTimes.fajr },
      { name: "Sunrise", time: prayerTimes.sunrise },
      { name: "Dhuhr", time: prayerTimes.dhuhr },
      { name: "Asr", time: prayerTimes.asr },
      { name: "Maghrib", time: prayerTimes.maghrib },
      { name: "Isha", time: prayerTimes.isha },
    ]

    const now = new Date()
    let nextPrayerInfo = null

    for (const prayer of prayers) {
      if (prayer.time > now) {
        nextPrayerInfo = prayer
        break
      }
    }

    // If no next prayer found today, set to Fajr of tomorrow
    if (!nextPrayerInfo) {
      const tomorrow = new Date()
      tomorrow.setDate(tomorrow.getDate() + 1)
      const tomorrowPrayerTimes = calculateMockPrayerTimes(tomorrow, location.latitude, location.longitude)
      nextPrayerInfo = { name: "Fajr", time: tomorrowPrayerTimes.fajr }
    }

    setNextPrayer(nextPrayerInfo)

    // Update time until next prayer
    const updateTimeUntil = () => {
      if (!nextPrayerInfo) return

      const now = new Date()
      const diff = nextPrayerInfo.time.getTime() - now.getTime()

      const hours = Math.floor(diff / (1000 * 60 * 60))
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))

      setTimeUntilNextPrayer(`${hours}h ${minutes}m`)
    }

    updateTimeUntil()
    const timeUntilTimer = setInterval(updateTimeUntil, 60000)

    return () => clearInterval(timeUntilTimer)
  }, [currentTime, location])

  const formatPrayerTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })
  }

  const getProgressPercentage = () => {
    if (!nextPrayer) return 0

    const now = new Date()
    const currentPrayerIndex = ["Fajr", "Sunrise", "Dhuhr", "Asr", "Maghrib", "Isha"].indexOf(nextPrayer.name)
    const previousPrayerIndex = currentPrayerIndex > 0 ? currentPrayerIndex - 1 : 5

    const prayerTimes = calculateMockPrayerTimes(new Date(), location.latitude, location.longitude)
    const prayerTimesArray = [
      prayerTimes.fajr,
      prayerTimes.sunrise,
      prayerTimes.dhuhr,
      prayerTimes.asr,
      prayerTimes.maghrib,
      prayerTimes.isha,
    ]

    let previousPrayerTime = prayerTimesArray[previousPrayerIndex]
    if (previousPrayerTime > now) {
      // Previous prayer was yesterday
      const yesterday = new Date()
      yesterday.setDate(yesterday.getDate() - 1)
      const yesterdayPrayerTimes = calculateMockPrayerTimes(yesterday, location.latitude, location.longitude)
      previousPrayerTime = [
        yesterdayPrayerTimes.fajr,
        yesterdayPrayerTimes.sunrise,
        yesterdayPrayerTimes.dhuhr,
        yesterdayPrayerTimes.asr,
        yesterdayPrayerTimes.maghrib,
        yesterdayPrayerTimes.isha,
      ][previousPrayerIndex]
    }

    const totalInterval = nextPrayer.time.getTime() - previousPrayerTime.getTime()
    const elapsedInterval = now.getTime() - previousPrayerTime.getTime()

    return Math.min(100, Math.max(0, (elapsedInterval / totalInterval) * 100))
  }

  return (
    <Card
      className={cn(
        "overflow-hidden transition-all duration-300",
        nextPrayer?.name === "Fajr"
          ? "bg-gradient-to-br from-indigo-50 to-blue-50 dark:from-indigo-950/20 dark:to-blue-950/20"
          : nextPrayer?.name === "Dhuhr"
            ? "bg-gradient-to-br from-amber-50 to-yellow-50 dark:from-amber-950/20 dark:to-yellow-950/20"
            : nextPrayer?.name === "Asr"
              ? "bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-950/20 dark:to-amber-950/20"
              : nextPrayer?.name === "Maghrib"
                ? "bg-gradient-to-br from-rose-50 to-orange-50 dark:from-rose-950/20 dark:to-orange-950/20"
                : nextPrayer?.name === "Isha"
                  ? "bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20"
                  : "bg-gradient-to-br from-gray-50 to-slate-50 dark:from-gray-950/20 dark:to-slate-950/20",
      )}
    >
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <CardTitle className="text-base flex items-center gap-2">
            <Clock className="h-4 w-4" />
            AI Prayer Assistant
          </CardTitle>
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <Bell className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-1 text-xs text-muted-foreground mb-3">
          <MapPin className="h-3 w-3" />
          <span>{location.name}</span>
        </div>

        {nextPrayer && (
          <div className="space-y-3">
            <div>
              <div className="flex justify-between items-center">
                <h3 className="font-medium">Next Prayer: {nextPrayer.name}</h3>
                <span className="text-sm font-semibold">{formatPrayerTime(nextPrayer.time)}</span>
              </div>
              <div className="mt-1 text-sm text-muted-foreground">{timeUntilNextPrayer} remaining</div>
            </div>

            {/* Progress bar */}
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-primary rounded-full transition-all duration-1000 ease-in-out"
                style={{ width: `${getProgressPercentage()}%` }}
              ></div>
            </div>

            {/* Smart recommendation */}
            <div className="mt-3 text-sm">
              {nextPrayer.name === "Fajr" && (
                <div>
                  <Badge variant="outline" className="mr-2 bg-primary/10">
                    AI Tip
                  </Badge>
                  Try to sleep early tonight to wake up refreshed for Fajr prayer.
                </div>
              )}
              {nextPrayer.name === "Dhuhr" && (
                <div>
                  <Badge variant="outline" className="mr-2 bg-primary/10">
                    AI Tip
                  </Badge>
                  Take a short break from work to pray Dhuhr on time.
                </div>
              )}
              {nextPrayer.name === "Asr" && (
                <div>
                  <Badge variant="outline" className="mr-2 bg-primary/10">
                    AI Tip
                  </Badge>
                  Remember to pray Asr before sunset. It's an important prayer to maintain.
                </div>
              )}
              {nextPrayer.name === "Maghrib" && (
                <div>
                  <Badge variant="outline" className="mr-2 bg-primary/10">
                    AI Tip
                  </Badge>
                  Maghrib time is short - prepare to break your fast if you're fasting today.
                </div>
              )}
              {nextPrayer.name === "Isha" && (
                <div>
                  <Badge variant="outline" className="mr-2 bg-primary/10">
                    AI Tip
                  </Badge>
                  Consider reading some Quran after Isha prayer before sleeping.
                </div>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
