"use client"

import { createContext, useContext, useState, type ReactNode } from "react"

export type PartnerType = "ngo" | "government" | "school_network" | "commercial" | "other"
export type ContactRole = "ceo" | "program_manager" | "education_director" | "partnerships_manager" | "communications_director" | "project_coordinator" | "outreach_coordinator" | "other"

export interface PartnerFormData {
  // Step 1: Organization Type
  organizationType: PartnerType | null
  
  // Step 2: Organization Details
  organizationName: string
  organizationWebsite: string
  
  // Step 3: Mission & SDG Focus
  missionStatement: string
  sdgFocus: number[]
  
  // Step 4: Contact Information
  contactName: string
  contactEmail: string
  contactPhone: string
  contactRole: ContactRole | null
  
  // Additional fields for profile
  primaryLanguage: string | null
  operatingCountries: string[]
  establishedYear: number | null
}

interface PartnerFormContextType {
  formData: PartnerFormData
  updateFormData: (data: Partial<PartnerFormData>) => void
  isStepComplete: (step: number) => boolean
  resetForm: () => void
}

const initialFormData: PartnerFormData = {
  organizationType: null,
  organizationName: "UNICEF Denmark",
  organizationWebsite: "https://unicef.dk",
  missionStatement: "UNICEF Denmark works to secure all children's rights through fundraising, education and advocacy in Denmark. We collaborate with schools, organizations and communities to create awareness about children's global situation and mobilize resources for UNICEF's work worldwide.",
  sdgFocus: [],
  contactName: "Anton Skriver",
  contactEmail: "anton@class2class.org",
  contactPhone: "004531640702",
  contactRole: "partnerships_manager",
  primaryLanguage: null,
  operatingCountries: [],
  establishedYear: null,
}

const PartnerFormContext = createContext<PartnerFormContextType | undefined>(undefined)

export function PartnerOnboardingProvider({ children }: { children: ReactNode }) {
  const [formData, setFormData] = useState<PartnerFormData>(initialFormData)

  const updateFormData = (data: Partial<PartnerFormData>) => {
    setFormData((prev) => ({ ...prev, ...data }))
  }

  const resetForm = () => {
    setFormData(initialFormData)
  }

  const isStepComplete = (step: number): boolean => {
    switch (step) {
      case 0: // Welcome screen is always complete
        return true
      case 1: // Organization type selection
        return formData.organizationType !== null
      case 2: // Organization details
        return (
          formData.organizationName.trim() !== "" &&
          (formData.organizationWebsite === "" || 
           /^https?:\/\/.+\..+/.test(formData.organizationWebsite))
        )
      case 3: // Mission & SDG Focus
        return (
          formData.missionStatement.trim().length >= 50 &&
          formData.sdgFocus.length > 0
        )
      case 4: // Contact information
        return (
          formData.contactName.trim() !== "" &&
          /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.contactEmail) &&
          formData.contactRole !== null
        )
      case 5: // Summary is always complete
        return true
      case 6: // Final screen is always complete
        return true
      default:
        return false
    }
  }

  return (
    <PartnerFormContext.Provider value={{ formData, updateFormData, isStepComplete, resetForm }}>
      {children}
    </PartnerFormContext.Provider>
  )
}

export function usePartnerOnboarding() {
  const context = useContext(PartnerFormContext)
  if (context === undefined) {
    throw new Error("usePartnerOnboarding must be used within a PartnerOnboardingProvider")
  }
  return context
}

// Helper functions
export const getOrganizationTypeLabel = (type: PartnerType | null): string => {
  const typeLabels = {
    ngo: 'Non-Governmental Organization',
    government: 'Government Agency',
    school_network: 'School Network',
    commercial: 'Corporate Partner',
    other: 'Other Organization'
  }
  return type ? typeLabels[type] : ''
}

export const getContactRoleLabel = (role: ContactRole | null): string => {
  const roleLabels = {
    ceo: 'CEO/Executive Director',
    program_manager: 'Program Manager',
    education_director: 'Education Director',
    partnerships_manager: 'Partnerships Manager',
    communications_director: 'Communications Director',
    project_coordinator: 'Project Coordinator',
    outreach_coordinator: 'Outreach Coordinator',
    other: 'Other'
  }
  return role ? roleLabels[role] : ''
}

export const SDG_OPTIONS = [
  { id: 1, title: 'No Poverty', color: 'bg-red-600' },
  { id: 2, title: 'Zero Hunger', color: 'bg-yellow-500' },
  { id: 3, title: 'Good Health and Well-being', color: 'bg-green-500' },
  { id: 4, title: 'Quality Education', color: 'bg-red-500' },
  { id: 5, title: 'Gender Equality', color: 'bg-orange-500' },
  { id: 6, title: 'Clean Water and Sanitation', color: 'bg-blue-400' },
  { id: 7, title: 'Affordable and Clean Energy', color: 'bg-yellow-400' },
  { id: 8, title: 'Decent Work and Economic Growth', color: 'bg-purple-600' },
  { id: 9, title: 'Industry, Innovation and Infrastructure', color: 'bg-orange-600' },
  { id: 10, title: 'Reduced Inequalities', color: 'bg-pink-500' },
  { id: 11, title: 'Sustainable Cities and Communities', color: 'bg-yellow-600' },
  { id: 12, title: 'Responsible Consumption and Production', color: 'bg-green-600' },
  { id: 13, title: 'Climate Action', color: 'bg-green-700' },
  { id: 14, title: 'Life Below Water', color: 'bg-blue-500' },
  { id: 15, title: 'Life on Land', color: 'bg-green-800' },
  { id: 16, title: 'Peace, Justice and Strong Institutions', color: 'bg-blue-700' },
  { id: 17, title: 'Partnerships for the Goals', color: 'bg-blue-900' }
]