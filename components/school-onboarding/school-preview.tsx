"use client"

import { useSchoolForm } from "@/contexts/school-form-context"
import { School, MapPin, Users, Globe, Mail, User, Heart, GraduationCap } from "lucide-react"
import { useTranslations } from "next-intl"

interface SchoolPreviewProps {
  currentStep?: number
}

export function SchoolPreview({ currentStep }: SchoolPreviewProps) {
  const { formData } = useSchoolForm()
  const t = useTranslations('schoolOnboarding')

  const isHighlighted = (section: 'header' | 'details' | 'contact' | 'interests' | 'sdg') => {
    if (!currentStep) return false
    switch (section) {
      case 'header': return currentStep === 1 || currentStep === 2
      case 'details': return currentStep === 2
      case 'contact': return currentStep === 3
      case 'interests': return currentStep === 4
      case 'sdg': return currentStep === 5
      default: return false
    }
  }

  const sectionClass = (section: 'header' | 'details' | 'contact' | 'interests' | 'sdg') =>
    isHighlighted(section) ? 'border-l-2 border-purple-500 pl-3 -ml-3' : ''

  const hasName = formData.schoolName
  const hasLocation = formData.country || formData.city
  const hasDetails = formData.studentCount || formData.teacherCount || (formData.gradelevels && formData.gradelevels.length > 0)
  const hasLanguages = formData.languages && formData.languages.length > 0
  const hasContact = formData.contactName || formData.contactEmail
  const hasInterests = (formData.subjectAreas && formData.subjectAreas.length > 0) || (formData.collaborationInterests && formData.collaborationInterests.length > 0)

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold text-gray-900">{t('previewTitle')}</h2>
        <p className="text-sm text-gray-500">{t('previewSubtitle')}</p>
      </div>

      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        {/* Header Section */}
        <div className={`bg-gradient-to-r from-purple-600 to-indigo-600 px-5 py-6 text-white ${sectionClass('header')}`}>
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/20">
              <School className="h-6 w-6 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="truncate text-lg font-bold">
                {formData.schoolName || (
                  <span className="text-white/50">{t('previewYourSchool')}</span>
                )}
              </h3>
              <p className="text-sm text-purple-100">
                {formData.schoolType
                  ? t(`schoolType_${formData.schoolType}`)
                  : <span className="text-white/40">{t('previewSelectType')}</span>
                }
              </p>
            </div>
          </div>
          {hasLocation && (
            <div className="mt-3 flex items-center gap-1.5 text-sm text-purple-200">
              <MapPin className="h-3.5 w-3.5" />
              <span>
                {formData.city && formData.country
                  ? `${formData.city}, ${formData.country}`
                  : formData.country || formData.city}
              </span>
            </div>
          )}
        </div>

        <div className="divide-y divide-gray-100 p-5">
          {/* School Details */}
          <div className={`pb-4 ${sectionClass('details')}`}>
            <h4 className="mb-2 text-xs font-medium uppercase tracking-wider text-gray-400">{t('previewSchoolDetails')}</h4>
            {hasDetails || hasLanguages ? (
              <div className="space-y-1.5">
                {formData.studentCount && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Users className="h-4 w-4 shrink-0" />
                    <span>{formData.studentCount} {t('previewStudents')}</span>
                  </div>
                )}
                {formData.teacherCount && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <GraduationCap className="h-4 w-4 shrink-0" />
                    <span>{formData.teacherCount} {t('previewTeachers')}</span>
                  </div>
                )}
                {formData.gradelevels && formData.gradelevels.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-1">
                    {formData.gradelevels.slice(0, 4).map((grade, i) => (
                      <span key={i} className="inline-flex items-center px-2 py-0.5 rounded-full bg-gray-100 text-xs text-gray-600">
                        {grade}
                      </span>
                    ))}
                    {formData.gradelevels.length > 4 && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-gray-100 text-xs text-gray-500">
                        +{formData.gradelevels.length - 4}
                      </span>
                    )}
                  </div>
                )}
                {hasLanguages && (
                  <div className="flex items-center gap-2 text-sm text-gray-600 mt-1">
                    <Globe className="h-4 w-4 shrink-0" />
                    <span>{formData.languages!.slice(0, 3).join(', ')}{formData.languages!.length > 3 ? ` +${formData.languages!.length - 3}` : ''}</span>
                  </div>
                )}
              </div>
            ) : (
              <div className="rounded-lg border border-dashed border-gray-200 px-3 py-4 text-center text-sm text-gray-300">
                {t('previewDetailsPlaceholder')}
              </div>
            )}
          </div>

          {/* Interests */}
          <div className={`py-4 ${sectionClass('interests')}`}>
            <h4 className="mb-2 text-xs font-medium uppercase tracking-wider text-gray-400">{t('previewInterests')}</h4>
            {hasInterests ? (
              <div className="flex flex-wrap gap-1.5">
                {formData.subjectAreas?.slice(0, 4).map((subject, i) => (
                  <span key={i} className="inline-flex items-center px-2.5 py-1 rounded-full bg-purple-50 text-xs font-medium text-purple-700">
                    {subject}
                  </span>
                ))}
                {(formData.subjectAreas?.length || 0) > 4 && (
                  <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-gray-100 text-xs text-gray-500">
                    +{formData.subjectAreas!.length - 4}
                  </span>
                )}
              </div>
            ) : (
              <div className="rounded-lg border border-dashed border-gray-200 px-3 py-4 text-center text-sm text-gray-300">
                {t('previewInterestsPlaceholder')}
              </div>
            )}
          </div>

          {/* Contact */}
          <div className={`pt-4 ${sectionClass('contact')}`}>
            <h4 className="mb-2 text-xs font-medium uppercase tracking-wider text-gray-400">{t('previewContact')}</h4>
            {hasContact ? (
              <div className="space-y-1.5">
                {formData.contactName && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <User className="h-4 w-4 shrink-0" />
                    <span>{formData.contactName}</span>
                    {formData.contactRole && (
                      <span className="text-gray-400 capitalize">· {formData.contactRole}</span>
                    )}
                  </div>
                )}
                {formData.contactEmail && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Mail className="h-4 w-4 shrink-0" />
                    <span className="truncate">{formData.contactEmail}</span>
                  </div>
                )}
              </div>
            ) : (
              <div className="rounded-lg border border-dashed border-gray-200 px-3 py-4 text-center text-sm text-gray-300">
                {t('previewContactPlaceholder')}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Tips */}
      <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
        <h4 className="mb-1 text-sm font-medium text-blue-900">{t('previewTipsTitle')}</h4>
        <ul className="space-y-0.5 text-sm text-blue-800">
          <li>{'· '}{t('previewTipSchoolName')}</li>
          <li>{'· '}{t('previewTipDetails')}</li>
          <li>{'· '}{t('previewTipContact')}</li>
        </ul>
      </div>
    </div>
  )
}
