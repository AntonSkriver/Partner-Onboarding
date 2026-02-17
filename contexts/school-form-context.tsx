'use client'

import React, { createContext, useContext, useState, ReactNode } from 'react'

export type SchoolType = 'public' | 'private' | 'international' | 'charter' | 'other'

export interface SchoolFormData {
  // Step 1: School Basic Info
  schoolName?: string
  schoolType?: SchoolType
  
  // Step 2: Location
  country?: string
  city?: string
  region?: string
  
  // Step 3: School Details
  studentCount?: number
  teacherCount?: number
  gradelevels?: string[]
  
  // Step 4: Academic Info
  languages?: string[]
  curriculum?: string[]
  specialPrograms?: string[]
  
  // Step 5: Contact Info
  contactName?: string
  contactEmail?: string
  contactRole?: string
  
  // Step 6: Interests
  subjectAreas?: string[]
  collaborationInterests?: string[]

  // Step 7: SDG Focus
  sdgFocus?: string[]
}

interface SchoolFormContextType {
  formData: SchoolFormData
  updateFormData: (data: Partial<SchoolFormData>) => void
  resetForm: () => void
}

const SchoolFormContext = createContext<SchoolFormContextType | undefined>(undefined)

export function SchoolFormProvider({ children }: { children: ReactNode }) {
  const [formData, setFormData] = useState<SchoolFormData>({})

  const updateFormData = (data: Partial<SchoolFormData>) => {
    setFormData(prev => ({ ...prev, ...data }))
  }

  const resetForm = () => {
    setFormData({})
  }

  return (
    <SchoolFormContext.Provider value={{ formData, updateFormData, resetForm }}>
      {children}
    </SchoolFormContext.Provider>
  )
}

export function useSchoolForm() {
  const context = useContext(SchoolFormContext)
  if (context === undefined) {
    throw new Error('useSchoolForm must be used within a SchoolFormProvider')
  }
  return context
}