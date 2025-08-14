"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useProfileForm } from "../context/profile-form-context"

interface SchoolCityStepProps {
  onNext: () => void
  onPrevious: () => void
  onGoToStep: (step: number) => void
}

export function SchoolCityStep({ onNext, onPrevious }: SchoolCityStepProps) {
  const { formData, updateFormData, isStepComplete } = useProfileForm()
  const [cities, setCities] = useState<string[]>([])

  // In a real app, these would be fetched based on the selected region
  useEffect(() => {
    if (formData.location.region) {
      // Simulate loading cities based on region
      setCities(["City 1", "City 2", "City 3", "City 4", "City 5", "City 6"])
    }
  }, [formData.location.region])

  const handleLocationChange = (value: string) => {
    updateFormData({
      location: {
        ...formData.location,
        city: value,
      },
    })
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-xl font-semibold">School City</h2>
        <p className="text-sm text-muted-foreground">Select the city where your school is located</p>
      </div>

      <div className="space-y-4">
        <Select
          value={formData.location.city}
          onValueChange={handleLocationChange}
          disabled={!formData.location.region}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select City" />
          </SelectTrigger>
          <SelectContent>
            {cities.map((city) => (
              <SelectItem key={city} value={city}>
                {city}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {!formData.location.region && <p className="text-sm text-muted-foreground">Please select a region first</p>}
      </div>

      <div className="flex space-x-4">
        <Button variant="outline" onClick={onPrevious} className="flex-1">
          Back
        </Button>
        <Button onClick={onNext} className="flex-1" disabled={!isStepComplete(7)}>
          Continue
        </Button>
      </div>
    </div>
  )
}

