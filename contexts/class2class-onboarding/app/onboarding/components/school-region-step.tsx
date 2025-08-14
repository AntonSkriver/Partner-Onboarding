"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useProfileForm } from "../context/profile-form-context"

interface SchoolRegionStepProps {
  onNext: () => void
  onPrevious: () => void
  onGoToStep: (step: number) => void
}

export function SchoolRegionStep({ onNext, onPrevious }: SchoolRegionStepProps) {
  const { formData, updateFormData, isStepComplete } = useProfileForm()
  const [regions, setRegions] = useState<string[]>([])

  // In a real app, these would be fetched based on the selected country
  useEffect(() => {
    if (formData.location.country) {
      // Simulate loading regions based on country
      setRegions(["Region 1", "Region 2", "Region 3", "Region 4", "Region 5", "Region 6"])
    }
  }, [formData.location.country])

  const handleLocationChange = (value: string) => {
    updateFormData({
      location: {
        ...formData.location,
        region: value,
        // Reset city when region changes
        city: "",
      },
    })
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-xl font-semibold">School Region</h2>
        <p className="text-sm text-muted-foreground">Select the state/province/region where your school is located</p>
      </div>

      <div className="space-y-4">
        <Select
          value={formData.location.region}
          onValueChange={handleLocationChange}
          disabled={!formData.location.country}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select State/Province/Region" />
          </SelectTrigger>
          <SelectContent>
            {regions.map((region) => (
              <SelectItem key={region} value={region}>
                {region}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {!formData.location.country && <p className="text-sm text-muted-foreground">Please select a country first</p>}
      </div>

      <div className="flex space-x-4">
        <Button variant="outline" onClick={onPrevious} className="flex-1">
          Back
        </Button>
        <Button onClick={onNext} className="flex-1" disabled={!isStepComplete(6)}>
          Continue
        </Button>
      </div>
    </div>
  )
}

