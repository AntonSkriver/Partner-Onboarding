'use client'

import { Check } from 'lucide-react'

interface ProgressBarProps {
  currentStep: number
  totalSteps: number
  stepNames: string[]
  onGoToStep?: (step: number) => void
}

export function ProgressBar({ currentStep, totalSteps, stepNames, onGoToStep }: ProgressBarProps) {
  return (
    <div className="w-full">
      {/* Progress line */}
      <div className="relative mb-4">
        <div className="h-2 bg-gray-200 rounded-full">
          <div 
            className="h-2 bg-purple-600 rounded-full transition-all duration-300"
            style={{ width: `${(currentStep / totalSteps) * 100}%` }}
          />
        </div>
        
        {/* Step indicators */}
        <div className="flex justify-between mt-2">
          {stepNames.map((stepName, index) => (
            <div 
              key={index} 
              className={`flex flex-col items-center cursor-pointer ${
                onGoToStep ? 'hover:opacity-80' : ''
              }`}
              onClick={() => onGoToStep?.(index)}
            >
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium transition-all ${
                index < currentStep 
                  ? 'bg-purple-600 text-white' 
                  : index === currentStep 
                    ? 'bg-purple-600 text-white' 
                    : 'bg-gray-200 text-gray-500'
              }`}>
                {index < currentStep ? (
                  <Check className="w-3 h-3" />
                ) : (
                  index + 1
                )}
              </div>
              <span className={`text-xs mt-1 text-center max-w-16 ${
                index <= currentStep ? 'text-purple-600 font-medium' : 'text-gray-400'
              }`}>
                {stepName}
              </span>
            </div>
          ))}
        </div>
      </div>
      
      {/* Current step info */}
      <div className="text-center">
        <span className="text-sm text-gray-600">
          Step {currentStep + 1} of {totalSteps}
        </span>
      </div>
    </div>
  )
}