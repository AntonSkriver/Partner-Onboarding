"use client"

import type React from "react"

import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { useProfileForm, type Grade } from "../context/profile-form-context"

// First, import the necessary icons at the top of the file
import { Baby, GraduationCap, School, BookOpen, Building } from "lucide-react"

interface GradesSelectionProps {
  onNext: () => void
  onPrevious: () => void
  onGoToStep: (step: number) => void
}

export function GradesSelection({ onNext, onPrevious }: GradesSelectionProps) {
  const { formData, updateFormData } = useProfileForm()

  // Then, update the grades array to include icons
  const grades: { id: Grade; label: string; icon: React.ReactNode }[] = [
    { id: "early_childhood", label: "Early Childhood (Ages 3-5)", icon: <Baby className="h-5 w-5" /> },
    { id: "elementary", label: "Elementary (Grades 1-5)", icon: <School className="h-5 w-5" /> },
    { id: "middle_school", label: "Middle School (Grades 6-8)", icon: <BookOpen className="h-5 w-5" /> },
    { id: "high_school", label: "High School (Grades 9-12)", icon: <GraduationCap className="h-5 w-5" /> },
    { id: "higher_education", label: "Higher Education", icon: <Building className="h-5 w-5" /> },
  ]

  const toggleGrade = (grade: Grade) => {
    const updatedGrades = formData.grades.includes(grade)
      ? formData.grades.filter((g) => g !== grade)
      : [...formData.grades, grade]

    updateFormData({ grades: updatedGrades })
  }

  return (
    <div className="space-y-6 pt-16 sm:pt-6">
      <div className="text-center">
        <h2 className="text-xl font-semibold">Select the grade level(s) you teach or work with</h2>
        <p className="text-sm text-muted-foreground mt-1">You can select multiple grades. This helps us match you with educators teaching similar age groups.</p>
      </div>

      {/* Replace the existing div with the grades mapping with this more visual version: */}
      <div className="space-y-4">
        {grades.map((grade) => (
          <div
            key={grade.id}
            className={`flex items-center space-x-3 p-3 rounded-lg border-2 cursor-pointer transition-all ${
              formData.grades.includes(grade.id)
                ? "border-primary bg-primary/5"
                : "border-muted hover:border-primary/50"
            }`}
            onClick={() => toggleGrade(grade.id)}
          >
            <Checkbox
              id={grade.id}
              checked={formData.grades.includes(grade.id)}
              onCheckedChange={() => toggleGrade(grade.id)}
              className="pointer-events-none"
            />
            <div className="flex items-center space-x-3">
              <div className={`text-${formData.grades.includes(grade.id) ? "primary" : "muted-foreground"}`}>
                {grade.icon}
              </div>
              <Label htmlFor={grade.id} className="cursor-pointer">
                {grade.label}
              </Label>
            </div>
          </div>
        ))}
      </div>

        <div className="flex space-x-4">
        <Button variant="outline" onClick={onPrevious} className="flex-1">
          Back
        </Button>
        <Button
          onClick={onNext}
          className="flex-1 bg-[#8157D9] hover:bg-[#8157D9]/90 text-white"
          disabled={formData.grades.length === 0}
        >
          Continue
        </Button>
      </div>
    </div>
  )
}

