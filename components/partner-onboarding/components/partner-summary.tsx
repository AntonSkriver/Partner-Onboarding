"use client"

import { Button } from "@/components/ui/button"
import { usePartnerOnboarding, getOrganizationTypeLabel, getContactRoleLabel, SDG_OPTIONS } from "../../../contexts/partner-onboarding-context"
import { Building2, Globe, Mail, Phone, User, Pencil, CheckCircle2, Sparkles, Target, Rocket } from "lucide-react"
import { SDGIcon } from "../../sdg-icons"

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

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-100 border border-emerald-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span className="text-emerald-700 text-sm font-medium">Step 5 of 5</span>
        </div>

        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 leading-tight">
          Review your
          <br />
          <span className="text-[#8157D9]">profile</span>
        </h1>

        <p className="text-gray-500 max-w-lg mx-auto">
          Almost there! Review your information and make any final edits before completing registration.
        </p>
      </div>

      {/* Summary Cards */}
      <div className="space-y-4">
        {/* Organization Type */}
        <div className="group relative bg-white rounded-2xl p-5 border border-gray-100 hover:border-[#8157D9]/20 hover:shadow-md transition-all duration-300">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-4 flex-1">
              <div className="w-10 h-10 rounded-xl bg-[#8157D9]/10 flex items-center justify-center shrink-0">
                <Building2 className="w-5 h-5 text-[#8157D9]" />
              </div>
              <div>
                <p className="text-xs text-gray-400 uppercase tracking-wider font-medium mb-1">Organization Type</p>
                <p className="font-semibold text-gray-900">{getOrganizationTypeLabel(formData.organizationType)}</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onGoToStep(1)}
              className="opacity-0 group-hover:opacity-100 transition-opacity text-[#8157D9] hover:text-[#7048C6] hover:bg-[#8157D9]/10"
            >
              <Pencil className="w-4 h-4 mr-1" />
              Edit
            </Button>
          </div>
        </div>

        {/* Organization Details */}
        <div className="group relative bg-white rounded-2xl p-5 border border-gray-100 hover:border-[#8157D9]/20 hover:shadow-md transition-all duration-300">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-4 flex-1">
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center shrink-0">
                <Globe className="w-5 h-5 text-blue-500" />
              </div>
              <div>
                <p className="text-xs text-gray-400 uppercase tracking-wider font-medium mb-1">Organization</p>
                <p className="font-semibold text-gray-900">{formData.organizationName || 'Not specified'}</p>
                {formData.organizationWebsite && (
                  <p className="text-sm text-gray-500 mt-1 flex items-center gap-1">
                    <Globe className="w-3 h-3" />
                    {formData.organizationWebsite.replace(/^https?:\/\//, '')}
                  </p>
                )}
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onGoToStep(2)}
              className="opacity-0 group-hover:opacity-100 transition-opacity text-[#8157D9] hover:text-[#7048C6] hover:bg-[#8157D9]/10"
            >
              <Pencil className="w-4 h-4 mr-1" />
              Edit
            </Button>
          </div>
        </div>

        {/* SDG Focus */}
        <div className="group relative bg-white rounded-2xl p-5 border border-gray-100 hover:border-[#8157D9]/20 hover:shadow-md transition-all duration-300">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-4 flex-1">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center shrink-0">
                <Target className="w-5 h-5 text-emerald-500" />
              </div>
              <div className="flex-1">
                <p className="text-xs text-gray-400 uppercase tracking-wider font-medium mb-2">SDG Focus Areas</p>
                <div className="flex flex-wrap gap-1.5">
                  {getSelectedSDGs().slice(0, 6).map((sdg) => (
                    <div key={sdg!.id} className="w-10 h-10 rounded-lg overflow-hidden">
                      <SDGIcon number={sdg!.id} size="sm" showTitle={false} className="w-full h-full" />
                    </div>
                  ))}
                  {getSelectedSDGs().length > 6 && (
                    <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center text-sm font-medium text-gray-500">
                      +{getSelectedSDGs().length - 6}
                    </div>
                  )}
                </div>
                <p className="text-xs text-gray-400 mt-2">{formData.sdgFocus.length} SDGs selected</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onGoToStep(3)}
              className="opacity-0 group-hover:opacity-100 transition-opacity text-[#8157D9] hover:text-[#7048C6] hover:bg-[#8157D9]/10"
            >
              <Pencil className="w-4 h-4 mr-1" />
              Edit
            </Button>
          </div>
        </div>

        {/* Contact Information */}
        <div className="group relative bg-white rounded-2xl p-5 border border-gray-100 hover:border-[#8157D9]/20 hover:shadow-md transition-all duration-300">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-4 flex-1">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center shrink-0">
                <User className="w-5 h-5 text-amber-500" />
              </div>
              <div>
                <p className="text-xs text-gray-400 uppercase tracking-wider font-medium mb-1">Contact Person</p>
                <p className="font-semibold text-gray-900">{formData.contactName || 'Not specified'}</p>
                <p className="text-sm text-gray-500">{getContactRoleLabel(formData.contactRole)}</p>
                <div className="flex flex-wrap items-center gap-3 mt-2 text-sm text-gray-500">
                  <span className="flex items-center gap-1">
                    <Mail className="w-3 h-3" />
                    {formData.contactEmail}
                  </span>
                  {formData.contactPhone && (
                    <span className="flex items-center gap-1">
                      <Phone className="w-3 h-3" />
                      {formData.contactPhone}
                    </span>
                  )}
                </div>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onGoToStep(4)}
              className="opacity-0 group-hover:opacity-100 transition-opacity text-[#8157D9] hover:text-[#7048C6] hover:bg-[#8157D9]/10"
            >
              <Pencil className="w-4 h-4 mr-1" />
              Edit
            </Button>
          </div>
        </div>
      </div>

      {/* Ready to go card */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-50 to-teal-50 p-6 border border-emerald-100">
        <div className="absolute top-0 right-0 w-40 h-40 bg-emerald-200/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="relative flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-6 h-6 text-emerald-600" />
          </div>
          <div>
            <h4 className="font-semibold text-emerald-900 mb-2">Ready to launch!</h4>
            <p className="text-sm text-emerald-700 leading-relaxed mb-3">
              Your profile looks great. Once registered, schools will be able to find you through SDG-based searches and reach out for collaborations.
            </p>
            <div className="flex flex-wrap gap-2">
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-white text-xs font-medium text-emerald-700 border border-emerald-200">
                <CheckCircle2 className="w-3 h-3" /> Discoverable by schools
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-white text-xs font-medium text-emerald-700 border border-emerald-200">
                <CheckCircle2 className="w-3 h-3" /> SDG matching enabled
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-white text-xs font-medium text-emerald-700 border border-emerald-200">
                <CheckCircle2 className="w-3 h-3" /> Contact verified
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* What's next preview */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#8157D9]/5 to-purple-50 p-6 border border-[#8157D9]/10">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-xl bg-[#8157D9]/10 flex items-center justify-center shrink-0">
            <Rocket className="w-5 h-5 text-[#8157D9]" />
          </div>
          <div>
            <h4 className="font-semibold text-gray-900 mb-3">What happens after registration?</h4>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <div className="w-1.5 h-1.5 rounded-full bg-[#8157D9]" />
                Access your partner dashboard with analytics
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <div className="w-1.5 h-1.5 rounded-full bg-[#8157D9]" />
                Browse and connect with schools worldwide
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <div className="w-1.5 h-1.5 rounded-full bg-[#8157D9]" />
                Create and manage SDG-aligned projects
              </div>
            </div>
          </div>
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
          Back
        </Button>
        <Button
          onClick={onNext}
          className="flex-1 py-6 text-base bg-[#8157D9] hover:bg-[#7048C6] text-white shadow-lg shadow-[#8157D9]/25"
          size="lg"
        >
          <Sparkles className="w-5 h-5 mr-2" />
          Complete Registration
        </Button>
      </div>
    </div>
  )
}
