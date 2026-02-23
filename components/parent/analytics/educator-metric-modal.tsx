'use client'

import React, { useRef, useEffect } from 'react'
import { motion, useInView, useSpring, useTransform } from 'framer-motion'
import {
  TrendingUp,
} from 'lucide-react'

// Animated counter component for engaging number displays
function AnimatedCounter({ value, duration = 1.5, className = '' }: { value: number; duration?: number; className?: string }) {
  const ref = useRef<HTMLSpanElement>(null)
  const isInView = useInView(ref, { once: true })
  const spring = useSpring(0, { duration: duration * 1000 })
  const display = useTransform(spring, (current) => Math.round(current).toLocaleString())

  useEffect(() => {
    if (isInView) {
      spring.set(value)
    }
  }, [isInView, spring, value])

  return <motion.span ref={ref} className={className}>{display}</motion.span>
}

// Educator avatar mapping
const EDUCATOR_AVATARS: Record<string, string> = {
  'Anne Holm': '/images/avatars/anne-holm.png',
  'Jonas Madsen': '/images/avatars/jonas-final.jpg',
  'Sofie Larsen': '/images/avatars/sofie-larsen.png',
  'Peter Andersen': '/images/avatars/peter-andersen.png',
  'Karin Albrectsen': '/images/avatars/karin-new.jpg',
  'Ulla Jensen': '/images/avatars/ulla-new.jpg',
}

function getEducatorAvatar(name: string): string | null {
  return EDUCATOR_AVATARS[name] || null
}

interface EducatorDetail {
  name: string
  subject: string
  school: string
  country: string
  flag: string
  projectCount: number
  ageGroup: string
  project: string | null
}

interface EducatorMetricModalProps {
  educatorDetails: EducatorDetail[]
  t: (key: string) => string
}

export function EducatorMetricModal({ educatorDetails, t }: EducatorMetricModalProps) {
  const uniqueSchools = new Set(educatorDetails.map(e => e.school)).size
  const uniqueCountries = new Set(educatorDetails.map(e => e.country)).size
  const activeEducators = educatorDetails.filter(e => e.project).length

  // Group educators by project
  const educatorsByProject = educatorDetails.reduce((acc, educator) => {
    const projectKey = educator.project || 'Onboarding'
    if (!acc[projectKey]) {
      acc[projectKey] = []
    }
    acc[projectKey].push(educator)
    return acc
  }, {} as Record<string, typeof educatorDetails>)

  // Project colors and status
  const projectInfo: Record<string, { color: string; status: string; description: string }> = {
    'Diritti in Gioco': { color: '#10b981', status: 'active', description: 'Palermo + Napoli collaboration' },
    'Escuelas por los Derechos': { color: '#3b82f6', status: 'active', description: 'Milan + Monterrey exchange' },
    'Rights in Action Exchange': { color: '#f59e0b', status: 'seeking partner', description: 'Punto Luce Roma seeking cross-country partner' },
    'Onboarding': { color: '#9ca3af', status: 'onboarding', description: 'Preparing for project participation' },
  }

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
          {Object.entries(educatorsByProject).map(([project, educators], idx) => {
            const info = projectInfo[project] || { color: '#9ca3af', status: 'unknown', description: '' }
            return (
              <motion.div
                key={project}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + idx * 0.08 }}
                className="rounded-xl border-2 overflow-hidden transition-all hover:shadow-lg"
                style={{ borderColor: `${info.color}40` }}
              >
                {/* Project header */}
                <div
                  className="px-6 py-4"
                  style={{ backgroundColor: `${info.color}10` }}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-3">
                        <h3 className="text-lg font-bold text-gray-900">{project}</h3>
                        <span
                          className="rounded-full px-2.5 py-0.5 text-xs font-medium"
                          style={{
                            backgroundColor: info.status === 'active' ? '#dcfce7' : info.status === 'seeking partner' ? '#fef3c7' : '#f3f4f6',
                            color: info.status === 'active' ? '#166534' : info.status === 'seeking partner' ? '#92400e' : '#4b5563',
                          }}
                        >
                          {info.status}
                        </span>
                      </div>
                      <p className="mt-1 text-sm text-gray-600">{info.description}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold" style={{ color: info.color }}>{educators.length}</p>
                      <p className="text-xs text-gray-500">educators</p>
                    </div>
                  </div>
                </div>

                {/* Educator cards */}
                <div className="p-6 bg-white">
                  <div className="flex flex-wrap gap-3">
                    {educators.map((educator, educatorIdx) => (
                      <motion.div
                        key={educator.name}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.3 + idx * 0.05 + educatorIdx * 0.02 }}
                        className="flex items-center gap-3 rounded-lg bg-gray-50 border px-4 py-3 shadow-sm transition-all hover:bg-white hover:shadow-md"
                        style={{ borderColor: `${info.color}30` }}
                      >
                        {getEducatorAvatar(educator.name) ? (
                          <img
                            src={getEducatorAvatar(educator.name)!}
                            alt={educator.name}
                            className="h-10 w-10 rounded-full object-cover shadow-sm ring-2"
                            style={{ '--tw-ring-color': `${info.color}40` } as React.CSSProperties}
                          />
                        ) : (
                          <div
                            className="flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold shadow-sm"
                            style={{
                              background: `linear-gradient(135deg, ${info.color}20, ${info.color}40)`,
                              color: info.color,
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
