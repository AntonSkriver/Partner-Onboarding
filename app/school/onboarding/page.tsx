'use client';

import { useState, useEffect } from 'react';
import { SchoolNameStep } from '@/components/onboarding/school-steps/school-name-step';
import { SchoolDetailsStep } from '@/components/onboarding/school-steps/school-details-step';
import { ContactStep } from '@/components/onboarding/school-steps/contact-step';
import { InterestsStep } from '@/components/onboarding/school-steps/interests-step';
import { SDGSelectionStep } from '@/components/onboarding/steps/sdg-selection-step';
import { SchoolCompletionStep } from '@/components/onboarding/school-steps/school-completion-step';

const TOTAL_STEPS = 6;

interface SchoolOnboardingData {
  schoolName?: string;
  schoolType?: string;
  country?: string;
  city?: string;
  studentCount?: string;
  ageGroup?: string[];
  contactName?: string;
  contactRole?: string;
  contactEmail?: string;
  phone?: string;
  interests?: string[];
  sdgFocus?: string[];
  languages?: string[];
}

export default function SchoolOnboardingPage() {
  const [currentStep, setCurrentStep] = useState(1);
  const [onboardingData, setOnboardingData] = useState<SchoolOnboardingData>({});
  const [invitationData, setInvitationData] = useState<any>(null);

  // Check for invitation acceptance on component mount
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const fromInvitation = urlParams.get('from') === 'invitation';
    
    if (fromInvitation) {
      const pendingInvitation = localStorage.getItem('pendingInvitationAcceptance');
      if (pendingInvitation) {
        try {
          const invitationDetails = JSON.parse(pendingInvitation);
          setInvitationData(invitationDetails);
          
          // Pre-fill school data from invitation
          setOnboardingData(prev => ({
            ...prev,
            schoolName: invitationDetails.schoolName,
            country: invitationDetails.country,
            contactEmail: invitationDetails.contactEmail,
            contactName: invitationDetails.contactName || '',
          }));

          // Clear the pending invitation
          localStorage.removeItem('pendingInvitationAcceptance');
        } catch (error) {
          console.error('Error parsing invitation data:', error);
        }
      }
    }
  }, []);

  const handleSchoolNameNext = (data: { schoolName: string }) => {
    setOnboardingData(prev => ({ ...prev, ...data }));
    setCurrentStep(2);
  };

  const handleSchoolDetailsNext = (data: { schoolType: string; country: string; city: string; studentCount: string; ageGroup: string[]; languages: string[] }) => {
    setOnboardingData(prev => ({ ...prev, ...data }));
    setCurrentStep(3);
  };

  const handleContactNext = (data: { contactName: string; contactRole: string; contactEmail: string; phone?: string }) => {
    setOnboardingData(prev => ({ ...prev, ...data }));
    setCurrentStep(4);
  };

  const handleInterestsNext = (interests: string[]) => {
    setOnboardingData(prev => ({ ...prev, interests }));
    setCurrentStep(5);
  };

  const handleSDGNext = (sdgFocus: string[]) => {
    setOnboardingData(prev => ({ ...prev, sdgFocus }));
    setCurrentStep(6);
  };

  const handleBack = () => {
    setCurrentStep(prev => Math.max(1, prev - 1));
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <SchoolNameStep
            onNext={handleSchoolNameNext}
            onBack={() => window.history.back()}
            currentStep={currentStep}
            totalSteps={TOTAL_STEPS}
            initialData={{ schoolName: onboardingData.schoolName }}
          />
        );
      case 2:
        return (
          <SchoolDetailsStep
            onNext={handleSchoolDetailsNext}
            onBack={handleBack}
            currentStep={currentStep}
            totalSteps={TOTAL_STEPS}
            initialData={{
              schoolType: onboardingData.schoolType,
              country: onboardingData.country,
              city: onboardingData.city,
              studentCount: onboardingData.studentCount,
              ageGroup: onboardingData.ageGroup,
              languages: onboardingData.languages
            }}
          />
        );
      case 3:
        return (
          <ContactStep
            onNext={handleContactNext}
            onBack={handleBack}
            currentStep={currentStep}
            totalSteps={TOTAL_STEPS}
            initialData={{
              contactName: onboardingData.contactName,
              contactRole: onboardingData.contactRole,
              contactEmail: onboardingData.contactEmail,
              phone: onboardingData.phone
            }}
          />
        );
      case 4:
        return (
          <InterestsStep
            onNext={handleInterestsNext}
            onBack={handleBack}
            currentStep={currentStep}
            totalSteps={TOTAL_STEPS}
            initialData={{ interests: onboardingData.interests }}
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
            context="school"
          />
        );
      case 6:
        return (
          <SchoolCompletionStep
            onboardingData={onboardingData}
            currentStep={currentStep}
            totalSteps={TOTAL_STEPS}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {renderStep()}
    </div>
  );
}