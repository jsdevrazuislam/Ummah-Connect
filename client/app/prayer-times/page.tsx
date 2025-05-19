import { SideNav } from "@/components/side-nav"
import { RightSidebar } from "@/components/right-sidebar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Clock, MapPin, Calendar } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"

// Mock prayer times for a week
const weeklyPrayerTimes = [
  {
    date: "Monday, May 13",
    prayers: {
      fajr: "5:12 AM",
      sunrise: "6:43 AM",
      dhuhr: "12:30 PM",
      asr: "3:45 PM",
      maghrib: "6:32 PM",
      isha: "8:00 PM",
    },
  },
  {
    date: "Tuesday, May 14",
    prayers: {
      fajr: "5:11 AM",
      sunrise: "6:42 AM",
      dhuhr: "12:30 PM",
      asr: "3:45 PM",
      maghrib: "6:33 PM",
      isha: "8:01 PM",
    },
  },
  {
    date: "Wednesday, May 15",
    prayers: {
      fajr: "5:10 AM",
      sunrise: "6:41 AM",
      dhuhr: "12:30 PM",
      asr: "3:46 PM",
      maghrib: "6:34 PM",
      isha: "8:02 PM",
    },
  },
  {
    date: "Thursday, May 16",
    prayers: {
      fajr: "5:09 AM",
      sunrise: "6:40 AM",
      dhuhr: "12:30 PM",
      asr: "3:46 PM",
      maghrib: "6:35 PM",
      isha: "8:03 PM",
    },
  },
  {
    date: "Friday, May 17",
    prayers: {
      fajr: "5:08 AM",
      sunrise: "6:39 AM",
      dhuhr: "12:30 PM",
      asr: "3:47 PM",
      maghrib: "6:36 PM",
      isha: "8:04 PM",
    },
  },
  {
    date: "Saturday, May 18",
    prayers: {
      fajr: "5:07 AM",
      sunrise: "6:38 AM",
      dhuhr: "12:30 PM",
      asr: "3:47 PM",
      maghrib: "6:37 PM",
      isha: "8:05 PM",
    },
  },
  {
    date: "Sunday, May 19",
    prayers: {
      fajr: "5:06 AM",
      sunrise: "6:37 AM",
      dhuhr: "12:30 PM",
      asr: "3:48 PM",
      maghrib: "6:38 PM",
      isha: "8:06 PM",
    },
  },
]

// Mock nearby mosques
const nearbyMosques = [
  {
    id: 1,
    name: "Islamic Center of Knowledge",
    address: "123 Main Street, City",
    distance: "0.8 miles",
    image: "/placeholder.svg?height=100&width=100",
  },
  {
    id: 2,
    name: "Masjid Al-Noor",
    address: "456 Oak Avenue, City",
    distance: "1.2 miles",
    image: "/placeholder.svg?height=100&width=100",
  },
  {
    id: 3,
    name: "Masjid Al-Rahma",
    address: "789 Pine Road, City",
    distance: "2.5 miles",
    image: "/placeholder.svg?height=100&width=100",
  },
]

export default function PrayerTimesPage() {
  return (
    <div className="flex min-h-screen bg-background">
      <SideNav />
      <main className="flex-1 border-x border-border">
        <div className="sticky top-0 z-10 bg-background pt-4 pb-2 px-4 border-b border-border">
          <div className="flex justify-between items-center">
            <h1 className="text-xl font-bold">Prayer Times</h1>
            <Button variant="outline" size="sm" className="gap-1">
              <MapPin className="h-4 w-4" />
              <span>Change Location</span>
            </Button>
          </div>
          <div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground">
            <MapPin className="h-4 w-4" />
            <span>Kuala Lumpur, Malaysia</span>
          </div>
          <Tabs defaultValue="daily" className="mt-4">
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
          {/* Today's prayer times */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Today's Prayer Times
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {Object.entries(weeklyPrayerTimes[0].prayers).map(([prayer, time]) => (
                  <div key={prayer} className="bg-muted rounded-lg p-4 text-center">
                    <div className="text-xs text-muted-foreground uppercase">{prayer}</div>
                    <div className="text-lg font-semibold mt-1">{time}</div>
                    <div className="mt-2">
                      <Switch id={`notify-${prayer}`} />
                      <Label htmlFor={`notify-${prayer}`} className="ml-2 text-xs">
                        Notify
                      </Label>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Weekly prayer times */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Weekly Schedule
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {weeklyPrayerTimes.map((day, index) => (
                  <div key={index} className="border-b border-border pb-3 last:border-0 last:pb-0">
                    <div className="font-medium mb-2">{day.date}</div>
                    <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 text-sm">
                      {Object.entries(day.prayers).map(([prayer, time]) => (
                        <div key={prayer} className="flex flex-col">
                          <span className="text-xs text-muted-foreground capitalize">{prayer}</span>
                          <span>{time}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Nearby mosques */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                Nearby Mosques
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {nearbyMosques.map((mosque) => (
                  <div key={mosque.id} className="flex gap-3 items-center">
                    <img
                      src={mosque.image || "/placeholder.svg"}
                      alt={mosque.name}
                      className="h-16 w-16 rounded-md object-cover"
                    />
                    <div className="flex-1">
                      <div className="font-medium">{mosque.name}</div>
                      <div className="text-sm text-muted-foreground">{mosque.address}</div>
                      <div className="text-xs text-muted-foreground mt-1">{mosque.distance}</div>
                    </div>
                    <Button variant="outline" size="sm">
                      Directions
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
      <RightSidebar />
    </div>
  )
}
