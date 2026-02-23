'use client'

import { useTranslations } from 'next-intl'
import { motion } from 'framer-motion'
import { TrendingUp, Users, School } from 'lucide-react'
import {
  AnimatedCounter,
  CHART_COLORS,
  type SchoolDetail,
} from './shared'

export interface SchoolMetricModalProps {
  schoolDetails: SchoolDetail[]
  activeStudentsBySchool: Map<string, number>
  schoolAgeRanges: Map<string, Set<string>>
  filteredTotals: { institutions: number; programs: number }
}

export function SchoolMetricModal({
  schoolDetails,
  activeStudentsBySchool,
  schoolAgeRanges,
  filteredTotals,
}: SchoolMetricModalProps) {
  const t = useTranslations('profile.analytics')

  const totalSchoolStudents = schoolDetails.reduce((sum, s) => sum + s.students, 0)
  const totalActiveStudents = schoolDetails.reduce((sum, s) => sum + (activeStudentsBySchool.get(s.name) || 0), 0)
  const uniqueCountries = new Set(schoolDetails.map(s => s.country)).size

  return (
    <div className="space-y-10">
      {/* Hero stat with animated counter */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-500 to-blue-700 p-8 text-white">
        <div className="relative z-10">
          <p className="text-sm font-medium text-blue-100">{t('partnerSchools')}</p>
          <p className="mt-2 text-5xl font-bold">
            <AnimatedCounter value={filteredTotals.institutions} />
          </p>
          <div className="mt-4 flex flex-wrap items-center gap-4 text-blue-100">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              <span className="text-sm">{totalSchoolStudents.toLocaleString()} total students</span>
            </div>
            {totalActiveStudents > 0 && (
              <div className="flex items-center gap-2 bg-white/20 rounded-full px-3 py-1">
                <Users className="h-3.5 w-3.5" />
                <span className="text-sm">{totalActiveStudents.toLocaleString()} active in projects</span>
              </div>
            )}
            <span className="text-sm">{uniqueCountries} countries</span>
          </div>
        </div>
        <div className="absolute -right-4 -top-4 h-32 w-32 rounded-full bg-white/10" />
        <div className="absolute -bottom-8 -right-8 h-40 w-40 rounded-full bg-white/5" />
      </div>

      {/* Schools list */}
      <div>
        <h4 className="mb-6 text-base font-semibold text-gray-900">{t('schoolsByReach')}</h4>
        <div className="space-y-5">
          {schoolDetails.map((school, idx) => {
            const activeStudents = activeStudentsBySchool.get(school.name) || 0
            const ageRanges = schoolAgeRanges.get(school.name)
            const ageRange = ageRanges ? Array.from(ageRanges).sort().join(', ') : null

            return (
              <motion.div
                key={school.name}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + idx * 0.05 }}
                className="group rounded-xl bg-blue-50/50 border-l-4 border-blue-500 p-6 transition-all hover:bg-blue-50/80 hover:shadow-md hover:-translate-y-0.5"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-4">
                    <div
                      className="flex h-12 w-12 items-center justify-center rounded-xl shadow-sm"
                      style={{ backgroundColor: `${CHART_COLORS.blue[idx % CHART_COLORS.blue.length]}15` }}
                    >
                      <School
                        className="h-6 w-6"
                        style={{ color: CHART_COLORS.blue[idx % CHART_COLORS.blue.length] }}
                      />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">{school.name}</p>
                      <p className="mt-1.5 text-sm text-gray-500">
                        {school.flag} {school.city}, {school.country}
                      </p>
                      <div className="mt-2 flex flex-wrap items-center gap-2">
                        {ageRange && (
                          <span className="inline-flex items-center rounded-full bg-purple-100 px-2.5 py-0.5 text-xs font-medium text-purple-700">
                            Ages {ageRange}
                          </span>
                        )}
                        <span className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-600">
                          {school.teachers} educators
                        </span>
                        {school.projectCount && school.projectCount > 0 && (
                          <span className="inline-flex items-center rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-medium text-emerald-700">
                            {school.projectCount} {school.projectCount === 1 ? 'project' : 'projects'}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-blue-500 bg-clip-text text-transparent">{school.students.toLocaleString()}</p>
                    <p className="text-sm text-gray-500">total students</p>
                    {activeStudents > 0 ? (
                      <p className="mt-1 text-sm font-medium text-emerald-600">{activeStudents} active</p>
                    ) : (
                      <p className="mt-1 text-sm text-gray-400">onboarding</p>
                    )}
                  </div>
                </div>
              </motion.div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
