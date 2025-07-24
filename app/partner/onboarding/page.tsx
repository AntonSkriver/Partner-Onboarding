
'use client';

import { useState } from 'react';
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
            organizationName={onboardingData.organizationName}
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
            organizationName={onboardingData.organizationName}
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
            onViewProfile={() => {}}
            onEnhanceProfile={() => {}}
            onStartCollaborating={() => {}}
            organizationName={onboardingData.organizationName || ''}
            organizationType={onboardingData.organizationType || ''}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-400 via-purple-500 to-purple-600 relative overflow-hidden">
      {/* World Map Background */}
      <div className="absolute inset-0 opacity-10">
        <div className="world-map-bg"></div>
      </div>
      
      {/* Compact Header */}
      <div className="relative z-10">
        <div className="flex items-center justify-start p-4 max-w-6xl mx-auto">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-700 rounded-full flex items-center justify-center border border-white border-opacity-30">
              <span className="text-white text-sm font-bold">C2C</span>
            </div>
            <span className="font-semibold text-white text-lg">Partner Setup</span>
          </div>
        </div>
      </div>
      
      {/* Compact Main Content */}
      <div className="relative z-10 flex-1 flex flex-col items-center justify-start px-4 py-6">
        <div className={`w-full ${currentStep === 6 ? 'max-w-5xl' : 'max-w-3xl'}`}>
          {/* Compact Setup Card */}
          <div className="bg-white bg-opacity-95 backdrop-blur-sm rounded-2xl border border-white border-opacity-30 p-6 shadow-2xl" style={{ height: 'calc(100vh - 120px)', maxHeight: '760px' }}>
            <div className="mb-4 pb-3 border-b border-gray-100">
              <h2 className="heading-secondary text-base font-semibold text-gray-800 mb-2 text-center">Complete your setup</h2>
              <div className="flex items-center justify-center text-xs text-gray-600 mb-2">
                <span>Step {currentStep} of {TOTAL_STEPS}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="c2c-purple-bg h-2 rounded-full transition-all duration-300 ease-out"
                  style={{ width: `${(currentStep / TOTAL_STEPS) * 100}%` }}
                ></div>
              </div>
            </div>
            
            {/* Step Content - Scrollable for final step */}
            <div className={`flex-1 ${currentStep === 7 ? 'overflow-y-auto' : 'flex flex-col justify-center'}`} style={{ height: 'calc(100% - 80px)' }}>
              {getStepContent()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}