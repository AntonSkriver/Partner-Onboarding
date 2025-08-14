"use client"

import type React from "react"

import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useProfileForm, type Interest } from "../context/profile-form-context"
import { Globe, Lightbulb, Puzzle } from "lucide-react"

interface InterestsMotivationsProps {
  onNext: () => void
  onPrevious: () => void
  onGoToStep: (step: number) => void
}

export function InterestsMotivations({ onNext, onPrevious }: InterestsMotivationsProps) {
  const { formData, updateFormData } = useProfileForm()

  const interests: { id: Interest; label: string; description: string; icon: React.ReactNode }[] = [
    {
      id: "explore_cultures",
      label: "Explore Cultures",
      description: "Connect students with peers worldwide to explore diverse traditions and perspectives",
      icon: <Globe className="h-5 w-5" />,
    },
    {
      id: "explore_global_challenges",
      label: "Explore Global Challenges",
      description: "Engage students with UN Sustainable Development Goals and worldwide challenges",
      icon: <Puzzle className="h-5 w-5" />,
    },
    {
      id: "create_solutions",
      label: "Create Solutions",
      description: "Collaborate across borders to design solutions to real-world problems",
      icon: <Lightbulb className="h-5 w-5" />,
    },
  ]

  const toggleInterest = (interest: Interest) => {
    const updatedInterests = formData.interests.includes(interest)
      ? formData.interests.filter((i) => i !== interest)
      : [...formData.interests, interest]

    updateFormData({ interests: updatedInterests })
  }

  const showOtherField = formData.interests.includes("other")

  return (
    <div className="space-y-6 pt-16 sm:pt-6">
      <div className="text-center">
        <h2 className="text-xl font-semibold">What type of classroom collaborations interest you?</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Select the type(s) of global connections you'd like to create for your students
        </p>
      </div>

      <div className="space-y-4">
        {interests.map((interest) => (
          <div
            key={interest.id}
            className={`flex items-start p-4 rounded-lg border-2 cursor-pointer transition-all ${
              formData.interests.includes(interest.id)
                ? "border-primary bg-primary/5"
                : "border-muted hover:border-primary/50"
            }`}
            onClick={() => toggleInterest(interest.id)}
          >
            <Checkbox
              id={interest.id}
              checked={formData.interests.includes(interest.id)}
              onCheckedChange={() => toggleInterest(interest.id)}
              className="mt-1 pointer-events-none"
            />
            <div className="ml-3">
              <div className="flex items-center space-x-2 mb-1">
                <div className={`text-${formData.interests.includes(interest.id) ? "primary" : "muted-foreground"}`}>
                  {interest.icon}
                </div>
                <Label htmlFor={interest.id} className="cursor-pointer font-medium">
                  {interest.label}
                </Label>
              </div>
              <p className="text-sm text-muted-foreground ml-7">{interest.description}</p>
            </div>
          </div>
        ))}

        {showOtherField && (
          <div className="space-y-2 pl-10">
            <Label htmlFor="other-interest">Please specify:</Label>
            <Input
              id="other-interest"
              value={formData.otherInterest || ""}
              onChange={(e) => updateFormData({ otherInterest: e.target.value })}
              placeholder="Enter your interest"
            />
          </div>
        )}
      </div>

      <div className="flex space-x-4">
        <Button variant="outline" onClick={onPrevious} className="flex-1">
          Back
        </Button>
        <Button
          onClick={onNext}
          className="flex-1 bg-[#8157D9] hover:bg-[#8157D9]/90 text-white"
          disabled={formData.interests.length === 0 || (showOtherField && !formData.otherInterest)}
        >
          Continue
        </Button>
      </div>
    </div>
  )
}

