export const getCurrentLocation = (): Promise<GeolocationCoordinates> => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) return reject("Geolocation not supported")
    navigator.geolocation.getCurrentPosition(
      (position) => resolve(position.coords),
      (err) => reject(err)
    )
  })
}

export const getPrayerTimes = async (lat: number, lon: number): Promise<PrayerTimes> => {
  const res = await fetch(
    `https://api.aladhan.com/v1/timings?latitude=${lat}&longitude=${lon}&method=1`
  )
  const data = await res.json()
  return data?.data
}
