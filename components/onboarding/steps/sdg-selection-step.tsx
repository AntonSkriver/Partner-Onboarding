'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Check } from 'lucide-react';
import { useSchoolForm } from '@/contexts/school-form-context';
import { SDGIcon } from '@/components/sdg-icons';
import { useTranslations } from 'next-intl';

const sdgOptions = [
  { id: 1, title: 'No Poverty' },
  { id: 2, title: 'Zero Hunger' },
  { id: 3, title: 'Good Health and Well-being' },
  { id: 4, title: 'Quality Education' },
  { id: 5, title: 'Gender Equality' },
  { id: 6, title: 'Clean Water and Sanitation' },
  { id: 7, title: 'Affordable and Clean Energy' },
  { id: 8, title: 'Decent Work and Economic Growth' },
  { id: 9, title: 'Industry, Innovation and Infrastructure' },
  { id: 10, title: 'Reduced Inequalities' },
  { id: 11, title: 'Sustainable Cities and Communities' },
  { id: 12, title: 'Responsible Consumption and Production' },
  { id: 13, title: 'Climate Action' },
  { id: 14, title: 'Life Below Water' },
  { id: 15, title: 'Life on Land' },
  { id: 16, title: 'Peace, Justice and Strong Institutions' },
  { id: 17, title: 'Partnerships for the Goals' },
];

interface SDGSelectionStepProps {
  onNext: () => void;
  onPrevious: () => void;
  // Legacy props for backwards compatibility
  onBack?: () => void;
  currentStep?: number;
  totalSteps?: number;
  initialData?: { sdgFocus?: string[] };
  context?: 'partner' | 'school';
}

export function SDGSelectionStep({
  onNext,
  onPrevious,
  onBack,
}: SDGSelectionStepProps) {
  const { formData, updateFormData } = useSchoolForm();
  const t = useTranslations('schoolOnboarding');
  const [selectedSDGs, setSelectedSDGs] = useState<number[]>(
    // Parse any existing SDG data from formData
    formData.sdgFocus?.map((s: string) => parseInt(s)) || []
  );

  const handleSDGToggle = (sdgId: number) => {
    const newSelected = selectedSDGs.includes(sdgId)
      ? selectedSDGs.filter(id => id !== sdgId)
      : [...selectedSDGs, sdgId];

    setSelectedSDGs(newSelected);
  };

  const handleContinue = () => {
    // Save SDGs to context as string array for compatibility
    updateFormData({ sdgFocus: selectedSDGs.map(String) });
    onNext();
  };

  const goBack = onBack || onPrevious;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <p className="text-sm font-medium text-purple-600 mb-1">{t('sdgStepLabel')}</p>
        <h1 className="text-2xl font-bold text-gray-900">{t('sdgStepTitle')}</h1>
        <p className="mt-1 text-sm text-gray-500">{t('sdgStepSubtitle')}</p>
      </div>

      <p className="text-sm text-gray-600">{t('sdgDescription')}</p>

      {/* SDG Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium text-gray-700">
            {t('sdgStepTitle')}
          </p>
          {selectedSDGs.length > 0 && (
            <span className="text-sm text-purple-600 font-medium">
              {selectedSDGs.length} {t('sdgSelected')}
            </span>
          )}
        </div>

        <div className="grid grid-cols-4 md:grid-cols-6 gap-2">
          {sdgOptions.map((sdg) => {
            const isSelected = selectedSDGs.includes(sdg.id);
            return (
              <button
                key={sdg.id}
                type="button"
                onClick={() => handleSDGToggle(sdg.id)}
                className={`
                  relative group aspect-square rounded-xl overflow-hidden transition-all duration-300
                  ${isSelected
                    ? 'ring-3 ring-purple-600 ring-offset-2 scale-105 shadow-lg'
                    : 'opacity-70 hover:opacity-100 hover:scale-102'
                  }
                `}
              >
                <SDGIcon
                  number={sdg.id}
                  size="lg"
                  showTitle={false}
                  className="w-full h-full object-cover"
                />

                {isSelected && (
                  <div className="absolute inset-0 bg-purple-600/20 flex items-center justify-center">
                    <div className="w-6 h-6 rounded-full bg-purple-600 flex items-center justify-center">
                      <Check className="w-4 h-4 text-white" strokeWidth={3} />
                    </div>
                  </div>
                )}

                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
              </button>
            );
          })}
        </div>
      </div>

      {/* Selected summary */}
      {selectedSDGs.length > 0 && (
        <div className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-2xl p-5 border border-emerald-100/50">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center shrink-0">
              <Check className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="flex-1">
              <p className="font-medium text-emerald-900 mb-2">
                {selectedSDGs.length} {t('sdgSelected')}
              </p>
              <div className="flex flex-wrap gap-2">
                {selectedSDGs.map(id => {
                  const sdg = sdgOptions.find(s => s.id === id);
                  return sdg ? (
                    <span
                      key={id}
                      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white text-sm text-gray-700 border border-emerald-200"
                    >
                      <span className="font-semibold text-emerald-600">#{id}</span>
                      <span className="text-gray-500">{sdg.title}</span>
                    </span>
                  ) : null;
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Navigation */}
      <div className="flex gap-4 pt-4">
        <Button
          variant="outline"
          onClick={goBack}
          className="flex-1 py-6 text-base border-gray-200 hover:bg-gray-50"
          size="lg"
        >
          {t('back')}
        </Button>
        <Button
          onClick={handleContinue}
          disabled={selectedSDGs.length === 0}
          className="flex-1 py-6 text-base bg-purple-600 hover:bg-purple-700 text-white disabled:opacity-50"
          size="lg"
        >
          {t('continue')} ({selectedSDGs.length} {t('sdgSelected')})
        </Button>
      </div>
    </div>
  );
}
