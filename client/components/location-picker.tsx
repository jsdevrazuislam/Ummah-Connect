"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { MapPin, Search } from "lucide-react"

// Mock location data
const popularLocations = [
  { id: 1, name: "Masjid al-Haram", city: "Mecca, Saudi Arabia" },
  { id: 2, name: "Masjid an-Nabawi", city: "Medina, Saudi Arabia" },
  { id: 3, name: "Al-Aqsa Mosque", city: "Jerusalem" },
  { id: 4, name: "Islamic Center", city: "Kuala Lumpur, Malaysia" },
  { id: 5, name: "Central Mosque", city: "London, UK" },
  { id: 6, name: "Blue Mosque", city: "Istanbul, Turkey" },
]

interface LocationPickerProps {
  onLocationSelect: (location: { name: string; city: string }) => void
}

export function LocationPicker({ onLocationSelect }: LocationPickerProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const pickerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Close location picker when clicking outside
    const handleClickOutside = (event: MouseEvent) => {
      if (pickerRef.current && !pickerRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  const filteredLocations = popularLocations.filter(
    (location) =>
      location.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      location.city.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const handleLocationClick = (location: { name: string; city: string }) => {
    onLocationSelect(location)
    setIsOpen(false)
  }

  return (
    <div className="relative" ref={pickerRef}>
      <Button type="button" size="icon" variant="ghost" onClick={() => setIsOpen(!isOpen)}>
        <MapPin className="h-5 w-5" />
        <span className="sr-only">Add location</span>
      </Button>

      {isOpen && (
        <div className="absolute bottom-full mb-2 right-0 bg-background border border-border rounded-lg shadow-lg w-72 z-10">
          <div className="p-2 border-b border-border">
            <div className="relative">
              <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search locations..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
          <div className="p-2 max-h-48 overflow-y-auto">
            {filteredLocations.length > 0 ? (
              <div className="space-y-1">
                {filteredLocations.map((location) => (
                  <button
                    key={location.id}
                    className="w-full text-left p-2 hover:bg-muted rounded-md flex items-start"
                    onClick={() => handleLocationClick({ name: location.name, city: location.city })}
                  >
                    <MapPin className="h-4 w-4 mt-0.5 mr-2 flex-shrink-0" />
                    <div>
                      <div className="font-medium text-sm">{location.name}</div>
                      <div className="text-xs text-muted-foreground">{location.city}</div>
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              <div className="text-center py-2 text-sm text-muted-foreground">No locations found</div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
