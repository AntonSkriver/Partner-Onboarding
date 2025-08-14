"use client"

import { usePartnerOnboarding } from "../../../contexts/partner-onboarding-context"

interface PartnerProgressBarProps {
  currentStep: number
  totalSteps: number
  stepNames: string[]
  onGoToStep?: (step: number) => void
}

export function PartnerProgressBar({ currentStep, totalSteps, stepNames, onGoToStep }: PartnerProgressBarProps) {
  const { isStepComplete } = usePartnerOnboarding()
  
  // Calculate progress percentage
  const progressPercentage = (currentStep / totalSteps) * 100

  // Handle step click - only navigate if the step is completed or is the current step
  const handleStepClick = (stepIndex: number) => {
    // If no onGoToStep function is provided, do nothing
    if (!onGoToStep) return

    // Only allow navigation to completed steps or current step
    if (stepIndex <= currentStep && isStepComplete(stepIndex + 1)) {
      onGoToStep(stepIndex)
    }
  }

  return (
    <div className="space-y-4">
      {/* Step counter and names */}
      <div className="flex items-center justify-between mb-1">
        <div>
          <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
            {currentStep + 1}/{totalSteps + 1}
          </span>
          <h2 className="text-lg font-medium text-purple-600 mt-1">{stepNames[currentStep]}</h2>
        </div>
        {currentStep < totalSteps && (
          <div className="text-right">
            <span className="text-xs text-gray-400">Next</span>
            <p className="text-sm text-gray-500">{stepNames[currentStep + 1]}</p>
          </div>
        )}
      </div>

      {/* Visual progress steps */}
      <div className="relative">
        {/* Background track */}
        <div className="absolute top-1/2 left-0 right-0 h-0.5 -translate-y-1/2 bg-gray-200"></div>

        {/* Filled track */}
        <div
          className="absolute top-1/2 left-0 h-0.5 -translate-y-1/2 bg-purple-600 transition-all duration-300 ease-in-out"
          style={{ width: `${progressPercentage}%` }}
        ></div>

        {/* Step indicators */}
        <div className="relative flex justify-between">
          {stepNames.slice(0, totalSteps + 1).map((step, index) => {
            // Determine if this step is clickable (only completed steps)
            const stepComplete = isStepComplete(index + 1)
            const isClickable = !!onGoToStep && index <= currentStep && stepComplete

            return (
              <div
                key={index}
                className="flex flex-col items-center"
                onClick={() => isClickable && handleStepClick(index)}
              >
                <div
                  className={`
                    flex items-center justify-center w-7 h-7 rounded-full border-2 
                    transition-all duration-300 z-10
                    ${
                      index < currentStep
                        ? "bg-purple-600 border-purple-600 text-white"
                        : index === currentStep
                          ? "bg-white border-purple-600 text-purple-600"
                          : "bg-white border-gray-300 text-gray-400"
                    }
                    ${isClickable ? "cursor-pointer hover:scale-110" : "cursor-default"}
                  `}
                  role={isClickable ? "button" : "presentation"}
                  aria-label={isClickable ? `Go to step ${index + 1}: ${step}` : `Step ${index + 1}: ${step}`}
                  tabIndex={isClickable ? 0 : -1}
                >
                  {index < currentStep ? (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="12"
                      height="12"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="3"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                  ) : (
                    <span className="text-xs font-medium">{index + 1}</span>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}