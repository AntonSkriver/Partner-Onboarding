'use client'

import { useTranslations } from 'next-intl'
import { motion } from 'framer-motion'
import {
  Target,
  Users,
  GraduationCap,
  School,
  BookOpen,
  TrendingUp,
  MapPin,
} from 'lucide-react'
import {
  AnimatedCounter,
  type ProjectDetail,
} from './shared'

export interface ProjectMetricModalProps {
  projectDetails: ProjectDetail[]
}

export function ProjectMetricModal({
  projectDetails,
}: ProjectMetricModalProps) {
  const t = useTranslations('profile.analytics')

  const activeProjectCount = projectDetails.filter(p => p.status === 'active').length
  const completedProjectCount = projectDetails.filter(p => p.status === 'completed').length
  const totalProjectStudents = projectDetails.reduce((sum, p) => sum + p.studentsReached, 0)

  return (
    <div className="space-y-10">
      {/* Hero stat with animated counter */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-700 p-8 text-white">
        <div className="relative z-10">
          <p className="text-sm font-medium text-emerald-100">{t('classProjects')}</p>
          <p className="mt-2 text-5xl font-bold">
            <AnimatedCounter value={activeProjectCount + completedProjectCount} />
          </p>
          <div className="mt-4 flex items-center gap-4 text-emerald-100">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              <span className="text-sm">{totalProjectStudents.toLocaleString()} students</span>
            </div>
            {completedProjectCount > 0 && (
              <div className="flex items-center gap-2 bg-white/20 rounded-full px-3 py-1">
                <Target className="h-3.5 w-3.5" />
                <span className="text-sm">{completedProjectCount} completed</span>
              </div>
            )}
          </div>
        </div>
        <div className="absolute -right-4 -top-4 h-32 w-32 rounded-full bg-white/10" />
        <div className="absolute -bottom-8 -right-8 h-40 w-40 rounded-full bg-white/5" />
      </div>

      {/* Project Cards */}
      <div>
        <h4 className="mb-6 text-base font-semibold text-gray-900">{t('projectsByImpact')}</h4>
        <div className="space-y-6">
          {projectDetails.map((project, idx) => {
            const isCompleted = project.status === 'completed'

            return (
              <motion.div
                key={project.name}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + idx * 0.08 }}
                className={`group rounded-2xl border-2 overflow-hidden transition-all hover:shadow-lg hover:-translate-y-1 ${
                  isCompleted
                    ? 'border-gray-200 bg-gradient-to-br from-gray-50 to-slate-50'
                    : 'border-emerald-200 bg-gradient-to-br from-emerald-50 to-teal-50'
                }`}
              >
                {/* Project Header */}
                <div className={`px-6 py-4 ${isCompleted ? 'bg-gray-100/50' : 'bg-emerald-100/50'}`}>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <h3 className="text-lg font-bold text-gray-900">{project.name}</h3>
                        <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${
                          isCompleted
                            ? 'bg-gray-400 text-white'
                            : 'bg-emerald-500 text-white'
                        }`}>
                          {isCompleted ? (
                            'Completed'
                          ) : (
                            <>
                              <span className="h-1.5 w-1.5 rounded-full bg-white animate-pulse" />
                              Active
                            </>
                          )}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Quick Stats */}
                  <div className="flex items-center gap-6 mt-4">
                    <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg ${isCompleted ? 'bg-gray-200/50' : 'bg-emerald-200/50'}`}>
                      <GraduationCap className={`h-4 w-4 ${isCompleted ? 'text-gray-700' : 'text-emerald-700'}`} />
                      <span className={`text-sm font-semibold ${isCompleted ? 'text-gray-800' : 'text-emerald-800'}`}>
                        {project.studentsReached.toLocaleString()} students
                      </span>
                    </div>
                    <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg ${isCompleted ? 'bg-gray-200/50' : 'bg-emerald-200/50'}`}>
                      <Users className={`h-4 w-4 ${isCompleted ? 'text-gray-700' : 'text-emerald-700'}`} />
                      <span className={`text-sm font-semibold ${isCompleted ? 'text-gray-800' : 'text-emerald-800'}`}>
                        {project.educatorsEngaged} educators
                      </span>
                    </div>
                    <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg ${isCompleted ? 'bg-gray-200/50' : 'bg-emerald-200/50'}`}>
                      <BookOpen className={`h-4 w-4 ${isCompleted ? 'text-gray-700' : 'text-emerald-700'}`} />
                      <span className={`text-sm font-semibold ${isCompleted ? 'text-gray-800' : 'text-emerald-800'}`}>
                        Ages {project.ageGroup}
                      </span>
                    </div>
                  </div>
                </div>

                {/* School Info */}
                {project.partnerSchool && (
                  <div className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className={`flex h-10 w-10 items-center justify-center rounded-lg flex-shrink-0 ${isCompleted ? 'bg-gray-100' : 'bg-emerald-100'}`}>
                        <School className={`h-5 w-5 ${isCompleted ? 'text-gray-600' : 'text-emerald-600'}`} />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">{project.partnerSchool}</p>
                        <div className="flex items-center gap-1.5 mt-1 text-sm text-gray-500">
                          {project.flag && <span>{project.flag}</span>}
                          {project.country && (
                            <>
                              <MapPin className="h-3 w-3" />
                              <span>{project.country}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </motion.div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
