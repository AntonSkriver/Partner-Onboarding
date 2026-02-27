'use client';

import { useState, useEffect, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { useSchoolForm } from '@/contexts/school-form-context';
import { Globe, Plus, X, Check, Info } from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
  SheetTrigger,
} from '@/components/ui/sheet';
import { SDG_DATA } from '@/components/sdg-icons';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { toast } from 'sonner';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useTranslations } from 'next-intl';

const MAX_SDGS = 5;
const SDG_LIST = Array.from({ length: 17 }, (_, i) => i + 1);

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

  // Parse any existing SDG data from formData (memoized to prevent infinite re-renders)
  const sdgFocusKey = JSON.stringify(formData.sdgFocus || []);
  const initialSDGs = useMemo(
    () => formData.sdgFocus?.map((s: string) => parseInt(s)) || [],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [sdgFocusKey],
  );

  // Sheet state
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [tempSelectedSDGs, setTempSelectedSDGs] = useState<number[]>([]);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

  // Sync temp state when opening sheet
  useEffect(() => {
    if (isSheetOpen) {
      setTempSelectedSDGs([...initialSDGs]);
    }
    // Only sync when sheet opens, not when initialSDGs changes mid-edit
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isSheetOpen]);

  const handleOpenChange = (open: boolean) => {
    if (open === isSheetOpen) return;

    if (!open) {
      // Check for unsaved changes when trying to close
      const hasChanges =
        tempSelectedSDGs.length !== initialSDGs.length ||
        !tempSelectedSDGs.every(id => initialSDGs.includes(id));

      if (hasChanges) {
        setShowConfirmDialog(true);
        return; // Prevent sheet from closing
      }
    }
    setIsSheetOpen(open);
  };

  const removeSDG = (sdgId: number) => {
    const updatedSDGs = initialSDGs.filter((id: number) => id !== sdgId);
    updateFormData({ sdgFocus: updatedSDGs.map(String) });
  };

  const toggleTempSDG = (sdgId: number) => {
    const isSelected = tempSelectedSDGs.includes(sdgId);

    if (isSelected) {
      setTempSelectedSDGs(prev => prev.filter(id => id !== sdgId));
    } else {
      if (tempSelectedSDGs.length >= MAX_SDGS) {
        toast.error(`Select up to ${MAX_SDGS} goals`, {
          style: {
            backgroundColor: '#fff7ed',
            borderColor: '#ffedd5',
            color: '#c2410c',
          },
        });
        return;
      }
      setTempSelectedSDGs(prev => [...prev, sdgId]);
    }
  };

  const confirmSelection = () => {
    updateFormData({ sdgFocus: tempSelectedSDGs.map(String) });
    setIsSheetOpen(false);
  };

  const discardChanges = () => {
    setShowConfirmDialog(false);
    setIsSheetOpen(false);
  };

  const handleContinue = () => {
    onNext();
  };

  const goBack = onBack || onPrevious;

  // Calculate slots
  const selectedCount = initialSDGs.length;
  const emptySlotsCount = MAX_SDGS - selectedCount;
  const emptySlots = Array.from({ length: emptySlotsCount });

  return (
    <div className="space-y-6">
      <div className="text-center">
        <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Globe className="w-8 h-8 text-purple-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">{t('sdgStepTitle')}</h2>
        <p className="text-gray-600">
          {t('sdgDescription')}
        </p>
      </div>

      <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
        <p className="text-sm text-blue-800 leading-relaxed">
          <span className="font-semibold px-2 py-0.5 bg-yellow-100/50 rounded inline-block mr-1">💡 About SDGs:</span>
          The UN Sustainable Development Goals are a global framework addressing humanity&apos;s biggest challenges.
          Connecting your project to SDGs helps students understand how their work contributes to solving
          real-world problems and builds global awareness. <a href="#" className="underline text-blue-600 font-medium">Learn more about the SDGs here</a>.
        </p>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium text-gray-700">Selected SDGs</h3>
          <span className={`text-sm font-medium ${selectedCount >= MAX_SDGS ? 'text-orange-500' : 'text-gray-500'}`}>{selectedCount}/{MAX_SDGS} {t('sdgSelected').toLowerCase()}</span>
        </div>

        <div className="space-y-3">
          {/* Selected SDG Cards */}
          {initialSDGs.map((sdgId: number) => {
            const sdgInfo = SDG_DATA[sdgId];
            return (
              <div key={sdgId} className="relative p-4 pr-12 rounded-xl border-2 bg-white shadow-sm flex items-center gap-4">
                <div className="w-12 h-12 flex-shrink-0">
                  <img
                    src={`/sdg/sdg-${sdgId}.webp`}
                    alt={`Goal ${sdgId}`}
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = `https://upload.wikimedia.org/wikipedia/commons/${[
                        '',
                        '9/9d/Sustainable_Development_Goal_1.png',
                        '4/4d/Sustainable_Development_Goal_2.png',
                        'c/c4/Sustainable_Development_Goal_3.png',
                        '6/6e/Sustainable_Development_Goal_4.png',
                        'b/bc/Sustainable_Development_Goal_5.png',
                        '8/87/Sustainable_Development_Goal_6.png',
                        'd/d7/Sustainable_Development_Goal_7.png',
                        '8/8e/Sustainable_Development_Goal_8.png',
                        'c/cc/Sustainable_Development_Goal_9.png',
                        'd/d4/Sustainable_Development_Goal_10.png',
                        '8/81/Sustainable_Development_Goal_11.png',
                        'd/d9/Sustainable_Development_Goal_12.png',
                        '7/70/Sustainable_Development_Goal_13.png',
                        '6/63/Sustainable_Development_Goal_14.png',
                        '1/18/Sustainable_Development_Goal_15.png',
                        '6/68/Sustainable_Development_Goal_16.png',
                        ''
                      ][sdgId]
                        }`;
                    }}
                    className="w-full h-full object-cover rounded shadow-sm"
                  />
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-900">Goal {sdgId}: {sdgInfo?.title}</h4>
                  <p className="text-sm text-gray-500">
                    {sdgInfo?.description}
                  </p>
                </div>
                <button
                  onClick={() => removeSDG(sdgId)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center rounded-full bg-red-50 text-red-500 hover:bg-red-100 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            );
          })}

          {/* Empty Add SDG Slots */}
          <Sheet open={isSheetOpen} onOpenChange={handleOpenChange}>
            {emptySlots.map((_, index) => (
              <SheetTrigger asChild key={`empty-${index}`}>
                <button className="w-full p-4 rounded-xl border-2 border-dashed border-violet-200 hover:border-violet-400 bg-gradient-to-br from-violet-50/40 to-indigo-50/30 flex items-center justify-center gap-2 text-violet-600 hover:text-violet-700 transition-all shadow-sm hover:shadow group h-[84px]">
                  <Plus className="w-5 h-5 group-hover:scale-110 transition-transform" />
                  <span className="font-medium">Add SDG</span>
                </button>
              </SheetTrigger>
            ))}

            <SheetContent side="right" className="w-full sm:w-[33vw] sm:min-w-[480px] p-0 flex flex-col h-full">
              <SheetHeader className="p-6 border-b relative">
                <div className="flex justify-between items-center mr-8">
                  <SheetTitle className="text-xl">Choose SDGs</SheetTitle>
                  <span className={`text-sm font-medium ${tempSelectedSDGs.length >= MAX_SDGS ? 'text-orange-500' : 'text-gray-500'}`}>{tempSelectedSDGs.length}/{MAX_SDGS} {t('sdgSelected').toLowerCase()}</span>
                </div>
              </SheetHeader>

              <div className="flex-1 overflow-y-auto p-6 space-y-3">
                {SDG_LIST.map((sdgId) => {
                  const sdgInfo = SDG_DATA[sdgId];
                  const isSelected = tempSelectedSDGs.includes(sdgId);
                  const isMaxReached = tempSelectedSDGs.length >= MAX_SDGS;

                  let cardClasses = "relative w-full p-4 rounded-xl border-2 flex items-center gap-5 transition-all text-left shadow-sm ";

                  if (isSelected) {
                    if (isMaxReached) {
                      cardClasses += "border-orange-400 bg-orange-50 ";
                    } else {
                      cardClasses += "border-violet-400 bg-gradient-to-br from-violet-50 to-indigo-50 ";
                    }
                  } else {
                    cardClasses += "border-gray-200 bg-white hover:border-violet-300 hover:shadow";
                  }

                  return (
                    <button
                      key={sdgId}
                      onClick={() => toggleTempSDG(sdgId)}
                      className={cardClasses}
                    >
                      <div className="w-14 h-14 flex-shrink-0">
                        <img
                          src={`/sdg/sdg-${sdgId}.webp`}
                          alt={`Goal ${sdgId}`}
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.src = `https://upload.wikimedia.org/wikipedia/commons/${[
                              '',
                              '9/9d/Sustainable_Development_Goal_1.png',
                              '4/4d/Sustainable_Development_Goal_2.png',
                              'c/c4/Sustainable_Development_Goal_3.png',
                              '6/6e/Sustainable_Development_Goal_4.png',
                              'b/bc/Sustainable_Development_Goal_5.png',
                              '8/87/Sustainable_Development_Goal_6.png',
                              'd/d7/Sustainable_Development_Goal_7.png',
                              '8/8e/Sustainable_Development_Goal_8.png',
                              'c/cc/Sustainable_Development_Goal_9.png',
                              'd/d4/Sustainable_Development_Goal_10.png',
                              '8/81/Sustainable_Development_Goal_11.png',
                              'd/d9/Sustainable_Development_Goal_12.png',
                              '7/70/Sustainable_Development_Goal_13.png',
                              '6/63/Sustainable_Development_Goal_14.png',
                              '1/18/Sustainable_Development_Goal_15.png',
                              '6/68/Sustainable_Development_Goal_16.png',
                              ''
                            ][sdgId]
                              }`;
                          }}
                          className="w-full h-full object-cover rounded shadow-sm"
                        />
                      </div>
                      <div className="flex-1 pr-6 flex items-center gap-2">
                        <span className="text-base font-semibold text-gray-900">Goal {sdgId}: {sdgInfo?.title}</span>
                        <TooltipProvider delayDuration={200}>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <span className="flex-shrink-0" onClick={(e) => e.stopPropagation()}>
                                <Info className="w-4 h-4 text-gray-400" />
                              </span>
                            </TooltipTrigger>
                            <TooltipContent className="max-w-[280px]">
                              <p>{sdgInfo?.description}</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>

                      {isSelected && (
                        <div className={`absolute -right-2 -top-2 w-6 h-6 rounded-full flex items-center justify-center text-white shadow-sm border-2 border-white ${isMaxReached ? 'bg-orange-500' : 'bg-green-500'}`}>
                          <Check className="w-3.5 h-3.5" />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>

              <SheetFooter className="p-6 border-t bg-gray-50 flex-row gap-3 sm:justify-end">
                <Button variant="outline" onClick={() => handleOpenChange(false)} className="bg-white">
                  Cancel
                </Button>
                <Button onClick={confirmSelection} className="bg-purple-600 hover:bg-purple-700 text-white">
                  Confirm selection
                </Button>
              </SheetFooter>
            </SheetContent>
          </Sheet>
        </div>
      </div>

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
          disabled={initialSDGs.length === 0}
          className="flex-1 py-6 text-base bg-purple-600 hover:bg-purple-700 text-white disabled:opacity-50"
          size="lg"
        >
          {t('continue')} {initialSDGs.length > 0 && `(${initialSDGs.length} ${t('sdgSelected').toLowerCase()})`}
        </Button>
      </div>

      {/* Unsaved Changes Dialog */}
      <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Leave without saving?</AlertDialogTitle>
            <AlertDialogDescription>
              You have made changes to your SDG selection. Discarding will revert to your previously saved goals.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setShowConfirmDialog(false)}>Continue Editing</AlertDialogCancel>
            <AlertDialogAction onClick={discardChanges} className="bg-red-600 hover:bg-red-700 text-white">
              Discard Changes
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
