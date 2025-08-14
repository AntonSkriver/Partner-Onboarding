"use client"

import { Button } from "@/components/ui/button"
import { usePartnerOnboarding, getOrganizationTypeLabel, getContactRoleLabel, SDG_OPTIONS } from "../../../contexts/partner-onboarding-context"
import { Building2, Globe, Mail, Phone, User, Edit3, CheckCircle } from "lucide-react"

interface PartnerSummaryProps {
  onNext: () => void
  onPrevious: () => void
  onGoToStep: (step: number) => void
}

export function PartnerSummary({ onNext, onPrevious, onGoToStep }: PartnerSummaryProps) {
  const { formData } = usePartnerOnboarding()

  const getSelectedSDGs = () => {
    return formData.sdgFocus.map(id => SDG_OPTIONS.find(sdg => sdg.id === id)).filter(Boolean)
  }

  const summaryItems = [
    {
      title: "Organization Type",
      value: getOrganizationTypeLabel(formData.organizationType),
      icon: Building2,
      stepNumber: 1
    },
    {
      title: "Organization Details",
      value: (
        <div className="space-y-1">
          <div className="font-medium">{formData.organizationName}</div>
          {formData.organizationWebsite && (
            <div className="text-sm text-gray-600 flex items-center gap-1">
              <Globe className="w-3 h-3" />
              {formData.organizationWebsite.replace(/^https?:\/\//, '')}
            </div>
          )}
        </div>
      ),
      icon: Building2,
      stepNumber: 2
    },
    {
      title: "Mission & SDG Focus",
      value: (
        <div className="space-y-3">
          <div className="text-sm text-gray-700 leading-relaxed">
            {formData.missionStatement}
          </div>
          <div>
            <div className="text-sm font-medium text-gray-900 mb-2">
              SDG Focus Areas ({formData.sdgFocus.length})
            </div>
            <div className="grid grid-cols-4 gap-1">
              {getSelectedSDGs().slice(0, 8).map((sdg) => (
                <div
                  key={sdg!.id}
                  className={`${sdg!.color} text-white text-xs font-bold rounded px-1.5 py-1 text-center`}
                  title={sdg!.title}
                >
                  {sdg!.id}
                </div>
              ))}
              {getSelectedSDGs().length > 8 && (
                <div className="bg-gray-300 text-gray-700 text-xs font-medium rounded px-1.5 py-1 text-center">
                  +{getSelectedSDGs().length - 8}
                </div>
              )}
            </div>
          </div>
        </div>
      ),
      icon: Globe,
      stepNumber: 3
    },
    {
      title: "Contact Information",
      value: (
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <User className="w-4 h-4 text-gray-500" />
            <span className="font-medium">{formData.contactName}</span>
            <span className="text-gray-500">•</span>
            <span className="text-sm text-gray-600">
              {getContactRoleLabel(formData.contactRole)}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Mail className="w-4 h-4 text-gray-500" />
            <span className="text-sm text-gray-600">{formData.contactEmail}</span>
          </div>
          {formData.contactPhone && (
            <div className="flex items-center gap-2">
              <Phone className="w-4 h-4 text-gray-500" />
              <span className="text-sm text-gray-600">{formData.contactPhone}</span>
            </div>
          )}
        </div>
      ),
      icon: User,
      stepNumber: 4
    }
  ]

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle className="w-8 h-8 text-green-600" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-3">
          Review Your Information
        </h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Please review your partner profile information before completing registration. 
          You can go back to edit any section if needed.
        </p>
      </div>

      {/* Summary Cards */}
      <div className="space-y-6">
        {summaryItems.map((item, index) => (
          <div key={index} className="bg-gray-50 rounded-xl p-6 border border-gray-200">
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-4 flex-1">
                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                  <item.icon className="w-5 h-5 text-purple-600" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 mb-2">{item.title}</h3>
                  <div className="text-gray-700">
                    {typeof item.value === 'string' ? (
                      <p>{item.value}</p>
                    ) : (
                      item.value
                    )}
                  </div>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onGoToStep(item.stepNumber)}
                className="ml-4 flex items-center gap-1 hover:bg-purple-50 hover:border-purple-300"
              >
                <Edit3 className="w-3 h-3" />
                Edit
              </Button>
            </div>
          </div>
        ))}
      </div>

      {/* Profile Completeness */}
      <div className="bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-xl p-6">
        <div className="flex items-start gap-4">
          <CheckCircle className="w-6 h-6 text-green-600 mt-0.5" />
          <div>
            <h4 className="font-semibold text-green-900 mb-2">Profile Complete! 🎉</h4>
            <p className="text-green-800 leading-relaxed mb-4">
              Your partner profile is ready to go! Schools will be able to:
            </p>
            <ul className="space-y-2 text-green-800">
              <li className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4" />
                Find your organization through SDG-based searches
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4" />
                Understand your mission and educational goals
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4" />
                Contact you directly for partnership opportunities
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4" />
                Collaborate on meaningful SDG-aligned projects
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Next Steps Preview */}
      <div className="bg-purple-50 border border-purple-200 rounded-xl p-6">
        <h4 className="font-semibold text-purple-900 mb-3">What happens next?</h4>
        <div className="space-y-3">
          <div className="flex items-start gap-3">
            <div className="w-2 h-2 bg-purple-600 rounded-full mt-2"></div>
            <div>
              <p className="font-medium text-purple-900">Access your partner dashboard</p>
              <p className="text-sm text-purple-700">View analytics, manage projects, and track collaborations</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-2 h-2 bg-purple-600 rounded-full mt-2"></div>
            <div>
              <p className="font-medium text-purple-900">Connect with schools worldwide</p>
              <p className="text-sm text-purple-700">Browse and connect with schools that align with your SDG focus</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-2 h-2 bg-purple-600 rounded-full mt-2"></div>
            <div>
              <p className="font-medium text-purple-900">Create and manage projects</p>
              <p className="text-sm text-purple-700">Launch educational initiatives and track their global impact</p>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex gap-4 pt-4">
        <Button 
          variant="outline" 
          onClick={onPrevious} 
          className="flex-1 py-3 text-base"
          size="lg"
        >
          Back
        </Button>
        <Button
          onClick={onNext}
          className="flex-1 py-3 text-base bg-purple-600 hover:bg-purple-700 text-white"
          size="lg"
        >
          Complete Registration
        </Button>
      </div>
    </div>
  )
}