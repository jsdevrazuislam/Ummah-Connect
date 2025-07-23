"use client"

import { useState, useEffect } from "react"
import { Bell, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useAuthStore } from "@/store/store"
import { to12HourFormat } from "@/lib/utils"

interface PrayerTime {
    name: string
    time: string
}

interface PrayerNotificationProps {
    prayerName: string
    prayerTime: string
    onDismiss: () => void
    onSnooze: (timestamp: number) => void
}

function PrayerNotificationModal({
    prayerName,
    prayerTime,
    onDismiss,
    onSnooze
}: PrayerNotificationProps) {
    return (
        <Dialog open={true} onOpenChange={onDismiss}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="text-center">
                        Prayer Time Reminder
                    </DialogTitle>
                </DialogHeader>
                <div className="text-center space-y-4">
                    <div className="text-2xl font-bold text-primary">
                        {prayerName} Time
                    </div>
                    <div className="text-xl">{to12HourFormat(prayerTime)}</div>
                    <div className="text-sm text-muted-foreground">
                        It's time for {prayerName.toLowerCase()} prayer
                    </div>

                    <div className="flex gap-2 pt-4">
                        <Button
                            variant="outline"
                            onClick={() => onSnooze(Date.now())}
                            className="flex-1 gap-2"
                        >
                            <Bell className="h-4 w-4" />
                            Snooze (5 mins)
                        </Button>
                        <Button
                            onClick={onDismiss}
                            className="flex-1 gap-2"
                        >
                            <X className="h-4 w-4" />
                            Dismiss
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}

export function PrayerTimeNotifications() {
    const { user, prayerTime } = useAuthStore()
    const [currentPrayer, setCurrentPrayer] = useState<PrayerTime | null>(null)
    const [showNotification, setShowNotification] = useState(false)
    const [snoozedUntil, setSnoozedUntil] = useState<number | null>(null)

    useEffect(() => {
        if (!user?.notification_preferences?.prayer_time_notification) return

        const checkPrayerTimes = () => {
            const now = new Date()
            const currentTime = now.getHours() * 60 + now.getMinutes()

            const prayerTimes: PrayerTime[] = [
                { name: "Fajr", time: prayerTime?.Fajr ?? '' },
                { name: "Dhuhr", time: prayerTime?.Dhuhr ?? '' },
                { name: "Asr", time: prayerTime?.Asr ?? ''},
                { name: "Maghrib", time: prayerTime?.Maghrib ?? ''},
                { name: "Isha", time: prayerTime?.Isha ?? '' }
            ]

            for (const prayer of prayerTimes) {
                const timeParts = prayer.time.split(':')
                if (timeParts.length !== 2) continue

                const hours = parseInt(timeParts[0], 10)
                const minutes = parseInt(timeParts[1], 10)

                if (isNaN(hours)) continue
                if (isNaN(minutes)) continue

                const prayerMinutes = hours * 60 + minutes

                if (Math.abs(currentTime - prayerMinutes) <= 1) {
                    if (!snoozedUntil || (snoozedUntil && Date.now() > snoozedUntil)) {
                        setCurrentPrayer(prayer)
                        setShowNotification(true)
                        break
                    }
                }
            }
        }

        const interval = setInterval(checkPrayerTimes, 60000)
        checkPrayerTimes()

        return () => clearInterval(interval)
    }, [user, snoozedUntil])

    const handleDismiss = () => {
        setShowNotification(false)
        setCurrentPrayer(null)
    }

    const handleSnooze = (timestamp: number) => {
        setShowNotification(false)
        setSnoozedUntil(timestamp + 5 * 60 * 1000) 
    }

    if (!showNotification || !currentPrayer) return null

    return (
        <PrayerNotificationModal
            prayerName={currentPrayer.name}
            prayerTime={currentPrayer.time}
            onDismiss={handleDismiss}
            onSnooze={handleSnooze}
        />
    )
}