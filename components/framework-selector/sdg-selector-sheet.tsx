'use client'

import { useState, useCallback, useEffect } from 'react'
import { useTranslations } from 'next-intl'
import { SDGIcon, SDG_DATA } from '@/components/sdg-icons'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from '@/components/ui/sheet'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Check, HelpCircle, X } from 'lucide-react'

const SDG_IDS = Array.from({ length: 17 }, (_, i) => i + 1)
const DEFAULT_MAX = 5

interface SdgSelectorSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  /** Currently confirmed/saved SDG selections (number IDs) */
  selected: number[]
  /** Called when user confirms their selections */
  onConfirm: (sdgs: number[]) => void
  /** Max number of SDGs that can be selected. Defaults to 5. Set 0 for unlimited. */
  max?: number
}

export function SdgSelectorSheet({
  open,
  onOpenChange,
  selected,
  onConfirm,
  max = DEFAULT_MAX,
}: SdgSelectorSheetProps) {
  const t = useTranslations('sdg')
  const tc = useTranslations('common')

  // Pending (staged) selections — starts as copy of confirmed
  const [pending, setPending] = useState<number[]>([])
  const [showUnsavedDialog, setShowUnsavedDialog] = useState(false)
  const [showWhatIsSdg, setShowWhatIsSdg] = useState(false)

  // Sync pending with confirmed selections when sheet opens
  useEffect(() => {
    if (open) {
      setPending([...selected])
    }
  }, [open, selected])

  const hasChanges = useCallback(() => {
    if (pending.length !== selected.length) return true
    const sortedPending = [...pending].sort()
    const sortedSelected = [...selected].sort()
    return sortedPending.some((v, i) => v !== sortedSelected[i])
  }, [pending, selected])

  const handleToggle = (sdgId: number) => {
    setPending((prev) => {
      if (prev.includes(sdgId)) {
        return prev.filter((id) => id !== sdgId)
      }
      if (max > 0 && prev.length >= max) {
        return prev
      }
      return [...prev, sdgId]
    })
  }

  const handleConfirm = () => {
    onConfirm(pending)
    onOpenChange(false)
  }

  const handleClose = () => {
    if (hasChanges()) {
      setShowUnsavedDialog(true)
    } else {
      onOpenChange(false)
    }
  }

  const handleDiscard = () => {
    setShowUnsavedDialog(false)
    setPending([...selected])
    onOpenChange(false)
  }

  const handleKeepEditing = () => {
    setShowUnsavedDialog(false)
  }

  const atMax = max > 0 && pending.length >= max

  return (
    <>
      <Sheet open={open} onOpenChange={(newOpen) => {
        if (!newOpen) {
          handleClose()
        } else {
          onOpenChange(true)
        }
      }}>
        <SheetContent side="right" className="w-full sm:max-w-lg flex flex-col">
          <SheetHeader className="px-6 pt-6 pb-0">
            <SheetTitle className="text-xl">{t('selectorTitle')}</SheetTitle>
            <SheetDescription>{t('selectorDesc')}</SheetDescription>
            {max > 0 && (
              <div className="flex items-center justify-between mt-2">
                <p className={`text-sm font-medium ${atMax ? 'text-amber-600' : 'text-gray-500'}`}>
                  {t('goalsSelected', { count: pending.length, max })}
                </p>
                <button
                  type="button"
                  onClick={() => setShowWhatIsSdg(!showWhatIsSdg)}
                  className="text-sm text-[#8157D9] hover:text-[#7048C6] flex items-center gap-1"
                >
                  <HelpCircle className="w-3.5 h-3.5" />
                  {t('whatIsSdg')}
                </button>
              </div>
            )}
          </SheetHeader>

          {/* What is an SDG? expandable info */}
          {showWhatIsSdg && (
            <div className="mx-6 mt-2 p-3 bg-blue-50 border border-blue-100 rounded-lg text-sm text-blue-800">
              {t('whatIsSdgDesc')}
            </div>
          )}

          {/* SDG Grid */}
          <div className="flex-1 overflow-y-auto px-6 py-4">
            <div className="grid grid-cols-3 gap-3">
              {SDG_IDS.map((sdgId) => {
                const isSelected = pending.includes(sdgId)
                const sdgData = SDG_DATA[sdgId]
                const isDisabled = !isSelected && atMax

                return (
                  <button
                    key={sdgId}
                    type="button"
                    onClick={() => handleToggle(sdgId)}
                    disabled={isDisabled}
                    className={`
                      relative group rounded-xl overflow-hidden transition-all duration-200
                      ${isSelected
                        ? 'ring-3 ring-[#8157D9] ring-offset-2 scale-[1.02] shadow-lg'
                        : isDisabled
                          ? 'opacity-40 cursor-not-allowed'
                          : 'opacity-75 hover:opacity-100 hover:scale-[1.02] hover:shadow-md'
                      }
                    `}
                  >
                    <SDGIcon
                      number={sdgId}
                      size="lg"
                      showTitle={false}
                      className="w-full h-full object-cover"
                    />
                    {isSelected && (
                      <div className="absolute inset-0 bg-[#8157D9]/20 flex items-center justify-center">
                        <div className="w-7 h-7 rounded-full bg-[#8157D9] flex items-center justify-center shadow-md">
                          <Check className="w-4 h-4 text-white" strokeWidth={3} />
                        </div>
                      </div>
                    )}
                    <p className="text-[10px] text-gray-600 text-center mt-1 leading-tight px-1 truncate">
                      {sdgData?.title}
                    </p>
                  </button>
                )
              })}
            </div>

            {/* Max limit warning */}
            {atMax && (
              <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg text-sm text-amber-700">
                {t('maxReached', { max })}
              </div>
            )}

            {/* Pending selections summary */}
            {pending.length > 0 && (
              <div className="mt-4 space-y-2">
                <p className="text-sm font-medium text-gray-700">
                  {t('selectedSdgs', { count: pending.length })}
                </p>
                <div className="flex flex-wrap gap-2">
                  {pending.map((sdgId) => {
                    const sdgData = SDG_DATA[sdgId]
                    return (
                      <Badge
                        key={sdgId}
                        variant="secondary"
                        className="text-xs pl-2 pr-1 py-1 flex items-center gap-1 cursor-pointer hover:bg-red-50 hover:text-red-700 transition-colors"
                        onClick={() => handleToggle(sdgId)}
                      >
                        SDG {sdgId}: {sdgData?.title}
                        <X className="w-3 h-3 ml-0.5" />
                      </Badge>
                    )
                  })}
                </div>
              </div>
            )}
          </div>

          <SheetFooter className="px-6 pb-6 pt-4 border-t flex gap-3">
            <Button
              variant="outline"
              onClick={handleClose}
              className="flex-1"
            >
              {tc('cancel')}
            </Button>
            <Button
              onClick={handleConfirm}
              className="flex-1 bg-[#8157D9] hover:bg-[#7048C6] text-white"
              disabled={pending.length === 0}
            >
              {t('confirmSelection')} ({pending.length})
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>

      {/* Unsaved changes dialog */}
      <AlertDialog open={showUnsavedDialog} onOpenChange={setShowUnsavedDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('unsavedTitle')}</AlertDialogTitle>
            <AlertDialogDescription>{t('unsavedDesc')}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleKeepEditing}>
              {t('keepEditing')}
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleDiscard} className="bg-red-600 hover:bg-red-700">
              {t('discard')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
