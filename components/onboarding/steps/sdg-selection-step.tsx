'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Globe, ArrowLeft, ArrowRight } from 'lucide-react';

interface SDGSelectionStepProps {
  onNext: (sdgFocus: string[]) => void;
  onBack: () => void;
  currentStep: number;
  totalSteps: number;
  initialData?: { sdgFocus?: string[] };
  context?: 'partner' | 'school';
}

const sdgOptions = [
  { id: '1', title: 'No Poverty', imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/9/9d/Sustainable_Development_Goal_1.png' },
  { id: '2', title: 'Zero Hunger', imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/4/4d/Sustainable_Development_Goal_2.png' },
  { id: '3', title: 'Good Health and Well-being', imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/c/c4/Sustainable_Development_Goal_3.png' },
  { id: '4', title: 'Quality Education', imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/6/6e/Sustainable_Development_Goal_4.png' },
  { id: '5', title: 'Gender Equality', imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/b/bc/Sustainable_Development_Goal_5.png' },
  { id: '6', title: 'Clean Water and Sanitation', imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/8/87/Sustainable_Development_Goal_6.png' },
  { id: '7', title: 'Affordable and Clean Energy', imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/d/d7/Sustainable_Development_Goal_7.png' },
  { id: '8', title: 'Decent Work and Economic Growth', imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/8/8e/Sustainable_Development_Goal_8.png' },
  { id: '9', title: 'Industry, Innovation and Infrastructure', imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/c/cc/Sustainable_Development_Goal_9.png' },
  { id: '10', title: 'Reduced Inequalities', imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/d/d4/Sustainable_Development_Goal_10.png' },
  { id: '11', title: 'Sustainable Cities and Communities', imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/8/81/Sustainable_Development_Goal_11.png' },
  { id: '12', title: 'Responsible Consumption and Production', imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/d/d9/Sustainable_Development_Goal_12.png' },
  { id: '13', title: 'Climate Action', imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/7/70/Sustainable_Development_Goal_13.png' },
  { id: '14', title: 'Life Below Water', imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/6/63/Sustainable_Development_Goal_14.png' },
  { id: '15', title: 'Life on Land', imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/1/18/Sustainable_Development_Goal_15.png' },
  { id: '16', title: 'Peace, Justice and Strong Institutions', imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/6/68/Sustainable_Development_Goal_16.png' },
  { id: '17', title: 'Partnerships for the Goals', imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/2/2d/Sustainable_Development_Goal_17.png' },
];

export function SDGSelectionStep({ 
  onNext, 
  onBack,
  currentStep,
  totalSteps,
  initialData,
  context = 'partner'
}: SDGSelectionStepProps) {
  const [selectedSDGs, setSelectedSDGs] = useState<string[]>(initialData?.sdgFocus || []);
  const [isLoading, setIsLoading] = useState(false);

  const handleSDGToggle = (sdgId: string) => {
    const newSelected = selectedSDGs.includes(sdgId)
      ? selectedSDGs.filter(id => id !== sdgId)
      : [...selectedSDGs, sdgId];
    
    setSelectedSDGs(newSelected);
  };

  const handleNext = async () => {
    if (selectedSDGs.length === 0) return;
    
    setIsLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      onNext(selectedSDGs);
    } catch (error) {
      console.error('Error processing SDG selection:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getContextText = () => {
    if (context === 'school') {
      return {
        title: 'Sustainable Development Goals',
        subtitle: 'Which UN SDGs align with your educational priorities?',
        description: 'Select goals that your school would like to focus on through collaborative projects. This helps us match you with relevant opportunities and partners.'
      };
    }
    return {
      title: 'SDG Alignment',
      subtitle: 'Which UN SDGs do you focus on?',
      description: 'Select SDGs that align with your organizational mission. This helps schools understand your focus areas and creates better project matches.'
    };
  };

  const contextText = getContextText();

  return (
    <div className="space-y-6">
      {/* Icon and Title */}
      <div className="text-center">
        <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${
          context === 'school' ? 'bg-blue-100' : 'bg-[#7F56D9] bg-opacity-10'
        }`}>
          <Globe className={`h-8 w-8 ${context === 'school' ? 'text-blue-600' : 'text-[#7F56D9]'}`} />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">{contextText.title}</h2>
        <p className="text-gray-600 max-w-2xl mx-auto mb-8">{contextText.description}</p>
      </div>
      
      {/* SDG Grid */}
      <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {sdgOptions.map((sdg) => (
          <div
            key={sdg.id}
            className={`relative cursor-pointer transition-all hover:scale-105 ${
              selectedSDGs.includes(sdg.id) ? 'opacity-100' : 'opacity-70 hover:opacity-90'
            }`}
            onClick={() => handleSDGToggle(sdg.id)}
          >
            <img 
              src={sdg.imageUrl}
              alt={`SDG ${sdg.id}: ${sdg.title}`}
              className={`w-full h-full object-cover rounded-lg transition-all ${
                selectedSDGs.includes(sdg.id)
                  ? context === 'school' 
                    ? 'ring-4 ring-blue-500 shadow-lg' 
                    : 'ring-4 ring-[#7F56D9] shadow-lg'
                  : 'hover:shadow-md'
              }`}
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
              }}
            />
          </div>
        ))}
      </div>

      {/* Navigation */}
      <div className="flex justify-between pt-6">
        <Button
          variant="outline"
          onClick={onBack}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </Button>

        <Button
          onClick={handleNext}
          disabled={selectedSDGs.length === 0 || isLoading}
          className="flex items-center gap-2 bg-[#7F56D9] hover:bg-purple-700 text-white"
        >
          {isLoading ? (
            <>Loading...</>
          ) : (
            <>
              Continue ({selectedSDGs.length} selected)
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </Button>
      </div>
    </div>
  );
}