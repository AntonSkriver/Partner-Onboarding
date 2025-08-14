"use client"

import { createContext, useContext, useState, type ReactNode } from "react"

export type Role = "teacher" | "student" | "administrator" | "other"
export type SchoolType = "public" | "private" | "charter" | "other"
export type Grade = "elementary" | "middle" | "high" | "college"
export type Subject = "math" | "science" | "english" | "history" | "art" | "music" | "pe" | "other"
export type Interest = "technology" | "collaboration" | "innovation" | "research" | "mentoring" | "other"

export interface ProfileFormData {
  firstName?: string
  role: Role | null
  primaryLanguage: string | null
  schoolName: string
  schoolType: SchoolType | null
  location: {
    country: string
    region: string
    city: string
  }
  grades: Grade[]
  subjects: Subject[]
  interests: Interest[]
  aboutMe: string
}

interface ProfileFormContextType {
  formData: ProfileFormData
  updateFormData: (data: Partial<ProfileFormData>) => void
  isStepComplete: (step: number) => boolean
}

const initialFormData: ProfileFormData = {
  firstName: "",
  role: null,
  primaryLanguage: null,
  schoolName: "",
  schoolType: null,
  location: {
    country: "",
    region: "",
    city: "",
  },
  grades: [],
  subjects: [],
  interests: [],
  aboutMe: "",
}

const ProfileFormContext = createContext<ProfileFormContextType | undefined>(undefined)

export function ProfileFormProvider({ children }: { children: ReactNode }) {
  const [formData, setFormData] = useState<ProfileFormData>(initialFormData)

  const updateFormData = (data: Partial<ProfileFormData>) => {
    setFormData((prev) => ({ ...prev, ...data }))
  }

  const isStepComplete = (step: number): boolean => {
    switch (step) {
      case 0: // Welcome screen is always complete
        return true
      case 1: // Role selection
        return formData.role !== null
      case 2: // Language selection
        return formData.primaryLanguage !== null
      case 3: // School info
        return (
          formData.schoolName.trim() !== "" &&
          formData.schoolType !== null &&
          formData.location.country !== "" &&
          formData.location.region !== "" &&
          formData.location.city !== ""
        )
      case 4: // Grades
        return formData.grades.length > 0
      case 5: // Subjects
        return formData.subjects.length > 0
      case 6: // Interests
        return formData.interests.length > 0
      case 7: // Summary is always complete
        return true
      case 8: // Final screen is always complete
        return true
      default:
        return false
    }
  }

  return (
    <ProfileFormContext.Provider value={{ formData, updateFormData, isStepComplete }}>
      {children}
    </ProfileFormContext.Provider>
  )
}

export function useProfileForm() {
  const context = useContext(ProfileFormContext)
  if (context === undefined) {
    throw new Error("useProfileForm must be used within a ProfileFormProvider")
  }
  return context
}

