'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

interface OrganizationTypeStepProps {
  onNext: (organizationType: string) => void;
  initialValue?: string;
}

const organizationTypes = [
  {
    value: 'ngo',
    label: 'NGO',
    description: 'Non-Governmental Organization',
    icon: '🤝',
    examples: 'UNICEF, Oxfam, Save the Children'
  },
  {
    value: 'government',
    label: 'Government',
    description: 'Government Agency or Ministry',
    icon: '🏛️',
    examples: 'Ministry of Education, Department of Education'
  },
  {
    value: 'school_network',
    label: 'School Network',
    description: 'School District or Educational Network',
    icon: '🏫',
    examples: 'ABC School District, Regional Education Network'
  },
  {
    value: 'commercial',
    label: 'Commercial',
    description: 'Corporate or Business Partner',
    icon: '🏢',
    examples: 'Educational foundations, CSR initiatives'
  }
];

export function OrganizationTypeStep({ onNext, initialValue }: OrganizationTypeStepProps) {
  const [selectedType, setSelectedType] = useState<string>(initialValue || '');

  const handleSelect = (type: string) => {
    setSelectedType(type);
  };

  const handleNext = () => {
    if (selectedType) {
      onNext(selectedType);
    }
  };

  return (
    <>
      <div className="h-full flex flex-col">
        <div className="text-center mb-2">
          <div className="w-10 h-10 c2c-purple-bg rounded-full flex items-center justify-center mx-auto mb-2">
            <span className="text-sm text-white">🏢</span>
          </div>
          <h2 className="heading-primary text-base mb-1 c2c-dark-gray">
            What kind of organization are you?
          </h2>
          <p className="text-gray-600 text-xs">
            Help us understand your organization type.
          </p>
        </div>

        <div className="flex-1 flex flex-col">
          <div className="space-y-2 mb-3">
            {organizationTypes.map((type) => (
              <Card
                key={type.value}
                className={`p-3 cursor-pointer transition-all border-2 hover:border-purple-200 ${
                  selectedType === type.value
                    ? 'border-purple-500 bg-purple-50'
                    : 'border-gray-200'
                }`}
                onClick={() => handleSelect(type.value)}
              >
                <div className="flex items-start gap-4">
                  <div className="text-2xl">{type.icon}</div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h3 className="heading-secondary text-base font-semibold">
                        {type.label}
                      </h3>
                      <div
                        className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                          selectedType === type.value
                            ? 'border-purple-500 bg-purple-500'
                            : 'border-gray-300'
                        }`}
                      >
                        {selectedType === type.value && (
                          <div className="w-2 h-2 bg-white rounded-full"></div>
                        )}
                      </div>
                    </div>
                    <p className="text-gray-600 text-sm mb-1">{type.description}</p>
                    <p className="text-sm text-gray-500">
                      <span className="font-medium">Examples:</span> {type.examples}
                    </p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
          
          {/* Next button in dedicated white space */}
          <div className="flex justify-center pt-2">
            <Button
              onClick={handleNext}
              disabled={!selectedType}
              size="lg"
              className="c2c-purple-bg hover:opacity-90 px-8"
            >
              Next →
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}