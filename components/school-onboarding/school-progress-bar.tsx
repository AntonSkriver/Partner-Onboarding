"use client"

import { Check } from "lucide-react"
import { useTranslations } from "next-intl"

interface SchoolProgressBarProps {
  currentStep: number
  totalSteps: number
  stepNames: string[]
  onGoToStep?: (step: number) => void
}

export function SchoolProgressBar({ currentStep, totalSteps, stepNames, onGoToStep }: SchoolProgressBarProps) {
  const t = useTranslations('schoolOnboarding')

  const handleStepClick = (stepIndex: number) => {
    if (!onGoToStep) return
    if (stepIndex < currentStep) {
      onGoToStep(stepIndex)
    }
  }

  return (
    <div className="flex items-center gap-4">
      {/* Step counter */}
      <div className="hidden sm:flex items-center gap-2.5 shrink-0">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-100 text-xs font-bold text-purple-700">
          {currentStep + 1}/{totalSteps + 1}
        </div>
        <div className="text-sm font-medium text-gray-900">{stepNames[currentStep]}</div>
      </div>

      {/* Divider */}
      <div className="hidden sm:block h-5 w-px bg-gray-200 shrink-0" />

      {/* Step dots + track */}
      <div className="flex flex-1 items-center">
        {stepNames.slice(0, totalSteps + 1).map((step, index) => {
          const isClickable = !!onGoToStep && index < currentStep
          const isCurrent = index === currentStep
          const isPast = index < currentStep

          return (
            <div key={index} className="flex flex-1 items-center last:flex-none">
              <button
                type="button"
                onClick={() => isClickable && handleStepClick(index)}
                disabled={!isClickable}
                className={`
                  relative flex h-7 w-7 shrink-0 items-center justify-center rounded-full border-2 text-xs font-semibold transition-colors
                  ${isPast
                    ? "border-purple-600 bg-purple-600 text-white"
                    : isCurrent
                      ? "border-purple-600 bg-white text-purple-600"
                      : "border-gray-200 bg-white text-gray-400"
                  }
                  ${isClickable ? "cursor-pointer hover:ring-2 hover:ring-purple-100" : "cursor-default"}
                `}
                aria-label={`${step} — ${t('progressStep')} ${index + 1}`}
              >
                {isPast ? (
                  <Check className="h-3.5 w-3.5" strokeWidth={3} />
                ) : (
                  <span>{index + 1}</span>
                )}
              </button>

              {index < totalSteps && (
                <div className="mx-1 h-0.5 flex-1 rounded-full bg-gray-200">
                  <div
                    className="h-full rounded-full bg-purple-600 transition-all duration-300"
                    style={{ width: isPast ? '100%' : '0%' }}
                  />
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
