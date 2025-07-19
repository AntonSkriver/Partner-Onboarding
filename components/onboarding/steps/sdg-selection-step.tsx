'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { X } from 'lucide-react';

interface SDGSelectionStepProps {
  onNext: (sdgFocus: string[]) => void;
  onBack: () => void;
  initialValue?: string[];
}

const sdgOptions = [
  { id: '1', title: 'No Poverty', color: 'bg-red-500' },
  { id: '2', title: 'Zero Hunger', color: 'bg-yellow-500' },
  { id: '3', title: 'Good Health and Well-being', color: 'bg-green-500' },
  { id: '4', title: 'Quality Education', color: 'bg-red-600' },
  { id: '5', title: 'Gender Equality', color: 'bg-orange-500' },
  { id: '6', title: 'Clean Water and Sanitation', color: 'bg-blue-400' },
  { id: '7', title: 'Affordable and Clean Energy', color: 'bg-yellow-600' },
  { id: '8', title: 'Decent Work and Economic Growth', color: 'bg-red-700' },
  { id: '9', title: 'Industry, Innovation and Infrastructure', color: 'bg-orange-600' },
  { id: '10', title: 'Reduced Inequalities', color: 'bg-pink-500' },
  { id: '11', title: 'Sustainable Cities and Communities', color: 'bg-yellow-700' },
  { id: '12', title: 'Responsible Consumption and Production', color: 'bg-green-600' },
  { id: '13', title: 'Climate Action', color: 'bg-green-700' },
  { id: '14', title: 'Life Below Water', color: 'bg-blue-500' },
  { id: '15', title: 'Life on Land', color: 'bg-green-800' },
  { id: '16', title: 'Peace, Justice and Strong Institutions', color: 'bg-blue-600' },
  { id: '17', title: 'Partnerships for the Goals', color: 'bg-blue-800' },
];

export function SDGSelectionStep({ 
  onNext, 
  onBack, 
  initialValue = [] 
}: SDGSelectionStepProps) {
  const [selectedSDGs, setSelectedSDGs] = useState<string[]>(initialValue);

  const handleSDGToggle = (sdgId: string) => {
    const newSelected = selectedSDGs.includes(sdgId)
      ? selectedSDGs.filter(id => id !== sdgId)
      : [...selectedSDGs, sdgId];
    
    setSelectedSDGs(newSelected);
  };

  const handleNext = () => {
    if (selectedSDGs.length > 0) {
      onNext(selectedSDGs);
    }
  };

  const canProceed = selectedSDGs.length > 0;

  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <div className="w-16 h-16 c2c-purple-bg rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="text-2xl text-white">🌍</span>
        </div>
        <h2 className="heading-primary text-2xl mb-3 c2c-dark-gray">
          Which UN Sustainable Development Goals do you focus on?
        </h2>
        <p className="text-gray-600 text-lg max-w-2xl mx-auto">
          Select the SDGs that align with your organization&apos;s work and projects. 
          This helps schools understand your impact focus.
        </p>
      </div>

      <div className="mb-6">
        <p className="text-sm text-gray-600 mb-4">
          Selected: {selectedSDGs.length} {selectedSDGs.length === 1 ? 'goal' : 'goals'} 
          {selectedSDGs.length === 0 && ' (minimum 1 required)'}
        </p>
        
        {selectedSDGs.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-6">
            {selectedSDGs.map((sdgId) => {
              const sdg = sdgOptions.find(s => s.id === sdgId);
              return sdg ? (
                <Badge key={sdgId} variant="secondary" className="gap-1 py-1">
                  SDG {sdg.id}: {sdg.title}
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-auto p-0 ml-1 hover:bg-transparent"
                    onClick={() => handleSDGToggle(sdgId)}
                  >
                    <X className="w-3 h-3" />
                  </Button>
                </Badge>
              ) : null;
            })}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        {sdgOptions.map((sdg) => (
          <Card
            key={sdg.id}
            className={`p-4 cursor-pointer transition-all border-2 hover:border-purple-200 ${
              selectedSDGs.includes(sdg.id)
                ? 'border-purple-500 bg-purple-50'
                : 'border-gray-200'
            }`}
            onClick={() => handleSDGToggle(sdg.id)}
          >
            <div className="flex items-start gap-3">
              <div className={`w-4 h-4 rounded ${sdg.color} flex-shrink-0 mt-0.5`}></div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <div className="font-medium text-sm">SDG {sdg.id}</div>
                  <div
                    className={`w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                      selectedSDGs.includes(sdg.id)
                        ? 'border-purple-500 bg-purple-500'
                        : 'border-gray-300'
                    }`}
                  >
                    {selectedSDGs.includes(sdg.id) && (
                      <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
                    )}
                  </div>
                </div>
                <div className="text-sm text-gray-600 mt-1">{sdg.title}</div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <div className="flex gap-4 justify-center">
        <Button
          type="button"
          variant="outline"
          onClick={onBack}
          size="lg"
          className="px-8"
        >
          ← Go back
        </Button>
        <Button
          onClick={handleNext}
          disabled={!canProceed}
          size="lg"
          className="c2c-purple-bg hover:opacity-90 px-8"
        >
          Next →
        </Button>
      </div>

      <div className="mt-8 bg-green-50 border border-green-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <span className="text-green-600 text-lg">🎯</span>
          <div>
            <h4 className="font-medium text-green-900 mb-1">Global Impact</h4>
            <p className="text-sm text-green-800">
              Aligning with the UN SDGs helps schools understand how participating in your projects 
              contributes to global positive change and sustainable development.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}