'use client'

import { useRef, useEffect } from 'react'
import { motion, useInView, useSpring, useTransform } from 'framer-motion'
import {
  Target,
  Users,
  GraduationCap,
  School,
  BookOpen,
  TrendingUp,
  ArrowLeftRight,
  Search,
  MapPin,
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

interface PartnerSchoolInfo {
  name: string
  city: string
  country: string
  flag: string
  students: number
  educators: number
}

interface ProjectDetail {
  name: string
  description?: string
  studentsReached: number
  educatorsEngaged: number
  status: 'active' | 'completed' | 'looking-for-partner'
  school1: PartnerSchoolInfo
  school2?: PartnerSchoolInfo
  ageGroup: string
  subject?: string
}

interface ProjectMetricModalProps {
  projectDetails: ProjectDetail[]
  t: (key: string) => string
}

export function ProjectMetricModal({ projectDetails, t }: ProjectMetricModalProps) {
  const activeProjectCount = projectDetails.filter((p) => p.status === 'active').length
  const lookingForPartnerCount = projectDetails.filter((p) => p.status === 'looking-for-partner').length
  const totalProjectStudents = projectDetails.reduce((sum, p) => sum + p.studentsReached, 0)

  return (
    <div className="space-y-10">
      {/* Hero stat with animated counter */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-700 p-8 text-white">
        <div className="relative z-10">
          <p className="text-sm font-medium text-emerald-100">{t('classProjects')}</p>
          <p className="mt-2 text-5xl font-bold">
            <AnimatedCounter value={activeProjectCount + lookingForPartnerCount} />
          </p>
          <div className="mt-4 flex items-center gap-4 text-emerald-100">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              <span className="text-sm">{totalProjectStudents.toLocaleString()} students</span>
            </div>
            {lookingForPartnerCount > 0 && (
              <div className="flex items-center gap-2 bg-white/20 rounded-full px-3 py-1">
                <Search className="h-3.5 w-3.5" />
                <span className="text-sm">{lookingForPartnerCount} seeking partner</span>
              </div>
            )}
          </div>
        </div>
        <div className="absolute -right-4 -top-4 h-32 w-32 rounded-full bg-white/10" />
        <div className="absolute -bottom-8 -right-8 h-40 w-40 rounded-full bg-white/5" />
      </div>

      {/* Project Cards */}
      <div>
        <h4 className="mb-6 text-base font-semibold text-gray-900">Partner Class Projects</h4>
        <div className="space-y-6">
          {projectDetails.map((project, idx) => {
            const isLookingForPartner = project.status === 'looking-for-partner'

            return (
              <motion.div
                key={project.name}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + idx * 0.08 }}
                className={`group rounded-2xl border-2 overflow-hidden transition-all hover:shadow-lg hover:-translate-y-1 ${
                  isLookingForPartner
                    ? 'border-amber-300 bg-gradient-to-br from-amber-50 to-orange-50'
                    : 'border-emerald-200 bg-gradient-to-br from-emerald-50 to-teal-50'
                }`}
              >
                {/* Project Header */}
                <div className={`px-6 py-4 ${isLookingForPartner ? 'bg-amber-100/50' : 'bg-emerald-100/50'}`}>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <h3 className="text-lg font-bold text-gray-900">{project.name}</h3>
                        <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${
                          isLookingForPartner
                            ? 'bg-amber-500 text-white'
                            : project.status === 'active'
                              ? 'bg-emerald-500 text-white'
                              : 'bg-gray-400 text-white'
                        }`}>
                          {isLookingForPartner ? (
                            <>
                              <Search className="h-3 w-3" />
                              {t('lookingForPartner')}
                            </>
                          ) : (
                            <>
                              <span className="h-1.5 w-1.5 rounded-full bg-white animate-pulse" />
                              Active
                            </>
                          )}
                        </span>
                      </div>
                      {project.description && (
                        <p className="mt-2 text-sm text-gray-600 leading-relaxed">{project.description}</p>
                      )}
                    </div>
                  </div>

                  {/* Quick Stats */}
                  <div className="flex items-center gap-6 mt-4">
                    <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg ${isLookingForPartner ? 'bg-amber-200/50' : 'bg-emerald-200/50'}`}>
                      <GraduationCap className={`h-4 w-4 ${isLookingForPartner ? 'text-amber-700' : 'text-emerald-700'}`} />
                      <span className={`text-sm font-semibold ${isLookingForPartner ? 'text-amber-800' : 'text-emerald-800'}`}>
                        {project.studentsReached} students
                      </span>
                    </div>
                    <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg ${isLookingForPartner ? 'bg-amber-200/50' : 'bg-emerald-200/50'}`}>
                      <Users className={`h-4 w-4 ${isLookingForPartner ? 'text-amber-700' : 'text-emerald-700'}`} />
                      <span className={`text-sm font-semibold ${isLookingForPartner ? 'text-amber-800' : 'text-emerald-800'}`}>
                        {project.educatorsEngaged} educators
                      </span>
                    </div>
                    <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg ${isLookingForPartner ? 'bg-amber-200/50' : 'bg-emerald-200/50'}`}>
                      <BookOpen className={`h-4 w-4 ${isLookingForPartner ? 'text-amber-700' : 'text-emerald-700'}`} />
                      <span className={`text-sm font-semibold ${isLookingForPartner ? 'text-amber-800' : 'text-emerald-800'}`}>
                        Ages {project.ageGroup}
                      </span>
                    </div>
                    {project.subject && (
                      <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg ${isLookingForPartner ? 'bg-amber-200/50' : 'bg-emerald-200/50'}`}>
                        <Target className={`h-4 w-4 ${isLookingForPartner ? 'text-amber-700' : 'text-emerald-700'}`} />
                        <span className={`text-sm font-semibold ${isLookingForPartner ? 'text-amber-800' : 'text-emerald-800'}`}>
                          {project.subject}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Partner Schools Section */}
                <div className="px-6 py-5">
                  <div className="flex items-center gap-3 mb-4">
                    <ArrowLeftRight className={`h-4 w-4 ${isLookingForPartner ? 'text-amber-500' : 'text-emerald-500'}`} />
                    <span className="text-xs font-semibold uppercase tracking-wide text-gray-500">Partner Classes</span>
                  </div>

                  <div className="flex items-stretch gap-4">
                    {/* School 1 */}
                    <div className="flex-1 bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
                      <div className="flex items-start gap-3">
                        <div className={`flex h-10 w-10 items-center justify-center rounded-lg flex-shrink-0 ${isLookingForPartner ? 'bg-amber-100' : 'bg-emerald-100'}`}>
                          <School className={`h-5 w-5 ${isLookingForPartner ? 'text-amber-600' : 'text-emerald-600'}`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-gray-900 truncate">{project.school1.name}</p>
                          <div className="flex items-center gap-1.5 mt-1 text-sm text-gray-500">
                            <span>{project.school1.flag}</span>
                            <MapPin className="h-3 w-3" />
                            <span>{project.school1.city}, {project.school1.country}</span>
                          </div>
                          <div className="flex items-center gap-4 mt-2">
                            <span className="text-xs text-gray-500">
                              <span className="font-semibold text-gray-700">{project.school1.students}</span> students
                            </span>
                            <span className="text-xs text-gray-500">
                              <span className="font-semibold text-gray-700">{project.school1.educators}</span> educators
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Connection Arrow */}
                    <div className="flex items-center justify-center">
                      <div className={`flex h-10 w-10 items-center justify-center rounded-full ${
                        isLookingForPartner ? 'bg-amber-100' : 'bg-emerald-100'
                      }`}>
                        <ArrowLeftRight className={`h-5 w-5 ${isLookingForPartner ? 'text-amber-500' : 'text-emerald-500'}`} />
                      </div>
                    </div>

                    {/* School 2 or Looking for Partner */}
                    {project.school2 ? (
                      <div className="flex-1 bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
                        <div className="flex items-start gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-100 flex-shrink-0">
                            <School className="h-5 w-5 text-emerald-600" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-gray-900 truncate">{project.school2.name}</p>
                            <div className="flex items-center gap-1.5 mt-1 text-sm text-gray-500">
                              <span>{project.school2.flag}</span>
                              <MapPin className="h-3 w-3" />
                              <span>{project.school2.city}, {project.school2.country}</span>
                            </div>
                            <div className="flex items-center gap-4 mt-2">
                              <span className="text-xs text-gray-500">
                                <span className="font-semibold text-gray-700">{project.school2.students}</span> students
                              </span>
                              <span className="text-xs text-gray-500">
                                <span className="font-semibold text-gray-700">{project.school2.educators}</span> educators
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="flex-1 bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl border-2 border-dashed border-amber-300 p-4">
                        <div className="flex items-center gap-3 h-full">
                          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-100 flex-shrink-0">
                            <Search className="h-5 w-5 text-amber-600" />
                          </div>
                          <div>
                            <p className="font-semibold text-amber-800">{t('lookingForPartner')}</p>
                            <p className="text-sm text-amber-600 mt-0.5">{t('connectSchool')}</p>
                          </div>
                        </div>
                      </div>
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
