
'use client';

import { useState } from 'react';
import { OrganizationTypeStep } from '@/components/onboarding/steps/organization-type-step';
import { OrganizationNameStep } from '@/components/onboarding/steps/organization-name-step';
import { OrganizationDescriptionStep } from '@/components/onboarding/steps/organization-description-step';
import { MissionStatementStep } from '@/components/onboarding/steps/mission-statement-step';
import { SDGSelectionStep } from '@/components/onboarding/steps/sdg-selection-step';
import { ProfileCompletionStep } from '@/components/onboarding/steps/profile-completion-step';
import Image from 'next/image';

const TOTAL_STEPS = 6;

interface OnboardingData {
  organizationType?: string;
  organizationName?: string;
  website?: string;
  description?: string;
  mission?: string;
  sdgFocus?: string[];
  aiPrefillData?: any;
}

export default function PartnerOnboardingPage() {
  const [currentStep, setCurrentStep] = useState(1);
  const [onboardingData, setOnboardingData] = useState<OnboardingData>({});

  const handleOrganizationTypeNext = (organizationType: string) => {
    setOnboardingData(prev => ({ ...prev, organizationType }));
    setCurrentStep(2);
  };

  const handleOrganizationNameNext = (data: { organizationName: string; website?: string; aiPrefillData?: any }) => {
    setOnboardingData(prev => ({ 
      ...prev, 
      organizationName: data.organizationName,
      website: data.website,
      aiPrefillData: data.aiPrefillData
    }));
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

  const handleSDGNext = (sdgFocus: string[]) => {
    setOnboardingData(prev => ({ ...prev, sdgFocus }));
    setCurrentStep(6);
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
            aiPrefillData={onboardingData.aiPrefillData}
          />
        );
      case 4:
        return (
          <MissionStatementStep
            onNext={handleMissionNext}
            onBack={handleBack}
            initialValue={onboardingData.mission}
            organizationName={onboardingData.organizationName}
            aiPrefillData={onboardingData.aiPrefillData}
          />
        );
      case 5:
        return (
          <SDGSelectionStep
            onNext={handleSDGNext}
            onBack={handleBack}
            currentStep={currentStep}
            totalSteps={TOTAL_STEPS}
            initialData={{ sdgFocus: onboardingData.sdgFocus }}
            context="partner"
          />
        );
      case 6:
        return (
          <ProfileCompletionStep
            onEnhanceProfile={() => {}}
            organizationName={onboardingData.organizationName || ''}
            organizationType={onboardingData.organizationType || ''}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#7F56D9] via-purple-500 to-[#7F56D9]">
      {/* Header */}
      <div className="relative z-10">
        <div className="flex items-center justify-start p-4 max-w-6xl mx-auto">
          <div className="flex items-center gap-3">
            <Image 
              src="/isotipo.png" 
              alt="Class2Class Logo" 
              width={40} 
              height={40}
              className="w-10 h-10"
            />
            <span className="font-semibold text-white text-lg">Partner Setup</span>
          </div>
        </div>
      </div>
      
      {/* Main Content */}
      <div className="relative z-10 flex-1 flex flex-col items-center justify-start px-4 py-6">
        <div className="w-full max-w-4xl mx-auto">
          {/* Setup Card */}
          <div className="bg-white bg-opacity-95 backdrop-blur-sm rounded-2xl border border-white border-opacity-30 p-8 shadow-2xl">
            <div className="mb-6 pb-4 border-b border-gray-100">
              <h2 className="text-2xl font-bold text-gray-900 mb-2 text-center">Complete your setup</h2>
              <div className="flex items-center justify-center text-sm text-gray-600 mb-3">
                <span>Step {currentStep} of {TOTAL_STEPS}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-[#7F56D9] h-2 rounded-full transition-all duration-300 ease-out"
                  style={{ width: `${(currentStep / TOTAL_STEPS) * 100}%` }}
                ></div>
              </div>
            </div>
            
            {/* Step Content */}
            <div className="min-h-[400px]">
              {getStepContent()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}