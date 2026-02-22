"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useProfileForm } from "../context/profile-form-context"

interface SchoolCountryStepProps {
  onNext: () => void
  onPrevious: () => void
  onGoToStep: (step: number) => void
}

export function SchoolCountryStep({ onNext, onPrevious, onGoToStep: _onGoToStep }: SchoolCountryStepProps) {
  const { formData, updateFormData, isStepComplete } = useProfileForm()
  const [countries] = useState<string[]>([
    "United States",
    "Canada",
    "Mexico",
    "Brazil",
    "Argentina",
    "United Kingdom",
    "France",
    "Germany",
    "Spain",
    "Italy",
    "China",
    "Japan",
    "India",
    "Australia",
    "South Africa",
  ])

  const handleLocationChange = (value: string) => {
    updateFormData({
      location: {
        ...formData.location,
        country: value,
        // Reset region and city when country changes
        region: "",
        city: "",
      },
    })
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-xl font-semibold">School Country</h2>
        <p className="text-sm text-muted-foreground">Select the country where your school is located</p>
      </div>

      <div className="space-y-4">
        <Select value={formData.location.country} onValueChange={handleLocationChange}>
          <SelectTrigger>
            <SelectValue placeholder="Select Country" />
          </SelectTrigger>
          <SelectContent>
            {countries.map((country) => (
              <SelectItem key={country} value={country}>
                {country}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex space-x-4">
        <Button variant="outline" onClick={onPrevious} className="flex-1">
          Back
        </Button>
        <Button onClick={onNext} className="flex-1" disabled={!isStepComplete(5)}>
          Continue
        </Button>
      </div>
    </div>
  )
}

