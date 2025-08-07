'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { OnboardingLayout } from '../onboarding-layout';
import { Target, ArrowLeft, ArrowRight, X } from 'lucide-react';

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
    <OnboardingLayout
      title={contextText.title}
      subtitle={contextText.subtitle}
      currentStep={currentStep}
      totalSteps={totalSteps}
    >
      <div className="max-w-4xl mx-auto">
        <Card className={context === 'school' ? 'border-blue-200' : 'border-purple-200'}>
          <CardHeader className="text-center">
            <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${
              context === 'school' ? 'bg-blue-100' : 'bg-purple-100'
            }`}>
              <Target className={`h-8 w-8 ${context === 'school' ? 'text-blue-600' : 'text-purple-600'}`} />
            </div>
            <CardTitle className="text-2xl text-gray-900">UN Sustainable Development Goals</CardTitle>
            <CardDescription className="text-lg">
              {contextText.description}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="text-center">
                <p className="text-sm text-gray-600">
                  Selected: {selectedSDGs.length} {selectedSDGs.length === 1 ? 'goal' : 'goals'} 
                  {selectedSDGs.length === 0 && ' (minimum 1 required)'}
                </p>
              </div>

              {selectedSDGs.length > 0 && (
                <div>
                  <p className="text-sm font-medium text-gray-700 mb-3">Selected SDGs:</p>
                  <div className="flex flex-wrap gap-2">
                    {selectedSDGs.map((sdgId) => {
                      const sdg = sdgOptions.find(s => s.id === sdgId);
                      return sdg ? (
                        <Badge key={sdgId} variant="secondary" className="flex items-center gap-1 py-1">
                          SDG {sdg.id}: {sdg.title}
                          <X 
                            className="h-3 w-3 cursor-pointer hover:text-red-600" 
                            onClick={() => handleSDGToggle(sdgId)}
                          />
                        </Badge>
                      ) : null;
                    })}
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {sdgOptions.map((sdg) => (
                  <div
                    key={sdg.id}
                    className={`relative rounded-lg border cursor-pointer transition-all hover:shadow-md ${
                      selectedSDGs.includes(sdg.id)
                        ? context === 'school' ? 'border-blue-500 bg-blue-50 shadow-md' : 'border-purple-500 bg-purple-50 shadow-md'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => handleSDGToggle(sdg.id)}
                  >
                    <div className="aspect-square p-3">
                      <div className="relative w-full h-full">
                        <img 
                          src={sdg.imageUrl}
                          alt={`SDG ${sdg.id}: ${sdg.title}`}
                          className="w-full h-full object-cover rounded-md"
                          onError={(e) => {
                            // Fallback to text if image fails
                            const target = e.target as HTMLImageElement;
                            target.style.display = 'none';
                          }}
                        />
                        <div className="absolute top-2 right-2">
                          <div
                            className={`w-5 h-5 rounded-full border-2 flex items-center justify-center bg-white ${
                              selectedSDGs.includes(sdg.id)
                                ? context === 'school' ? 'border-blue-500' : 'border-purple-500'
                                : 'border-gray-300'
                            }`}
                          >
                            {selectedSDGs.includes(sdg.id) && (
                              <div className={`w-3 h-3 rounded-full ${
                                context === 'school' ? 'bg-blue-500' : 'bg-purple-500'
                              }`}></div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="px-3 pb-3">
                      <div className="text-xs font-medium text-gray-700 leading-tight">{sdg.title}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="flex gap-4 pt-6">
              <Button
                type="button"
                variant="outline"
                onClick={onBack}
                className="flex-1"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
              <Button
                onClick={handleNext}
                disabled={isLoading || selectedSDGs.length === 0}
                className={`flex-1 ${context === 'school' ? 'bg-blue-600 hover:bg-blue-700' : 'bg-purple-600 hover:bg-purple-700'}`}
              >
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                    Processing...
                  </>
                ) : (
                  <>
                    Continue ({selectedSDGs.length} selected)
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </OnboardingLayout>
  );
}