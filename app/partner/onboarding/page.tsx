'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { OrganizationTypeStep } from '@/components/onboarding/steps/organization-type-step';
import { OrganizationNameStep } from '@/components/onboarding/steps/organization-name-step';
import { OrganizationDescriptionStep } from '@/components/onboarding/steps/organization-description-step';
import { MissionStatementStep } from '@/components/onboarding/steps/mission-statement-step';
import { WebsiteStep } from '@/components/onboarding/steps/website-step';
import { SDGSelectionStep } from '@/components/onboarding/steps/sdg-selection-step';
import { ProfileCompletionStep } from '@/components/onboarding/steps/profile-completion-step';

const TOTAL_STEPS = 7;

interface OnboardingData {
  organizationType?: string;
  organizationName?: string;
  description?: string;
  mission?: string;
  website?: string;
  sdgFocus?: string[];
}

export default function PartnerOnboardingPage() {
  const [currentStep, setCurrentStep] = useState(1);
  const [onboardingData, setOnboardingData] = useState<OnboardingData>({});
  const router = useRouter();

  const handleOrganizationTypeNext = (organizationType: string) => {
    setOnboardingData(prev => ({ ...prev, organizationType }));
    setCurrentStep(2);
  };

  const handleOrganizationNameNext = (organizationName: string) => {
    setOnboardingData(prev => ({ ...prev, organizationName }));
    setCurrentStep(3);
  };

  const handleDescriptionNext = (description: string) => {
    setOnboardingData(prev => ({ ...prev, description }));
    setCurrentStep(4);
  };

  const handleMissionNext = (mission: string) => {
    setOnboardingData(prev => ({ ...prev, mission }));
    setCurrentStep(5);
  };

  const handleWebsiteNext = (website: string) => {
    setOnboardingData(prev => ({ ...prev, website }));
    setCurrentStep(6);
  };

  const handleWebsiteSkip = () => {
    setOnboardingData(prev => ({ ...prev, website: '' }));
    setCurrentStep(6);
  };

  const handleSDGNext = (sdgFocus: string[]) => {
    setOnboardingData(prev => ({ ...prev, sdgFocus }));
    setCurrentStep(7);
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleViewProfile = () => {
    // Navigate to profile preview (we'll implement this next)
    router.push('/partner/profile/preview');
  };

  const handleEnhanceProfile = () => {
    // Navigate to profile enhancement (we'll implement this next)
    router.push('/partner/profile/enhance');
  };

  const handleStartCollaborating = () => {
    // Navigate to partner dashboard (we'll implement this next)
    router.push('/partner/dashboard');
  };

  const getStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <OrganizationTypeStep
            onNext={handleOrganizationTypeNext}
            initialValue={onboardingData.organizationType}
          />
        );
      case 2:
        return (
          <OrganizationNameStep
            onNext={handleOrganizationNameNext}
            onBack={handleBack}
            initialValue={onboardingData.organizationName}
            organizationType={onboardingData.organizationType}
          />
        );
      case 3:
        return (
          <OrganizationDescriptionStep
            onNext={handleDescriptionNext}
            onBack={handleBack}
            initialValue={onboardingData.description}
          />
        );
      case 4:
        return (
          <MissionStatementStep
            onNext={handleMissionNext}
            onBack={handleBack}
            initialValue={onboardingData.mission}
          />
        );
      case 5:
        return (
          <WebsiteStep
            onNext={handleWebsiteNext}
            onSkip={handleWebsiteSkip}
            onBack={handleBack}
            initialValue={onboardingData.website}
          />
        );
      case 6:
        return (
          <SDGSelectionStep
            onNext={handleSDGNext}
            onBack={handleBack}
            initialValue={onboardingData.sdgFocus}
          />
        );
      case 7:
        return (
          <ProfileCompletionStep
            onViewProfile={handleViewProfile}
            onEnhanceProfile={handleEnhanceProfile}
            onStartCollaborating={handleStartCollaborating}
            organizationName={onboardingData.organizationName || ''}
            organizationType={onboardingData.organizationType || ''}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-c2c-light-gray to-white">
      {/* Progress Bar */}
      <div className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 c2c-purple-bg rounded-full flex items-center justify-center">
                <span className="text-white text-xs font-bold">C2C</span>
              </div>
              <span className="font-semibold text-gray-800">Partner Onboarding</span>
            </div>
            <div className="text-sm text-gray-600">
              Step {currentStep} of {TOTAL_STEPS}
            </div>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="c2c-purple-bg h-2 rounded-full transition-all duration-300 ease-out"
              style={{ width: `${(currentStep / TOTAL_STEPS) * 100}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Step Content */}
      <div className="container mx-auto px-4 py-8">
        {getStepContent()}
      </div>
    </div>
  );
}