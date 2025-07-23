
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
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar Navigation */}
      <div className="w-64 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-6">
          <div className="flex items-center gap-2 mb-8">
            <div className="w-8 h-8 c2c-purple-bg rounded-full flex items-center justify-center">
              <span className="text-white text-sm font-bold">C2C</span>
            </div>
            <span className="font-semibold text-gray-800">Partner Setup</span>
          </div>
          
          {/* Navigation Items */}
          <nav className="space-y-2">
            <div className="px-4 py-3 bg-gray-100 rounded-lg border border-gray-200">
              <span className="text-sm font-medium text-gray-700">Overview</span>
            </div>
            <div className="px-4 py-3 rounded-lg">
              <span className="text-sm text-gray-500">Projects</span>
            </div>
          </nav>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="heading-primary text-xl font-semibold text-gray-800">Hi, Partner</h1>
              <p className="text-sm text-c2c-purple font-medium">Project Coordinator</p>
              <p className="text-sm text-gray-600 mt-1">Welcome to your NGO Partner dashboard</p>
            </div>
            <div className="flex gap-3">
              <button className="px-4 py-2 border border-purple-200 rounded-lg text-sm font-medium hover:bg-purple-50 text-purple-700">
                Export report
              </button>
              <button className="px-4 py-2 bg-purple-100 rounded-lg text-sm font-medium hover:bg-purple-200 text-purple-800">
                + New project
              </button>
            </div>
          </div>
        </div>

        {/* Dashboard Content */}
        <div className="flex-1 p-6">
          {/* Category Cards Row */}
          <div className="grid grid-cols-5 gap-4 mb-6">
            {['Schools', 'Teachers', 'Students', 'Countries', 'NPS'].map((category) => (
              <div key={category} className="bg-white p-6 rounded-lg border border-gray-200 text-center diagonal-stripes">
                <span className="font-medium text-gray-800">{category}</span>
              </div>
            ))}
          </div>

          {/* Setup Section */}
          <div className="bg-white rounded-xl border-2 border-purple-200 p-6">
            <div className="mb-4">
              <h2 className="heading-secondary text-lg font-semibold text-gray-800 mb-1">Complete your setup</h2>
              <div className="flex items-center justify-between text-sm text-gray-600 mb-3">
                <span>Step {currentStep} of {TOTAL_STEPS}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="c2c-purple-bg h-2 rounded-full transition-all duration-300 ease-out"
                  style={{ width: `${(currentStep / TOTAL_STEPS) * 100}%` }}
                ></div>
              </div>
            </div>
            
            {/* Step Content */}
            <div className="mt-6">
              {getStepContent()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}