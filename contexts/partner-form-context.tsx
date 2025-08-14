'use client'

import React, { createContext, useContext, useState, ReactNode } from 'react'

export type PartnerType = 'ngo' | 'government' | 'school_network' | 'commercial' | 'other'

export interface PartnerFormData {
  // Step 1: Organization Type
  organizationType?: PartnerType
  
  // Step 2: Organization Details
  organizationName?: string
  organizationWebsite?: string
  
  // Step 3: Mission & SDG Focus
  missionStatement?: string
  sdgFocus?: number[]
  
  // Step 4: Contact Information
  contactName?: string
  contactEmail?: string
  contactPhone?: string
  contactRole?: string
  
  // Step 5: Additional Info (future use)
  countries?: string[]
  languages?: string[]
}

interface PartnerFormContextType {
  formData: PartnerFormData
  updateFormData: (data: Partial<PartnerFormData>) => void
  resetForm: () => void
}

const PartnerFormContext = createContext<PartnerFormContextType | undefined>(undefined)

export function PartnerFormProvider({ children }: { children: ReactNode }) {
  const [formData, setFormData] = useState<PartnerFormData>({})

  const updateFormData = (data: Partial<PartnerFormData>) => {
    setFormData(prev => ({ ...prev, ...data }))
  }

  const resetForm = () => {
    setFormData({})
  }

  return (
    <PartnerFormContext.Provider value={{ formData, updateFormData, resetForm }}>
      {children}
    </PartnerFormContext.Provider>
  )
}

export function usePartnerForm() {
  const context = useContext(PartnerFormContext)
  if (context === undefined) {
    throw new Error('usePartnerForm must be used within a PartnerFormProvider')
  }
  return context
}