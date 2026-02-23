'use client'

import { useTranslations } from 'next-intl'
import { motion } from 'framer-motion'
import { TrendingUp, BookOpen } from 'lucide-react'
import Image from 'next/image'
import { SDGIcon } from '@/components/sdg-icons'
import type { ProgramSummary } from '@/lib/programs/selectors'
import {
  AnimatedCounter,
  CHART_COLORS,
  CRC_TITLES,
  type CountryImpactEntry,
  type StudentBreakdownEntry,
} from './shared'

export interface ProgramMetricModalProps {
  programSummaries: ProgramSummary[]
  studentBreakdown: StudentBreakdownEntry[]
  countryImpact: CountryImpactEntry[]
}

export function ProgramMetricModal({
  programSummaries,
  studentBreakdown,
  countryImpact,
}: ProgramMetricModalProps) {
  const t = useTranslations('profile.analytics')
  const tPrograms = useTranslations('programs')

  const totalStudents = studentBreakdown.reduce((sum, p) => sum + p.students, 0)
  const totalSchools = studentBreakdown.reduce((sum, p) => sum + p.schools, 0)

  // Collect all SDGs from programs
  const allSdgs = new Set<number>()
  programSummaries.forEach(s => {
    (s.program.sdgFocus || []).forEach((sdg: number | string) => allSdgs.add(typeof sdg === 'number' ? sdg : parseInt(sdg)))
  })

  // Collect all CRC articles from programs
  const allCrcArticles = new Set<number>()
  programSummaries.forEach(s => {
    (s.program.crcFocus || []).forEach((article: string) => allCrcArticles.add(parseInt(article)))
  })

  return (
    <div className="space-y-10">
      {/* Hero stat with animated counter */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-500 to-indigo-700 p-8 text-white">
        <div className="relative z-10">
          <p className="text-sm font-medium text-indigo-100">{t('activePrograms')}</p>
          <p className="mt-2 text-5xl font-bold">
            <AnimatedCounter value={programSummaries.length} />
          </p>
          <div className="mt-4 flex items-center gap-2 text-indigo-100">
            <TrendingUp className="h-4 w-4" />
            <span className="text-sm">{totalStudents.toLocaleString()} students · {totalSchools} schools · {countryImpact.length} countries</span>
          </div>
        </div>
        <div className="absolute -right-4 -top-4 h-32 w-32 rounded-full bg-white/10" />
        <div className="absolute -bottom-8 -right-8 h-40 w-40 rounded-full bg-white/5" />
      </div>

      {/* Programs List */}
      <div>
        <h4 className="mb-6 text-base font-semibold text-gray-900">{tPrograms('programOverview')}</h4>
        <div className="space-y-5">
          {studentBreakdown.map((program, idx) => {
            const percent = totalStudents > 0 ? Math.round((program.students / totalStudents) * 100) : 0
            return (
              <motion.div
                key={program.program}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + idx * 0.05 }}
                className="group rounded-xl bg-indigo-50/50 border-l-4 border-indigo-500 p-6 transition-all hover:bg-indigo-50/80 hover:shadow-md hover:-translate-y-0.5"
              >
                <div className="mb-5 flex items-start justify-between">
                  <div className="flex items-center gap-4">
                    <div
                      className="flex h-12 w-12 items-center justify-center rounded-xl shadow-sm"
                      style={{ backgroundColor: `${CHART_COLORS.purple[idx % CHART_COLORS.purple.length]}15` }}
                    >
                      <BookOpen
                        className="h-6 w-6"
                        style={{ color: CHART_COLORS.purple[idx % CHART_COLORS.purple.length] }}
                      />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">{program.program}</p>
                      <p className="mt-1.5 text-sm text-gray-500">
                        {program.schools} schools · {program.countries} {program.countries === 1 ? 'country' : 'countries'}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-indigo-500 bg-clip-text text-transparent">{program.students.toLocaleString()}</p>
                    <p className="mt-1 text-sm text-gray-500">students</p>
                  </div>
                </div>
                <div className="h-2 rounded-full bg-indigo-100 overflow-hidden">
                  <motion.div
                    className="h-2 rounded-full bg-gradient-to-r from-indigo-600 to-indigo-400"
                    initial={{ width: 0 }}
                    animate={{ width: `${percent}%` }}
                    transition={{ duration: 0.8, delay: 0.4 + idx * 0.1, ease: "easeOut" }}
                  />
                </div>
              </motion.div>
            )
          })}
        </div>
      </div>

      {/* SDG Focus Areas */}
      {allSdgs.size > 0 && (
        <div className="rounded-xl border border-gray-100 bg-gray-50/30 p-6">
          <h4 className="mb-6 text-base font-semibold text-gray-900">{t('sdgFocusAreas')}</h4>
          <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 md:grid-cols-5">
            {Array.from(allSdgs).sort((a, b) => a - b).map((sdg) => (
              <SDGIcon
                key={sdg}
                number={sdg}
                size="lg"
                showTitle={true}
              />
            ))}
          </div>
        </div>
      )}

      {/* CRC Focus Areas */}
      {allCrcArticles.size > 0 && (
        <div className="rounded-xl border border-gray-100 bg-gray-50/30 p-6">
          <h4 className="mb-6 text-base font-semibold text-gray-900">{t('crcFocusAreas')}</h4>
          <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 md:grid-cols-4">
            {Array.from(allCrcArticles).sort((a, b) => a - b).map((article) => {
              const paddedNum = article.toString().padStart(2, '0')
              const imageUrl = `/crc/icons/article-${paddedNum}.png`
              const articleTitle = CRC_TITLES[article.toString()] ?? `Article ${article}`

              return (
                <div key={article} className="flex flex-col items-center gap-2 text-center">
                  <div className="relative w-20 h-20">
                    <Image
                      src={imageUrl}
                      alt={`CRC Article ${article}: ${articleTitle}`}
                      fill
                      sizes="80px"
                      className="rounded object-contain"
                    />
                  </div>
                  <div className="max-w-[100px]">
                    <p className="text-sm font-medium text-gray-900 leading-tight">
                      Article {article}
                    </p>
                    <p className="text-xs text-gray-600 leading-tight mt-0.5">
                      {articleTitle}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
