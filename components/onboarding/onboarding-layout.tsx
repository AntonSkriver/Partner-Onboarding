'use client';

import { ReactNode } from 'react';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ArrowRight } from 'lucide-react';

interface OnboardingLayoutProps {
  children: ReactNode;
  currentStep: number;
  totalSteps: number;
  onNext?: () => void;
  onBack?: () => void;
  canGoNext?: boolean;
  canGoBack?: boolean;
  nextLabel?: string;
  backLabel?: string;
  isLoading?: boolean;
  title?: string;
  subtitle?: string;
}

export function OnboardingLayout({
  children,
  currentStep,
  totalSteps,
  onNext,
  onBack,
  canGoNext = true,
  canGoBack = true,
  nextLabel = "Continue",
  backLabel = "Back",
  isLoading = false,
  title,
  subtitle
}: OnboardingLayoutProps) {
  const progress = (currentStep / totalSteps) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-c2c-light-gray to-white flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="heading-primary text-3xl mb-2 c2c-dark-gray">
            Welcome to Class2Class
          </h1>
          <p className="text-lg text-gray-600">
            Join our global community of educational partners
          </p>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium c2c-dark-gray">
              Step {currentStep} of {totalSteps}
            </span>
            <span className="text-sm text-gray-500">
              {Math.round(progress)}% complete
            </span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Main Content Card */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-8 mb-6">
          {(title || subtitle) && (
            <div className="mb-6">
              {title && (
                <h2 className="heading-secondary text-xl mb-2 c2c-dark-gray">
                  {title}
                </h2>
              )}
              {subtitle && (
                <p className="text-gray-600">{subtitle}</p>
              )}
            </div>
          )}
          
          {children}
        </div>

        {/* Navigation */}
        <div className="flex justify-between">
          <Button
            variant="outline"
            onClick={onBack}
            disabled={!canGoBack || currentStep === 1}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            {backLabel}
          </Button>

          <Button
            onClick={onNext}
            disabled={!canGoNext || isLoading}
            className="flex items-center gap-2 c2c-purple-bg hover:opacity-90"
          >
            {isLoading ? (
              <>Loading...</>
            ) : (
              <>
                {nextLabel}
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </Button>
        </div>

        {/* Footer */}
        <div className="text-center mt-8 text-sm text-gray-500">
          Need help? Contact us at{' '}
          <a href="mailto:support@class2class.org" className="c2c-purple hover:underline">
            support@class2class.org
          </a>
        </div>
      </div>
    </div>
  );
}