"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useProfileForm } from "../context/profile-form-context"

interface SchoolNameStepProps {
  onNext: () => void
  onPrevious: () => void
  onGoToStep: (step: number) => void
}

export function SchoolNameStep({ onNext, onPrevious }: SchoolNameStepProps) {
  const { formData, updateFormData, isStepComplete } = useProfileForm()

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-xl font-semibold">School Name</h2>
        <p className="text-sm text-muted-foreground">Tell us the name of your educational institution</p>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="school-name">School Name</Label>
          <Input
            id="school-name"
            value={formData.schoolName}
            onChange={(e) => updateFormData({ schoolName: e.target.value })}
            placeholder="Enter your school's name"
          />
        </div>
      </div>

      <div className="flex space-x-4">
        <Button variant="outline" onClick={onPrevious} className="flex-1">
          Back
        </Button>
        <Button onClick={onNext} className="flex-1" disabled={!isStepComplete(3)}>
          Continue
        </Button>
      </div>
    </div>
  )
}

