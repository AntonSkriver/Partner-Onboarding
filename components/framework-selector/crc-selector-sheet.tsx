'use client'

import { useState, useCallback, useEffect } from 'react'
import { useTranslations } from 'next-intl'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
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
import { CRC_CATEGORIES, CRC_ARTICLES, getCrcArticle, getCrcIconPath } from '@/lib/data/crc-data'

interface CrcSelectorSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  /** Currently confirmed/saved CRC selections (article ID strings) */
  selected: string[]
  /** Called when user confirms their selections */
  onConfirm: (articles: string[]) => void
}

export function CrcSelectorSheet({
  open,
  onOpenChange,
  selected,
  onConfirm,
}: CrcSelectorSheetProps) {
  const t = useTranslations('crc')
  const tc = useTranslations('common')

  const [pending, setPending] = useState<string[]>([])
  const [activeCategory, setActiveCategory] = useState('general-principles')
  const [showUnsavedDialog, setShowUnsavedDialog] = useState(false)
  const [showWhatIsCrc, setShowWhatIsCrc] = useState(false)

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

  const handleToggle = (articleId: string) => {
    setPending((prev) =>
      prev.includes(articleId)
        ? prev.filter((id) => id !== articleId)
        : [...prev, articleId]
    )
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

  return (
    <>
      <Sheet open={open} onOpenChange={(newOpen) => {
        if (!newOpen) {
          handleClose()
        } else {
          onOpenChange(true)
        }
      }}>
        <SheetContent side="right" className="w-full sm:max-w-2xl flex flex-col">
          <SheetHeader className="px-6 pt-6 pb-0">
            <SheetTitle className="text-xl">{t('selectorTitle')}</SheetTitle>
            <SheetDescription>{t('selectorDesc')}</SheetDescription>
            <div className="flex items-center justify-between mt-2">
              <p className="text-sm font-medium text-gray-500">
                {t('articlesSelected', { count: pending.length })}
              </p>
              <button
                type="button"
                onClick={() => setShowWhatIsCrc(!showWhatIsCrc)}
                className="text-sm text-[#8157D9] hover:text-[#7048C6] flex items-center gap-1"
              >
                <HelpCircle className="w-3.5 h-3.5" />
                {t('whatIsCrc')}
              </button>
            </div>
          </SheetHeader>

          {/* What is the CRC? expandable info */}
          {showWhatIsCrc && (
            <div className="mx-6 mt-2 p-3 bg-blue-50 border border-blue-100 rounded-lg text-sm text-blue-800">
              {t('whatIsCrcDesc')}
            </div>
          )}

          {/* CRC Category Tabs + Article Grid */}
          <div className="flex-1 overflow-y-auto px-6 py-4">
            <Tabs value={activeCategory} onValueChange={setActiveCategory}>
              <TabsList className="grid grid-cols-3 w-full mb-4">
                {CRC_CATEGORIES.slice(0, 3).map((category) => (
                  <TabsTrigger key={category.id} value={category.id} className="text-xs">
                    {category.label}
                  </TabsTrigger>
                ))}
              </TabsList>
              <TabsList className="grid grid-cols-3 w-full mb-4">
                {CRC_CATEGORIES.slice(3).map((category) => (
                  <TabsTrigger key={category.id} value={category.id} className="text-xs">
                    {category.label}
                  </TabsTrigger>
                ))}
              </TabsList>

              {CRC_CATEGORIES.map((category) => (
                <TabsContent key={category.id} value={category.id} className="mt-2">
                  <p className="text-sm text-gray-600 mb-3">{category.description}</p>
                  <div className="grid grid-cols-2 gap-4">
                    {category.articles.map((articleId) => {
                      const article = getCrcArticle(articleId)
                      const isSelected = pending.includes(articleId)
                      const iconPath = getCrcIconPath(articleId)

                      return (
                        <button
                          key={articleId}
                          type="button"
                          onClick={() => handleToggle(articleId)}
                          className={`flex items-center gap-4 p-4 rounded-xl border-2 transition-all text-left ${
                            isSelected
                              ? 'border-[#8157D9] bg-purple-50 shadow-sm'
                              : 'border-gray-200 hover:border-[#8157D9]/50 hover:bg-gray-50'
                          }`}
                        >
                          <div className="relative w-16 h-16 shrink-0">
                            <Image
                              src={iconPath}
                              alt={`Article ${articleId}`}
                              width={64}
                              height={64}
                              className="object-contain rounded-lg"
                            />
                            {isSelected && (
                              <div className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-[#8157D9] flex items-center justify-center">
                                <Check className="w-3 h-3 text-white" strokeWidth={3} />
                              </div>
                            )}
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-semibold text-gray-900">Art. {articleId}</p>
                            <p className="text-xs text-gray-600 leading-snug">
                              {article?.title}
                            </p>
                          </div>
                        </button>
                      )
                    })}
                  </div>
                </TabsContent>
              ))}
            </Tabs>

            {/* Pending selections summary */}
            {pending.length > 0 && (
              <div className="mt-4 pt-4 border-t space-y-2">
                <p className="text-sm font-medium text-gray-700">
                  {t('selectedArticles', { count: pending.length })}
                </p>
                <div className="flex flex-wrap gap-2">
                  {pending.map((articleId) => {
                    const article = getCrcArticle(articleId)
                    return (
                      <Badge
                        key={articleId}
                        variant="secondary"
                        className="text-xs pl-2 pr-1 py-1 flex items-center gap-1 cursor-pointer hover:bg-red-50 hover:text-red-700 transition-colors"
                        onClick={() => handleToggle(articleId)}
                      >
                        Art. {articleId}: {article?.title}
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
