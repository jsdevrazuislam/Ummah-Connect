import { getCurrentLocation } from "@/lib/prayer"

export const fetchReverseGeocode = async (lat: number, lng: number): Promise<{city: string, country: string}> => {
  const response = await fetch(
    `https://api.mapbox.com/geocoding/v5/mapbox.places/${lng},${lat}.json?access_token=${process.env.NEXT_PUBLIC_MAPBOX_TOKEN}&types=place`
  )
  const data: LocationResponse = await response.json()
  return {
    city: data.features[0]?.text || '',
    country: data.features[0]?.context.find((c) => c.id.includes('country'))?.text || ''
  }
}

export const fetchPrayerTimes = async (date: string) => {
    const coords = await getCurrentLocation()

    const response = await fetch(
        `https://api.aladhan.com/v1/timings/${date}?latitude=${coords.latitude}&longitude=${coords.longitude}&method=2`
    )
    if (!response.ok) {
        throw new Error("Failed to fetch prayer times")
    }
    const data: PrayerTimesStatsResponse = await response.json()
    return {
        date: data.data.date.readable,
        prayers: {
            Fajr: data.data.timings.Fajr,
            Sunrise: data.data.timings.Sunrise,
            Dhuhr: data.data.timings.Dhuhr,
            Asr: data.data.timings.Asr,
            Maghrib: data.data.timings.Maghrib,
            Isha: data.data.timings.Isha,
        },
    }
}

export const fetchWeeklyPrayerTimes = async () => {
    const dates = []
    const today = new Date()

    for (let i = 0; i < 7; i++) {
        const date = new Date(today)
        date.setDate(today.getDate() + i)
        dates.push(date.toISOString().split('T')[0])
    }

    const promises = dates.map(date => fetchPrayerTimes(date))
    return Promise.all(promises)
}

export const fetchMonthlyPrayerTimes = async () => {
    const today = new Date()
    const month = today.getMonth() + 1
    const year = today.getFullYear()
    const coords = await getCurrentLocation()

    const response = await fetch(
        `https://api.aladhan.com/v1/calendar?latitude=${coords.latitude}&longitude=${coords.longitude}&method=2&month=${month}&year=${year}`
    )
    if (!response.ok) {
        throw new Error("Failed to fetch monthly prayer times")
    }
    const data: PrayerTimesMonthlyStatsResponse = await response.json()
    return data.data.map((day) => ({
        date: day.date.readable,
        prayers: {
            Fajr: day.timings.Fajr,
            Sunrise: day.timings.Sunrise,
            Dhuhr: day.timings.Dhuhr,
            Asr: day.timings.Asr,
            Maghrib: day.timings.Maghrib,
            Isha: day.timings.Isha,
        }
    }))
}