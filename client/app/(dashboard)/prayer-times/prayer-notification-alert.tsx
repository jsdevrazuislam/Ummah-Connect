"use client"

import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { Clock, Calendar, MapPin } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Skeleton } from "@/components/ui/skeleton"
import { to12HourFormat } from "@/lib/utils"
import { fetchPrayerTimes, fetchWeeklyPrayerTimes, fetchMonthlyPrayerTimes } from "@/lib/apis/prayer"
import { useAuthStore } from "@/store/store"


export default function PrayerTimesPage() {
    const [activeTab, setActiveTab] = useState<"daily" | "weekly" | "monthly">("daily")
    const { user, location} = useAuthStore()

    const { data: dailyData, isLoading: isDailyLoading } = useQuery({
        queryKey: ['dailyPrayerTimes'],
        queryFn: () => fetchPrayerTimes(new Date().toISOString().split('T')[0]),
    })

    const { data: weeklyData, isLoading: isWeeklyLoading } = useQuery({
        queryKey: ['weeklyPrayerTimes'],
        queryFn: fetchWeeklyPrayerTimes,
        enabled: activeTab === 'weekly',
    })

    const { data: monthlyData, isLoading: isMonthlyLoading } = useQuery({
        queryKey: ['monthlyPrayerTimes'],
        queryFn: fetchMonthlyPrayerTimes,
        enabled: activeTab === 'monthly',
    })


    const isLoading = 
        (activeTab === 'daily' && isDailyLoading) ||
        (activeTab === 'weekly' && isWeeklyLoading) ||
        (activeTab === 'monthly' && isMonthlyLoading)

        console.log("iser", user?.notification_preferences?.prayer_time_notification)

    return (
        <>
            <div className="sticky top-0 z-10 bg-background pt-4 pb-2 px-4 border-b border-border">
                <h1 className="text-xl font-bold">Prayer Times</h1>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    {location ? (
                        <div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground">
                            <MapPin className="h-4 w-4" />
                            <span>{location.city}, {location.country}</span>
                        </div>
                    ) : (
                        <Skeleton className="h-4 w-48 mt-2" />
                    )}
                </div>
                <Tabs
                    defaultValue="daily"
                    className="mt-4"
                    onValueChange={(value) => setActiveTab(value as "daily" | "weekly" | "monthly")}
                >
                    <TabsList className="w-full">
                        <TabsTrigger value="daily" className="flex-1">
                            Daily
                        </TabsTrigger>
                        <TabsTrigger value="weekly" className="flex-1">
                            Weekly
                        </TabsTrigger>
                        <TabsTrigger value="monthly" className="flex-1">
                            Monthly
                        </TabsTrigger>
                    </TabsList>
                </Tabs>
            </div>

            <div className="p-4 space-y-6">
                {activeTab === 'daily' && (
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-base flex items-center gap-2">
                                <Clock className="h-4 w-4" />
                                Today's Prayer Times
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {isLoading ? (
                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                                    {Array.from({ length: 6 }).map((_, i) => (
                                        <Skeleton key={i} className="h-24 rounded-lg" />
                                    ))}
                                </div>
                            ) : (
                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                                    {dailyData && Object.entries(dailyData.prayers).map(([prayer, time]) => (
                                        <div key={prayer} className="bg-muted rounded-lg p-4 text-center">
                                            <div className="text-xs text-muted-foreground uppercase">{prayer}</div>
                                            <div className="text-lg font-semibold mt-1">{to12HourFormat(time)}</div>
                                            <div className="mt-2">
                                                <Switch id={`notify-${prayer}`} checked={user?.notification_preferences?.prayer_time_notification} />
                                                <Label htmlFor={`notify-${prayer}`} className="ml-2 text-xs">
                                                    Notify
                                                </Label>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                )}

                {activeTab === 'weekly' && (
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-base flex items-center gap-2">
                                <Calendar className="h-4 w-4" />
                                Weekly Schedule
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {isLoading ? (
                                <div className="space-y-4">
                                    {Array.from({ length: 7 }).map((_, i) => (
                                        <div key={i} className="space-y-2">
                                            <Skeleton className="h-6 w-32" />
                                            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                                                {Array.from({ length: 6 }).map((_, j) => (
                                                    <Skeleton key={j} className="h-12" />
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {weeklyData?.map((day, index) => (
                                        <div key={index} className="border-b border-border pb-3 last:border-0 last:pb-0">
                                            <div className="font-medium mb-2">{day.date}</div>
                                            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 text-sm">
                                                {Object.entries(day.prayers).map(([prayer, time]) => (
                                                    <div key={prayer} className="flex flex-col">
                                                        <span className="text-xs text-muted-foreground capitalize">{prayer}</span>
                                                        <span>{to12HourFormat(time)}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                )}

                {activeTab === 'monthly' && (
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-base flex items-center gap-2">
                                <Calendar className="h-4 w-4" />
                                Monthly Schedule
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {isLoading ? (
                                <div className="space-y-4">
                                    {Array.from({ length: 30 }).map((_, i) => (
                                        <div key={i} className="space-y-2">
                                            <Skeleton className="h-6 w-32" />
                                            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                                                {Array.from({ length: 6 }).map((_, j) => (
                                                    <Skeleton key={j} className="h-12" />
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {monthlyData?.map((day) => (
                                        <div key={day.date} className="border-b border-border pb-3 last:border-0 last:pb-0">
                                            <div className="font-medium mb-2">{day.date}</div>
                                            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 text-sm">
                                                {Object.entries(day.prayers).map(([prayer, time]) => (
                                                    <div key={prayer} className="flex flex-col">
                                                        <span className="text-xs text-muted-foreground capitalize">{prayer}</span>
                                                        <span>{to12HourFormat(time)}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                )}
            </div>
        </>
    )
}