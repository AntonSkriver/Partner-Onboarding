"use client"

import { usePartnerOnboarding } from "../../../contexts/partner-onboarding-context"
import { Check } from "lucide-react"

interface PartnerProgressBarProps {
  currentStep: number
  totalSteps: number
  stepNames: string[]
  onGoToStep?: (step: number) => void
}

export function PartnerProgressBar({ currentStep, totalSteps, stepNames, onGoToStep }: PartnerProgressBarProps) {
  const { isStepComplete } = usePartnerOnboarding()

  const handleStepClick = (stepIndex: number) => {
    if (!onGoToStep) return
    if (stepIndex <= currentStep && isStepComplete(stepIndex + 1)) {
      onGoToStep(stepIndex)
    }
  }

  return (
    <div className="space-y-4">
      {/* Header with step info */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-[#8157D9]/10 text-[#8157D9] font-bold text-sm">
            {currentStep + 1}/{totalSteps + 1}
          </div>
          <div>
            <p className="text-xs text-gray-400 uppercase tracking-wider font-medium">Current Step</p>
            <h2 className="text-lg font-semibold text-gray-900">{stepNames[currentStep]}</h2>
          </div>
        </div>

        {currentStep < totalSteps && (
          <div className="text-right hidden sm:block">
            <p className="text-xs text-gray-400 uppercase tracking-wider font-medium">Up Next</p>
            <p className="text-sm text-gray-500">{stepNames[currentStep + 1]}</p>
          </div>
        )}
      </div>

      {/* Progress track */}
      <div className="relative">
        {/* Background track */}
        <div className="absolute top-1/2 left-0 right-0 h-1 -translate-y-1/2 bg-gray-100 rounded-full" />

        {/* Filled track with gradient */}
        <div
          className="absolute top-1/2 left-0 h-1 -translate-y-1/2 bg-gradient-to-r from-[#8157D9] to-[#a78bfa] rounded-full transition-all duration-500 ease-out"
          style={{ width: `${(currentStep / totalSteps) * 100}%` }}
        >
          {/* Animated glow effect */}
          <div className="absolute right-0 top-1/2 -translate-y-1/2 w-2 h-2 bg-[#8157D9] rounded-full shadow-[0_0_12px_rgba(129,87,217,0.6)]" />
        </div>

        {/* Step indicators */}
        <div className="relative flex justify-between">
          {stepNames.slice(0, totalSteps + 1).map((step, index) => {
            const stepComplete = isStepComplete(index + 1)
            const isClickable = !!onGoToStep && index <= currentStep && stepComplete
            const isCurrent = index === currentStep
            const isPast = index < currentStep

            return (
              <div
                key={index}
                className="flex flex-col items-center"
                onClick={() => isClickable && handleStepClick(index)}
              >
                <div
                  className={`
                    relative flex items-center justify-center w-8 h-8 rounded-full border-2 z-10
                    transition-all duration-300 ease-out
                    ${isPast
                      ? "bg-[#8157D9] border-[#8157D9] text-white"
                      : isCurrent
                        ? "bg-white border-[#8157D9] text-[#8157D9] shadow-lg shadow-[#8157D9]/20"
                        : "bg-white border-gray-200 text-gray-400"
                    }
                    ${isClickable ? "cursor-pointer hover:scale-110" : "cursor-default"}
                  `}
                  role={isClickable ? "button" : "presentation"}
                  aria-label={isClickable ? `Go to step ${index + 1}: ${step}` : `Step ${index + 1}: ${step}`}
                  tabIndex={isClickable ? 0 : -1}
                >
                  {isPast ? (
                    <Check className="w-4 h-4" strokeWidth={3} />
                  ) : (
                    <span className="text-xs font-bold">{index + 1}</span>
                  )}

                  {/* Current step pulse animation */}
                  {isCurrent && (
                    <span className="absolute inset-0 rounded-full bg-[#8157D9]/20 animate-ping" />
                  )}
                </div>

                {/* Step label - only show on larger screens */}
                <span className={`
                  hidden md:block mt-2 text-xs font-medium text-center max-w-[80px] leading-tight
                  ${isCurrent ? 'text-[#8157D9]' : isPast ? 'text-gray-600' : 'text-gray-400'}
                `}>
                  {step}
                </span>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
