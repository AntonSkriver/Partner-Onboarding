"use client"

import { type ReactElement } from "react"
import { Button } from "@/components/ui/button"
import { useProfileForm, type Role } from "../context/profile-form-context"
import { GraduationCap, Users, School } from "lucide-react"

interface RoleSelectionProps {
  onNext: () => void
  onPrevious: () => void
  onGoToStep: (step: number) => void
}

interface RoleOption {
  id: Role
  title: string
  description: string
  icon: React.ElementType
}

export function RoleSelection({ onNext, onPrevious }: RoleSelectionProps): ReactElement {
  const { formData, updateFormData } = useProfileForm()

  const roles: RoleOption[] = [
    {
      id: "teacher",
      title: "Classroom Teacher",
      description: "I teach students in a classroom setting",
      icon: GraduationCap
    },
    {
      id: "coordinator",
      title: "Program Coordinator",
      description: "I manage educational programs and initiatives",
      icon: Users
    },
    {
      id: "headmaster",
      title: "School Administrator",
      description: "I oversee school operations and management",
      icon: School
    },
  ]

  const selectRole = (role: Role) => {
    updateFormData({ role })
  }

  return (
    <div className="space-y-6 pt-16 sm:pt-6">
      <div className="text-center">
        <h2 className="text-xl font-semibold">What's your role at your school?</h2>
      </div>

      <div className="space-y-4">
        {roles.map((role) => (
          <div
            key={role.id}
            className={`flex items-start p-4 rounded-lg border-2 cursor-pointer transition-all ${
              formData.role === role.id
                ? "border-primary bg-primary/5"
                : "border-muted hover:border-primary/50"
            }`}
            onClick={() => selectRole(role.id)}
          >
            <div className="flex items-center space-x-3 w-full">
              <div className={`text-${formData.role === role.id ? "primary" : "muted-foreground"}`}>
                <role.icon className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-medium text-base">{role.title}</h3>
                <p className="text-sm text-muted-foreground">{role.description}</p>
              </div>
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
          disabled={!formData.role}
        >
          Continue
        </Button>
      </div>
    </div>
  )
}

