'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { SDGIcon, SDG_DATA } from '@/components/sdg-icons'
import { Plus } from 'lucide-react'
import { SdgSelectorSheet } from './sdg-selector-sheet'

interface SdgDisplayProps {
  /** Currently selected SDG IDs (numbers 1-17) */
  selected: number[]
  /** Called when selections are confirmed from the sheet */
  onChange: (sdgs: number[]) => void
  /** Max selections. Defaults to 5. 0 = unlimited. */
  max?: number
  /** Show the dashed add button. Defaults to true. */
  showAddButton?: boolean
  /** Make it read-only (no add button, no sheet). */
  readOnly?: boolean
  /** Optional label override. */
  label?: string
}

export function SdgDisplay({
  selected,
  onChange,
  max = 5,
  showAddButton = true,
  readOnly = false,
  label,
}: SdgDisplayProps) {
  const t = useTranslations('sdg')
  const [sheetOpen, setSheetOpen] = useState(false)

  return (
    <div className="space-y-3">
      {label && (
        <p className="text-sm font-medium text-gray-700">{label}</p>
      )}

      {/* Selected SDGs grid + Add button */}
      <div className="flex flex-wrap gap-3 items-center">
        {selected.map((sdgId) => {
          const sdgData = SDG_DATA[sdgId]
          return (
            <div key={sdgId} className="relative flex flex-col items-center group">
              <div className="relative rounded-xl overflow-hidden shadow-sm ring-2 ring-[#8157D9]/20">
                <SDGIcon
                  number={sdgId}
                  size="md"
                  showTitle={false}
                  className="w-14 h-14 object-cover"
                />
              </div>
              <span className="pointer-events-none absolute -bottom-1 left-1/2 -translate-x-1/2 translate-y-full rounded-md bg-gray-900 px-2 py-1 text-[10px] leading-tight text-white whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity z-10">
                {sdgData?.title}
              </span>
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
              {t('addSdg')}
            </span>
          </button>
        )}
      </div>

      {/* Empty state */}
      {selected.length === 0 && !showAddButton && (
        <p className="text-sm text-gray-400 italic">{t('noSdgsSelected')}</p>
      )}

      {/* Sheet */}
      {!readOnly && (
        <SdgSelectorSheet
          open={sheetOpen}
          onOpenChange={setSheetOpen}
          selected={selected}
          onConfirm={onChange}
          max={max}
        />
      )}
    </div>
  )
}
