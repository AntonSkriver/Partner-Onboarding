"use client"

import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { useProfileForm, type SchoolType } from "../context/profile-form-context"
import { Building, BuildingIcon as BuildingCommunity } from "lucide-react"

interface SchoolTypeStepProps {
  onNext: () => void
  onPrevious: () => void
  onGoToStep: (step: number) => void
}

export function SchoolTypeStep({ onNext, onPrevious }: SchoolTypeStepProps) {
  const { formData, updateFormData, isStepComplete } = useProfileForm()

  const handleSchoolTypeChange = (value: string) => {
    updateFormData({ schoolType: value as SchoolType })
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-xl font-semibold">School Type</h2>
        <p className="text-sm text-muted-foreground">Select the type of your educational institution</p>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <RadioGroup
            value={formData.schoolType || ""}
            onValueChange={handleSchoolTypeChange}
            className="grid grid-cols-2 gap-4"
          >
            <Label
              htmlFor="public"
              className={`flex flex-col items-center justify-between rounded-md border-2 p-4 cursor-pointer ${
                formData.schoolType === "public" ? "border-primary" : "border-muted"
              }`}
            >
              <RadioGroupItem value="public" id="public" className="sr-only" />
              <Building className="h-6 w-6 mb-2" />
              <span>Public</span>
            </Label>
            <Label
              htmlFor="private"
              className={`flex flex-col items-center justify-between rounded-md border-2 p-4 cursor-pointer ${
                formData.schoolType === "private" ? "border-primary" : "border-muted"
              }`}
            >
              <RadioGroupItem value="private" id="private" className="sr-only" />
              <BuildingCommunity className="h-6 w-6 mb-2" />
              <span>Private</span>
            </Label>
          </RadioGroup>
        </div>
      </div>

      <div className="flex space-x-4">
        <Button variant="outline" onClick={onPrevious} className="flex-1">
          Back
        </Button>
        <Button onClick={onNext} className="flex-1" disabled={!isStepComplete(4)}>
          Continue
        </Button>
      </div>
    </div>
  )
}

