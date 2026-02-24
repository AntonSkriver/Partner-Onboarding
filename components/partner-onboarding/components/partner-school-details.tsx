"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { usePartnerOnboarding } from "../../../contexts/partner-onboarding-context"
import { School, MapPin, Users, GraduationCap, AlertCircle, CheckCircle2 } from "lucide-react"
import { useTranslations } from "next-intl"

interface PartnerSchoolDetailsProps {
  onNext: () => void
  onPrevious: () => void
  onGoToStep: (step: number) => void
}

const gradeLevels = [
  'Pre-K', 'Kindergarten', '1st Grade', '2nd Grade', '3rd Grade', '4th Grade', '5th Grade',
  '6th Grade', '7th Grade', '8th Grade', '9th Grade', '10th Grade', '11th Grade', '12th Grade'
]

const languageOptions = [
  'English', 'Spanish', 'French', 'German', 'Danish', 'Swedish', 'Norwegian', 'Dutch',
  'Portuguese', 'Italian', 'Chinese', 'Japanese', 'Arabic', 'Russian', 'Other'
]

const countries = [
  'Denmark', 'United States', 'United Kingdom', 'Germany', 'France', 'Spain', 'Netherlands',
  'Sweden', 'Norway', 'Canada', 'Australia', 'Brazil', 'Mexico', 'Italy', 'Other'
]

export function PartnerSchoolDetails({ onNext, onPrevious }: PartnerSchoolDetailsProps) {
  const { formData, updateFormData, isStepComplete } = usePartnerOnboarding()
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [touched, setTouched] = useState<Record<string, boolean>>({})
  const t = useTranslations('onboarding')

  const schoolTypes = [
    { value: 'public', label: t('schoolDetailsTypePublic') },
    { value: 'private', label: t('schoolDetailsTypePrivate') },
    { value: 'international', label: t('schoolDetailsTypeInternational') },
    { value: 'charter', label: t('schoolDetailsTypeCharter') },
    { value: 'other', label: t('schoolDetailsTypeOther') },
  ]

  const validateField = (field: string, value: string | number | null) => {
    const newErrors = { ...errors }

    switch (field) {
      case 'organizationName':
        if (!value || (typeof value === 'string' && !value.trim())) {
          newErrors.organizationName = t('schoolDetailsValidationNameRequired')
        } else {
          delete newErrors.organizationName
        }
        break
      case 'schoolType':
        if (!value) {
          newErrors.schoolType = t('schoolDetailsValidationTypeRequired')
        } else {
          delete newErrors.schoolType
        }
        break
      case 'country':
        if (!value || (typeof value === 'string' && !value.trim())) {
          newErrors.country = t('schoolDetailsValidationCountryRequired')
        } else {
          delete newErrors.country
        }
        break
      case 'city':
        if (!value || (typeof value === 'string' && !value.trim())) {
          newErrors.city = t('schoolDetailsValidationCityRequired')
        } else {
          delete newErrors.city
        }
        break
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleBlur = (field: string) => {
    setTouched(prev => ({ ...prev, [field]: true }))
    const value = formData[field as keyof typeof formData]
    validateField(field, value as string | number | null)
  }

  const handleContinue = () => {
    setTouched({
      organizationName: true,
      schoolType: true,
      country: true,
      city: true,
    })
    validateField('organizationName', formData.organizationName)
    validateField('schoolType', formData.schoolType)
    validateField('country', formData.country)
    validateField('city', formData.city)

    if (isStepComplete(2)) {
      onNext()
    }
  }

  const canProceed = isStepComplete(2)

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <p className="text-sm font-medium text-purple-600 mb-1">{t('schoolDetailsStepLabel')}</p>
        <h1 className="text-2xl font-bold text-gray-900">{t('schoolDetailsStepTitle')}</h1>
        <p className="mt-1 text-sm text-gray-500">{t('schoolDetailsStepSubtitle')}</p>
      </div>

      {/* School Name */}
      <div className="space-y-3">
        <Label htmlFor="schoolName" className="flex items-center gap-2 text-sm font-medium text-gray-700">
          <School className="w-4 h-4 text-[#8157D9]" />
          {t('schoolDetailsName')}
          <span className="text-[#8157D9]">*</span>
        </Label>
        <div className="relative">
          <Input
            id="schoolName"
            placeholder={t('schoolDetailsNamePlaceholder')}
            value={formData.organizationName || ''}
            onChange={(e) => {
              updateFormData({ organizationName: e.target.value })
              if (touched.organizationName) validateField('organizationName', e.target.value)
            }}
            onBlur={() => handleBlur('organizationName')}
            className={`h-14 text-base px-4 rounded-xl transition-all duration-200 ${
              errors.organizationName
                ? 'border-red-300 focus:border-red-500 focus:ring-red-500/20'
                : formData.organizationName
                  ? 'border-green-300 focus:border-green-500 focus:ring-green-500/20'
                  : 'border-gray-200 focus:border-[#8157D9] focus:ring-[#8157D9]/20'
            }`}
          />
          {formData.organizationName && !errors.organizationName && (
            <CheckCircle2 className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-green-500" />
          )}
        </div>
        {errors.organizationName && touched.organizationName && (
          <div className="flex items-center gap-2 text-red-600">
            <AlertCircle className="w-4 h-4" />
            <p className="text-sm">{errors.organizationName}</p>
          </div>
        )}
      </div>

      {/* School Type */}
      <div className="space-y-3">
        <Label className="flex items-center gap-2 text-sm font-medium text-gray-700">
          <GraduationCap className="w-4 h-4 text-[#8157D9]" />
          {t('schoolDetailsType')}
          <span className="text-[#8157D9]">*</span>
        </Label>
        <Select
          value={formData.schoolType || ''}
          onValueChange={(value) => {
            updateFormData({ schoolType: value })
            if (touched.schoolType) validateField('schoolType', value)
          }}
        >
          <SelectTrigger className="h-14 text-base rounded-xl">
            <SelectValue placeholder={t('schoolDetailsTypePlaceholder')} />
          </SelectTrigger>
          <SelectContent>
            {schoolTypes.map((type) => (
              <SelectItem key={type.value} value={type.value}>
                {type.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Location */}
      <div className="space-y-3">
        <Label className="flex items-center gap-2 text-sm font-medium text-gray-700">
          <MapPin className="w-4 h-4 text-[#8157D9]" />
          {t('schoolDetailsLocation')}
          <span className="text-[#8157D9]">*</span>
        </Label>
        <div className="grid grid-cols-2 gap-4">
          <Select
            value={formData.country || ''}
            onValueChange={(value) => {
              updateFormData({ country: value })
              if (touched.country) validateField('country', value)
            }}
          >
            <SelectTrigger className="h-14 text-base rounded-xl">
              <SelectValue placeholder={t('schoolDetailsCountryPlaceholder')} />
            </SelectTrigger>
            <SelectContent>
              {countries.map((country) => (
                <SelectItem key={country} value={country}>
                  {country}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Input
            placeholder={t('schoolDetailsCityPlaceholder')}
            value={formData.city || ''}
            onChange={(e) => {
              updateFormData({ city: e.target.value })
              if (touched.city) validateField('city', e.target.value)
            }}
            onBlur={() => handleBlur('city')}
            className="h-14 text-base px-4 rounded-xl border-gray-200 focus:border-[#8157D9] focus:ring-[#8157D9]/20"
          />
        </div>
      </div>

      {/* School Size */}
      <div className="space-y-3">
        <Label className="flex items-center gap-2 text-sm font-medium text-gray-700">
          <Users className="w-4 h-4 text-[#8157D9]" />
          {t('schoolDetailsSize')}
          <span className="text-[#8157D9]">*</span>
        </Label>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-xs text-gray-500 mb-1">{t('schoolDetailsStudents')}</p>
            <Input
              type="number"
              placeholder={t('schoolDetailsStudentsPlaceholder')}
              value={formData.numberOfStudents ?? ''}
              onChange={(e) => updateFormData({ numberOfStudents: e.target.value ? parseInt(e.target.value) : null })}
              className="h-14 text-base px-4 rounded-xl border-gray-200 focus:border-[#8157D9] focus:ring-[#8157D9]/20"
            />
          </div>
          <div>
            <p className="text-xs text-gray-500 mb-1">{t('schoolDetailsTeachers')}</p>
            <Input
              type="number"
              placeholder={t('schoolDetailsTeachersPlaceholder')}
              value={formData.numberOfTeachers ?? ''}
              onChange={(e) => updateFormData({ numberOfTeachers: e.target.value ? parseInt(e.target.value) : null })}
              className="h-14 text-base px-4 rounded-xl border-gray-200 focus:border-[#8157D9] focus:ring-[#8157D9]/20"
            />
          </div>
        </div>
      </div>

      {/* Grade Levels */}
      <div className="space-y-3">
        <Label className="text-sm font-medium text-gray-700">
          {t('schoolDetailsGradeLevels')} <span className="text-[#8157D9]">*</span>
          <span className="text-gray-400 font-normal ml-1">({t('schoolDetailsSelectAll')})</span>
        </Label>
        <div className="grid grid-cols-3 gap-2 max-h-40 overflow-y-auto rounded-xl border border-gray-200 p-3">
          {gradeLevels.map((grade) => (
            <div key={grade} className="flex items-center space-x-2">
              <Checkbox
                id={`grade-${grade}`}
                checked={formData.gradeLevels.includes(grade)}
                onCheckedChange={(checked) => {
                  const newGrades = checked
                    ? [...formData.gradeLevels, grade]
                    : formData.gradeLevels.filter((g) => g !== grade)
                  updateFormData({ gradeLevels: newGrades })
                }}
              />
              <label htmlFor={`grade-${grade}`} className="text-sm font-normal cursor-pointer">
                {grade}
              </label>
            </div>
          ))}
        </div>
      </div>

      {/* Languages */}
      <div className="space-y-3">
        <Label className="text-sm font-medium text-gray-700">
          {t('schoolDetailsLanguages')} <span className="text-[#8157D9]">*</span>
        </Label>
        <div className="grid grid-cols-3 gap-2 max-h-40 overflow-y-auto rounded-xl border border-gray-200 p-3">
          {languageOptions.map((language) => (
            <div key={language} className="flex items-center space-x-2">
              <Checkbox
                id={`lang-${language}`}
                checked={formData.languages.includes(language)}
                onCheckedChange={(checked) => {
                  const newLangs = checked
                    ? [...formData.languages, language]
                    : formData.languages.filter((l) => l !== language)
                  updateFormData({ languages: newLangs })
                }}
              />
              <label htmlFor={`lang-${language}`} className="text-sm font-normal cursor-pointer">
                {language}
              </label>
            </div>
          ))}
        </div>
      </div>

      {/* Navigation */}
      <div className="flex gap-4 pt-4">
        <Button
          variant="outline"
          onClick={onPrevious}
          className="flex-1 py-6 text-base border-gray-200 hover:bg-gray-50"
          size="lg"
        >
          {t('detailsBack')}
        </Button>
        <Button
          onClick={handleContinue}
          className="flex-1 py-6 text-base bg-purple-600 hover:bg-purple-700 text-white disabled:opacity-50"
          disabled={!canProceed}
          size="lg"
        >
          {t('detailsContinue')}
        </Button>
      </div>
    </div>
  )
}
