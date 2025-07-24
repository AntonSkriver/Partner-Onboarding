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
    <div className="w-full max-w-full mx-auto">
      <div className="text-center mb-3">
        <div className="w-12 h-12 c2c-purple-bg rounded-full flex items-center justify-center mx-auto mb-2">
          <span className="text-lg text-white">🌍</span>
        </div>
        <h2 className="heading-primary text-lg mb-2 c2c-dark-gray">
          Which UN SDGs do you focus on?
        </h2>
        <p className="text-gray-600 text-sm max-w-2xl mx-auto mb-2">
          Select SDGs that align with your work. This helps schools understand your focus.
        </p>
        <p className="text-xs text-gray-600">
          Selected: {selectedSDGs.length} {selectedSDGs.length === 1 ? 'goal' : 'goals'} 
          {selectedSDGs.length === 0 && ' (minimum 1 required)'}
        </p>
      </div>

      {selectedSDGs.length > 0 && (
        <div className="mb-3">
          <div className="flex flex-wrap gap-1 mb-3">
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
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 mb-2">
        {sdgOptions.map((sdg) => (
          <Card
            key={sdg.id}
            className={`p-2 cursor-pointer transition-all border hover:border-purple-200 ${
              selectedSDGs.includes(sdg.id)
                ? 'border-purple-500 bg-purple-50'
                : 'border-gray-200'
            }`}
            onClick={() => handleSDGToggle(sdg.id)}
          >
            <div className="flex items-start gap-2">
              <div className={`w-3 h-3 rounded ${sdg.color} flex-shrink-0 mt-0.5`}></div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <div className="font-medium text-xs">SDG {sdg.id}</div>
                  <div
                    className={`w-3 h-3 rounded-full border flex items-center justify-center flex-shrink-0 ${
                      selectedSDGs.includes(sdg.id)
                        ? 'border-purple-500 bg-purple-500'
                        : 'border-gray-300'
                    }`}
                  >
                    {selectedSDGs.includes(sdg.id) && (
                      <div className="w-1 h-1 bg-white rounded-full"></div>
                    )}
                  </div>
                </div>
                <div className="text-xs text-gray-600 mt-0.5 leading-tight">{sdg.title}</div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <div className="flex gap-4 justify-center mt-2 pt-2 border-t border-gray-200">
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
    </div>
  );
}