"use client"

import { usePartnerOnboarding, getOrganizationTypeLabel, getContactRoleLabel, SDG_OPTIONS } from "../../../contexts/partner-onboarding-context"
import { Building2, Globe, Mail, Phone, User } from "lucide-react"
import Image from "next/image"
import { SDGIcon } from "../../sdg-icons"
import { useTranslations } from "next-intl"

interface PartnerPreviewProps {
  currentStep?: number
}

export function PartnerPreview({ currentStep }: PartnerPreviewProps) {
  const { formData } = usePartnerOnboarding()
  const t = useTranslations('onboarding')

  const getSelectedSDGs = () => {
    return formData.sdgFocus.map(id => SDG_OPTIONS.find(sdg => sdg.id === id)).filter(Boolean)
  }

  const getOrganizationLogo = () => {
    if (formData.organizationWebsite) {
      try {
        const domain = new URL(formData.organizationWebsite).hostname.replace('www.', '')
        return `https://logo.clearbit.com/${domain}`
      } catch {
        return null
      }
    }
    return null
  }

  // Step mapping: 1=Type, 2=Details, 3=SDG, 4=Contact, 5=Summary, 6=Final
  const isHighlighted = (section: 'header' | 'sdg' | 'contact') => {
    if (!currentStep) return false
    switch (section) {
      case 'header': return currentStep === 1 || currentStep === 2
      case 'sdg': return currentStep === 3
      case 'contact': return currentStep === 4
      default: return false
    }
  }

  const sectionClass = (section: 'header' | 'sdg' | 'contact') =>
    isHighlighted(section) ? 'border-l-2 border-purple-500 pl-3 -ml-3' : ''

  const hasSDGs = formData.sdgFocus.length > 0
  const hasContact = formData.contactName || formData.contactEmail

  return (
    <div className="space-y-4">
      {/* Header */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900">{t('previewTitle')}</h2>
        <p className="text-sm text-gray-500">{t('previewSubtitle')}</p>
      </div>

      {/* Profile Card */}
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        {/* Header Section */}
        <div className={`bg-gradient-to-r from-purple-600 to-indigo-600 px-5 py-6 text-white ${sectionClass('header')}`}>
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/20">
              {getOrganizationLogo() ? (
                <Image
                  src={getOrganizationLogo()!}
                  alt={`${formData.organizationName} logo`}
                  width={36}
                  height={36}
                  className="h-9 w-9 object-contain"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement
                    target.style.display = 'none'
                    target.nextElementSibling?.classList.remove('hidden')
                  }}
                />
              ) : null}
              <Building2 className={`h-6 w-6 text-white ${getOrganizationLogo() ? 'hidden' : ''}`} />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="truncate text-lg font-bold">
                {formData.organizationName || (
                  <span className="text-white/50">{t('previewYourOrganization')}</span>
                )}
              </h3>
              <p className="text-sm text-purple-100">
                {formData.organizationType
                  ? getOrganizationTypeLabel(formData.organizationType)
                  : <span className="text-white/40">{t('previewSelectType')}</span>
                }
              </p>
            </div>
          </div>
        </div>

        {/* Content Section */}
        <div className="divide-y divide-gray-100 p-5">
          {/* SDG Focus */}
          <div className={`py-4 ${sectionClass('sdg')}`}>
            <h4 className="mb-2 text-xs font-medium uppercase tracking-wider text-gray-400">{t('previewSdgFocusAreas')}</h4>
            {hasSDGs ? (
              <div className="flex flex-wrap gap-2">
                {getSelectedSDGs().slice(0, 4).map((sdg) => (
                  <SDGIcon
                    key={sdg!.id}
                    number={sdg!.id}
                    size="md"
                    showTitle={false}
                    className="h-12 w-12 rounded-lg object-cover shadow-sm"
                  />
                ))}
                {getSelectedSDGs().length > 4 && (
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gray-100 text-xs font-medium text-gray-600">
                    +{getSelectedSDGs().length - 4}
                  </div>
                )}
              </div>
            ) : (
              <div className="rounded-lg border border-dashed border-gray-200 px-3 py-4 text-center text-sm text-gray-300">
                {t('previewSdgPlaceholder')}
              </div>
            )}
          </div>

          {/* Website or School Location */}
          {formData.organizationType === 'school' ? (
            formData.country && formData.city ? (
              <div className="py-4">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Globe className="h-4 w-4 shrink-0" />
                  <span className="truncate">{formData.city}, {formData.country}</span>
                </div>
                {(formData.numberOfStudents || formData.numberOfTeachers) && (
                  <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
                    <User className="h-4 w-4 shrink-0" />
                    <span>{formData.numberOfStudents} students · {formData.numberOfTeachers} teachers</span>
                  </div>
                )}
              </div>
            ) : null
          ) : (
            formData.organizationWebsite && (
              <div className="py-4">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Globe className="h-4 w-4 shrink-0" />
                  <span className="truncate text-purple-600">
                    {formData.organizationWebsite.replace(/^https?:\/\//, '')}
                  </span>
                </div>
              </div>
            )
          )}

          {/* Contact Information */}
          <div className={`pt-4 ${sectionClass('contact')}`}>
            <h4 className="mb-2 text-xs font-medium uppercase tracking-wider text-gray-400">{t('previewPrimaryContact')}</h4>
            {hasContact ? (
              <div className="space-y-1.5">
                {formData.contactName && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <User className="h-4 w-4 shrink-0" />
                    <span>{formData.contactName}</span>
                    {formData.contactRole && (
                      <span className="text-gray-400">
                        · {getContactRoleLabel(formData.contactRole)}
                      </span>
                    )}
                  </div>
                )}
                {formData.contactEmail && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Mail className="h-4 w-4 shrink-0" />
                    <span className="truncate">{formData.contactEmail}</span>
                  </div>
                )}
                {formData.contactPhone && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Phone className="h-4 w-4 shrink-0" />
                    <span>{formData.contactPhone}</span>
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
          <li>{'· '}{t('previewTipOrgName')}</li>
          <li>{'· '}{t('previewTipSdg')}</li>
          <li>{'· '}{t('previewTipContact')}</li>
        </ul>
      </div>
    </div>
  )
}
