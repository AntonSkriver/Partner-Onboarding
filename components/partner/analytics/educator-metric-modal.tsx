'use client'

import { useTranslations } from 'next-intl'
import { motion } from 'framer-motion'
import { TrendingUp } from 'lucide-react'
import {
  AnimatedCounter,
  getEducatorAvatar,
  type EducatorDetail,
} from './shared'

export interface EducatorMetricModalProps {
  educatorDetails: EducatorDetail[]
  educatorsByProject: Record<string, { educators: EducatorDetail[]; status: string; description: string }>
}

export function EducatorMetricModal({
  educatorDetails,
  educatorsByProject,
}: EducatorMetricModalProps) {
  const t = useTranslations('profile.analytics')

  const uniqueSchools = new Set(educatorDetails.map(e => e.school)).size
  const uniqueCountries = new Set(educatorDetails.map(e => e.country)).size
  const activeEducators = educatorDetails.filter(e => e.project).length

  const projectColors = [
    '#10b981', '#3b82f6', '#f59e0b', '#8b5cf6', '#ef4444', '#06b6d4',
  ]

  return (
    <div className="space-y-10">
      {/* Hero stat with animated counter */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-amber-500 to-amber-700 p-8 text-white">
        <div className="relative z-10">
          <p className="text-sm font-medium text-amber-100">Engaged Educators</p>
          <p className="mt-2 text-5xl font-bold">
            <AnimatedCounter value={educatorDetails.length} />
          </p>
          <div className="mt-4 flex flex-wrap items-center gap-4 text-amber-100">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              <span className="text-sm">{activeEducators} in active projects</span>
            </div>
            <span className="text-sm">{uniqueSchools} schools · {uniqueCountries} countries</span>
          </div>
        </div>
        <div className="absolute -right-4 -top-4 h-32 w-32 rounded-full bg-white/10" />
        <div className="absolute -bottom-8 -right-8 h-40 w-40 rounded-full bg-white/5" />
      </div>

      {/* Educators grouped by project */}
      <div>
        <h4 className="mb-6 text-base font-semibold text-gray-900">{t('educatorsByProject')}</h4>
        <div className="space-y-6">
          {Object.entries(educatorsByProject).map(([project, data], idx) => {
            const color = projectColors[idx % projectColors.length]
            return (
              <motion.div
                key={project}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + idx * 0.08 }}
                className="rounded-xl border-2 overflow-hidden transition-all hover:shadow-lg"
                style={{ borderColor: `${color}40` }}
              >
                {/* Project header */}
                <div
                  className="px-6 py-4"
                  style={{ backgroundColor: `${color}10` }}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-3">
                        <h3 className="text-lg font-bold text-gray-900">{project}</h3>
                        <span
                          className="rounded-full px-2.5 py-0.5 text-xs font-medium"
                          style={{
                            backgroundColor: data.status === 'active' ? '#dcfce7' : '#f3f4f6',
                            color: data.status === 'active' ? '#166534' : '#4b5563',
                          }}
                        >
                          {data.status}
                        </span>
                      </div>
                      <p className="mt-1 text-sm text-gray-600">{data.description}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold" style={{ color }}>{data.educators.length}</p>
                      <p className="text-xs text-gray-500">educators</p>
                    </div>
                  </div>
                </div>

                {/* Educator cards */}
                <div className="p-6 bg-white">
                  <div className="flex flex-wrap gap-3">
                    {data.educators.map((educator, educatorIdx) => (
                      <motion.div
                        key={educator.name}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.3 + idx * 0.05 + educatorIdx * 0.02 }}
                        className="flex items-center gap-3 rounded-lg bg-gray-50 border px-4 py-3 shadow-sm transition-all hover:bg-white hover:shadow-md"
                        style={{ borderColor: `${color}30` }}
                      >
                        {getEducatorAvatar(educator.name) ? (
                          <img
                            src={getEducatorAvatar(educator.name)!}
                            alt={educator.name}
                            className="h-10 w-10 rounded-full object-cover shadow-sm ring-2"
                            style={{ '--tw-ring-color': `${color}40` } as React.CSSProperties}
                          />
                        ) : (
                          <div
                            className="flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold shadow-sm"
                            style={{
                              background: `linear-gradient(135deg, ${color}20, ${color}40)`,
                              color,
                            }}
                          >
                            {educator.name.split(' ').map(n => n[0]).join('')}
                          </div>
                        )}
                        <div className="flex flex-col">
                          <span className="text-sm font-semibold text-gray-800">{educator.name}</span>
                          <span className="text-xs text-gray-500">{educator.subject} · Ages {educator.ageGroup}</span>
                          <span className="text-xs text-gray-400">{educator.flag} {educator.school}</span>
                        </div>
                      </motion.div>
                    ))}
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
