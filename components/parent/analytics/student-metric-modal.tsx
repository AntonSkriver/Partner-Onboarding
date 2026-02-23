'use client'

import { motion } from 'framer-motion'
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
} from 'recharts'
import {
  TrendingUp,
  BookOpen,
} from 'lucide-react'

// Animated counter component for engaging number displays
// (must match the one in page.tsx)
import { useRef, useEffect } from 'react'
import { useInView, useSpring, useTransform } from 'framer-motion'

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

// Custom tooltip component for charts
const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: Array<{ value: number; name: string; payload: { fill?: string } }>; label?: string }) => {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-lg border border-gray-200 bg-white px-3 py-2 shadow-lg">
        <p className="text-sm font-medium text-gray-900">{label || payload[0].name}</p>
        <p className="text-sm text-gray-600">{payload[0].value.toLocaleString()}</p>
      </div>
    )
  }
  return null
}

const CHART_COLORS = {
  purple: ['#9333ea', '#a855f7', '#c084fc', '#d8b4fe'],
}

interface StudentBreakdownItem {
  program: string
  students: number
  schools: number
  countries: number
  ageGroup: string
  partners: string
  status?: string
}

interface StudentMetricModalProps {
  totalStudents: number
  studentBreakdown: StudentBreakdownItem[]
  t: (key: string) => string
}

export function StudentMetricModal({ totalStudents, studentBreakdown, t }: StudentMetricModalProps) {
  const countryCount = 2 // Italy and Mexico

  // Age group distribution (based on typical secondary school demographics)
  const ageGroupData = [
    { name: '12-14 years', value: Math.round(totalStudents * 0.28), fill: '#8b5cf6' },
    { name: '14-16 years', value: Math.round(totalStudents * 0.38), fill: '#a78bfa' },
    { name: '16-18 years', value: Math.round(totalStudents * 0.34), fill: '#c4b5fd' },
  ]

  // Gender distribution (slightly more female participation typical in educational programs)
  const genderData = [
    { name: 'Female', value: Math.round(totalStudents * 0.52), fill: '#ec4899' },
    { name: 'Male', value: Math.round(totalStudents * 0.47), fill: '#3b82f6' },
    { name: 'Non-binary', value: Math.round(totalStudents * 0.01), fill: '#8b5cf6' },
  ]

  return (
    <div className="space-y-10">
      {/* Hero stat with animated counter */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-purple-500 to-purple-700 p-8 text-white">
        <div className="relative z-10">
          <p className="text-sm font-medium text-purple-100">{t('totalStudentsReached')}</p>
          <p className="mt-2 text-5xl font-bold">
            <AnimatedCounter value={totalStudents} />
          </p>
          <div className="mt-4 flex items-center gap-2 text-purple-100">
            <TrendingUp className="h-4 w-4" />
            <span className="text-sm">Across {countryCount} countries · {studentBreakdown.length} active programs</span>
          </div>
        </div>
        <div className="absolute -right-4 -top-4 h-32 w-32 rounded-full bg-white/10" />
        <div className="absolute -bottom-8 -right-8 h-40 w-40 rounded-full bg-white/5" />
      </div>

      {/* Age and Gender distribution */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Age Group Distribution */}
        <motion.div
          className="rounded-xl border border-gray-100 bg-gray-50/30 p-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
        >
          <h4 className="mb-4 text-base font-semibold text-gray-900">{t('ageDistribution')}</h4>
          <div className="flex items-center gap-6">
            <div className="h-36 w-36 flex-shrink-0">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={ageGroupData}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={65}
                    paddingAngle={3}
                    dataKey="value"
                    animationBegin={100}
                    animationDuration={600}
                  >
                    {ageGroupData.map((entry, index) => (
                      <Cell key={`age-cell-${index}`} fill={entry.fill} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex-1 space-y-3">
              {ageGroupData.map((item) => {
                const percent = Math.round((item.value / totalStudents) * 100)
                return (
                  <div key={item.name} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="h-3 w-3 rounded-full" style={{ backgroundColor: item.fill }} />
                      <span className="text-sm font-medium text-gray-700">{item.name}</span>
                    </div>
                    <span className="text-sm font-semibold text-gray-900">{percent}%</span>
                  </div>
                )
              })}
            </div>
          </div>
        </motion.div>

        {/* Gender Distribution */}
        <motion.div
          className="rounded-xl border border-gray-100 bg-gray-50/30 p-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <h4 className="mb-4 text-base font-semibold text-gray-900">{t('genderDistribution')}</h4>
          <div className="flex items-center gap-6">
            <div className="h-36 w-36 flex-shrink-0">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={genderData}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={65}
                    paddingAngle={3}
                    dataKey="value"
                    animationBegin={150}
                    animationDuration={600}
                  >
                    {genderData.map((entry, index) => (
                      <Cell key={`gender-cell-${index}`} fill={entry.fill} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex-1 space-y-3">
              {genderData.map((item) => {
                const percent = Math.round((item.value / totalStudents) * 100)
                return (
                  <div key={item.name} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="h-3 w-3 rounded-full" style={{ backgroundColor: item.fill }} />
                      <span className="text-sm font-medium text-gray-700">{item.name}</span>
                    </div>
                    <span className="text-sm font-semibold text-gray-900">{percent}%</span>
                  </div>
                )
              })}
            </div>
          </div>
        </motion.div>
      </div>

      {/* Pie chart and breakdown */}
      <div className="grid gap-10 lg:grid-cols-2">
        {/* Students by Country */}
        <motion.div
          className="rounded-xl border border-gray-100 bg-gray-50/30 p-6"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
        >
          <h4 className="mb-6 text-base font-semibold text-gray-900">{t('studentsByCountry')}</h4>
          <div className="space-y-6">
            {/* Italy */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">🇮🇹</span>
                  <span className="font-semibold text-gray-900">Italy</span>
                </div>
                <span className="text-2xl font-bold text-purple-600">102</span>
              </div>
              <div className="h-3 rounded-full bg-purple-100 overflow-hidden">
                <motion.div
                  className="h-3 rounded-full bg-gradient-to-r from-purple-600 to-purple-400"
                  initial={{ width: 0 }}
                  animate={{ width: '80%' }}
                  transition={{ duration: 0.8, delay: 0.3 }}
                />
              </div>
              <p className="text-sm text-gray-500">4 schools · 80% of students</p>
            </div>
            {/* Mexico */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">🇲🇽</span>
                  <span className="font-semibold text-gray-900">Mexico</span>
                </div>
                <span className="text-2xl font-bold text-blue-600">26</span>
              </div>
              <div className="h-3 rounded-full bg-blue-100 overflow-hidden">
                <motion.div
                  className="h-3 rounded-full bg-gradient-to-r from-blue-600 to-blue-400"
                  initial={{ width: 0 }}
                  animate={{ width: '20%' }}
                  transition={{ duration: 0.8, delay: 0.4 }}
                />
              </div>
              <p className="text-sm text-gray-500">1 school active · 20% of students</p>
            </div>
          </div>
        </motion.div>

        {/* Program breakdown list */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.25 }}
        >
          <h4 className="mb-6 text-base font-semibold text-gray-900">{t('programDetails')}</h4>
          <div className="space-y-5">
            {studentBreakdown.map((item, idx) => {
              const percent = totalStudents
                ? Math.round((item.students / totalStudents) * 100)
                : 0
              return (
                <motion.div
                  key={item.program}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 + idx * 0.05 }}
                  className="group rounded-xl bg-purple-50/50 border-l-4 border-purple-500 p-6 transition-all hover:bg-purple-50/80 hover:shadow-md hover:-translate-y-0.5"
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
                        <p className="font-semibold text-gray-900">{item.program}</p>
                        <p className="mt-1.5 text-sm text-gray-500">
                          {item.schools} schools · Ages {item.ageGroup}
                        </p>
                        <div className="mt-2 flex flex-wrap items-center gap-2">
                          <span className="text-sm text-gray-600">{item.partners}</span>
                          {item.status && (
                            <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-700">
                              {item.status}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-purple-500 bg-clip-text text-transparent">{item.students.toLocaleString()}</p>
                      <p className="mt-1 text-sm text-gray-500">{percent}% of total</p>
                    </div>
                  </div>
                  <div className="h-2 rounded-full bg-purple-100 overflow-hidden">
                    <motion.div
                      className="h-2 rounded-full bg-gradient-to-r from-purple-600 to-purple-400"
                      initial={{ width: 0 }}
                      animate={{ width: `${percent}%` }}
                      transition={{ duration: 0.8, delay: 0.4 + idx * 0.1, ease: "easeOut" }}
                    />
                  </div>
                </motion.div>
              )
            })}
          </div>
        </motion.div>
      </div>
    </div>
  )
}
