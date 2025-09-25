"use client"

import { usePartnerOnboarding, getOrganizationTypeLabel, getContactRoleLabel, SDG_OPTIONS } from "../../../contexts/partner-onboarding-context"
import { Building2, Globe, MapPin, Mail, Phone, User } from "lucide-react"
import Image from "next/image"
import { SDGIcon } from "../../sdg-icons"

export function PartnerPreview() {
  const { formData } = usePartnerOnboarding()

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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Partner Profile Preview</h2>
        <p className="text-gray-600">See how your profile will look to schools</p>
      </div>

      {/* Profile Card */}
      <div className="bg-white rounded-2xl shadow-xl border border-purple-200 overflow-hidden">
        {/* Header Section */}
        <div className="bg-gradient-to-r from-purple-600 to-indigo-600 px-6 py-8 text-white relative">
          {/* Decorative Pattern */}
          <div className="absolute inset-0 opacity-10">
            {Array.from({ length: 15 }).map((_, i) => (
              <div
                key={i}
                className="absolute h-1 bg-white transform -rotate-45"
                style={{
                  width: `${Math.random() * 30 + 20}px`,
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                }}
              />
            ))}
          </div>

          <div className="relative flex items-center gap-4">
            {/* Organization Logo */}
            <div className="w-16 h-16 bg-white/20 rounded-xl flex items-center justify-center">
              {getOrganizationLogo() ? (
                <Image
                  src={getOrganizationLogo()!}
                  alt={`${formData.organizationName} logo`}
                  width={48}
                  height={48}
                  className="w-12 h-12 object-contain"
                  onError={(e) => {
                    // Fallback to building icon if logo fails to load
                    const target = e.target as HTMLImageElement
                    target.style.display = 'none'
                    target.nextElementSibling?.classList.remove('hidden')
                  }}
                />
              ) : null}
              <Building2 className={`w-8 h-8 text-white ${getOrganizationLogo() ? 'hidden' : ''}`} />
            </div>

            <div className="flex-1">
              <h3 className="text-xl font-bold">
                {formData.organizationName || "Your Organization"}
              </h3>
              <p className="text-purple-100">
                {getOrganizationTypeLabel(formData.organizationType)}
              </p>
            </div>
          </div>
        </div>

        {/* Content Section */}
        <div className="p-6 space-y-6">
          {/* Mission Statement */}
          {formData.missionStatement && (
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">Mission</h4>
              <p className="text-gray-700 text-sm leading-relaxed">
                {formData.missionStatement}
              </p>
            </div>
          )}

          {/* SDG Focus */}
          {formData.sdgFocus.length > 0 && (
            <div>
              <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <Globe className="w-4 h-4 text-purple-600" />
                UN SDG Focus Areas
              </h4>
              <div className="flex flex-wrap gap-2">
                {getSelectedSDGs().slice(0, 4).map((sdg) => (
                  <div key={sdg!.id} className="flex items-center gap-2">
                    <SDGIcon
                      number={sdg!.id}
                      size="md"
                      showTitle={false}
                      className="w-16 h-16 object-cover rounded-lg shadow-sm"
                    />
                  </div>
                ))}
                {getSelectedSDGs().length > 4 && (
                  <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center text-xs font-medium text-gray-600">
                    +{getSelectedSDGs().length - 4}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Organization Website */}
          {formData.organizationWebsite && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Globe className="w-4 h-4" />
              <a 
                href={formData.organizationWebsite} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-purple-600 hover:underline truncate"
              >
                {formData.organizationWebsite.replace(/^https?:\/\//, '')}
              </a>
            </div>
          )}

          {/* Contact Information */}
          <div className="border-t border-gray-200 pt-4">
            <h4 className="font-semibold text-gray-900 mb-3">Primary Contact</h4>
            <div className="space-y-2">
              {formData.contactName && (
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <User className="w-4 h-4" />
                  <span>{formData.contactName}</span>
                  {formData.contactRole && (
                    <span className="text-gray-400">
                      • {getContactRoleLabel(formData.contactRole)}
                    </span>
                  )}
                </div>
              )}
              
              {formData.contactEmail && (
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Mail className="w-4 h-4" />
                  <span className="truncate">{formData.contactEmail}</span>
                </div>
              )}
              
              {formData.contactPhone && (
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Phone className="w-4 h-4" />
                  <span>{formData.contactPhone}</span>
                </div>
              )}
            </div>
          </div>

          {/* Call to Action */}
          <div className="bg-purple-50 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-900">Ready to collaborate?</p>
                <p className="text-xs text-purple-600">Connect with schools worldwide</p>
              </div>
              <button className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg text-sm font-medium">
                Connect
              </button>
            </div>
          </div>

        </div>
      </div>

      {/* Tips */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="font-medium text-blue-900 mb-2">💡 Profile Tips</h4>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• A clear mission statement helps schools understand your goals</li>
          <li>• Selecting relevant SDGs improves matching with aligned schools</li>
          <li>• Complete contact information builds trust with educators</li>
        </ul>
      </div>
    </div>
  )
}