'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import Image from 'next/image'
import { Plus } from 'lucide-react'
import { CrcSelectorSheet } from './crc-selector-sheet'
import { getCrcArticle, getCrcIconPath } from '@/lib/data/crc-data'

interface CrcDisplayProps {
  /** Currently selected CRC article IDs (string) */
  selected: string[]
  /** Called when selections are confirmed from the sheet */
  onChange: (articles: string[]) => void
  /** Show the dashed add button. Defaults to true. */
  showAddButton?: boolean
  /** Make it read-only (no add button, no sheet). */
  readOnly?: boolean
  /** Optional label override. */
  label?: string
}

export function CrcDisplay({
  selected,
  onChange,
  showAddButton = true,
  readOnly = false,
  label,
}: CrcDisplayProps) {
  const t = useTranslations('crc')
  const [sheetOpen, setSheetOpen] = useState(false)

  return (
    <div className="space-y-3">
      {label && (
        <p className="text-sm font-medium text-gray-700">{label}</p>
      )}

      {/* Selected CRC articles grid + Add button */}
      <div className="flex flex-wrap gap-3 items-center">
        {selected.map((articleId) => {
          const article = getCrcArticle(articleId)
          const iconPath = getCrcIconPath(articleId)
          return (
            <div key={articleId} className="flex flex-col items-center group" title={article?.title}>
              <div className="relative w-14 h-14 rounded-xl overflow-hidden shadow-sm ring-2 ring-[#8157D9]/20">
                <Image
                  src={iconPath}
                  alt={`Article ${articleId}: ${article?.title || ''}`}
                  width={56}
                  height={56}
                  className="object-contain"
                />
              </div>
              <p className="text-[10px] text-gray-500 text-center mt-1 leading-tight max-w-14 truncate">
                Art. {articleId}
              </p>
            </div>
          )
        })}

        {/* Dashed add button */}
        {showAddButton && !readOnly && (
          <button
            type="button"
            onClick={() => setSheetOpen(true)}
            className="w-14 h-14 rounded-xl border-2 border-dashed border-gray-300 hover:border-[#8157D9] hover:bg-[#8157D9]/5 flex flex-col items-center justify-center transition-colors group"
          >
            <Plus className="w-5 h-5 text-gray-400 group-hover:text-[#8157D9] transition-colors" />
            <span className="text-[9px] text-gray-400 group-hover:text-[#8157D9] mt-0.5 transition-colors">
              {t('addCrc')}
            </span>
          </button>
        )}
      </div>

      {/* Empty state */}
      {selected.length === 0 && !showAddButton && (
        <p className="text-sm text-gray-400 italic">{t('noCrcsSelected')}</p>
      )}

      {/* Sheet */}
      {!readOnly && (
        <CrcSelectorSheet
          open={sheetOpen}
          onOpenChange={setSheetOpen}
          selected={selected}
          onConfirm={onChange}
        />
      )}
    </div>
  )
}
