'use client'

import { useRef, useEffect } from 'react'
import { motion, useInView, useSpring, useTransform } from 'framer-motion'

// Animated counter component for engaging number displays
export function AnimatedCounter({ value, duration = 1.5, className = '' }: { value: number; duration?: number; className?: string }) {
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
export const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: Array<{ value: number; name: string; payload: { fill?: string } }>; label?: string }) => {
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

// Chart color palettes
export const CHART_COLORS = {
  purple: ['#9333ea', '#a855f7', '#c084fc', '#d8b4fe'],
  blue: ['#2563eb', '#3b82f6', '#60a5fa', '#93c5fd'],
  emerald: ['#059669', '#10b981', '#34d399', '#6ee7b7'],
  amber: ['#d97706', '#f59e0b', '#fbbf24', '#fcd34d'],
  status: {
    active: '#10b981',
    partial: '#f59e0b',
    onboarding: '#9ca3af',
  },
}

// CRC Article titles
export const CRC_TITLES: Record<string, string> = {
  '2': 'Non-discrimination',
  '3': 'Best interests of child',
  '4': 'Implementation of rights',
  '6': 'Life, survival & development',
  '12': 'Respect for views of child',
  '13': 'Freedom of expression',
  '17': 'Access to information',
  '19': 'Protection from violence',
  '24': 'Health services',
  '28': 'Right to education',
  '29': 'Goals of education',
  '31': 'Leisure & play',
}

export const EXCLUDED_INSTITUTION_IDS = new Set<string>()

export const TEACHER_AVATARS: Record<string, string> = {
  'Ulla Jensen': '/images/avatars/ulla-new.jpg',
  'Karin Albrectsen': '/images/avatars/karin-new.jpg',
  'Maria Garcia': '/images/avatars/maria-new.jpg',
  'Raj Patel': '/images/avatars/raj-new.jpg',
  'Jonas Madsen': '/images/avatars/jonas-final.jpg',
  'Anne Holm': '/images/avatars/anne-holm.png',
  'Sofie Larsen': '/images/avatars/sofie-larsen.png',
  'Sara Ricci': '/images/avatars/sara-ricci.png',
  'Lucas Souza': '/images/avatars/lucas-souza.png',
  'Peter Andersen': '/images/avatars/peter-andersen.png',
}

export function getEducatorAvatar(name: string): string | null {
  return TEACHER_AVATARS[name] || null
}

// Shared interfaces for modal props
export interface SchoolDetail {
  name: string
  originalName: string
  country: string
  flag: string
  students: number
  teachers: number
  city?: string
  schoolType?: 'primary' | 'secondary' | 'higher-ed'
  status?: 'active' | 'partial' | 'onboarding'
  projectCount?: number
}

export interface ProjectDetail {
  name: string
  studentsReached: number
  educatorsEngaged: number
  status: 'active' | 'completed'
  partnerSchool?: string
  country?: string
  flag?: string
  ageGroup: string
}

export interface CountryImpactEntry {
  country: string
  countryLabel: string
  flag: string
  institutions: number
  teachers: number
  students: number
  projects: number
  completedProjects: number
  regions: string[]
}

export interface StudentBreakdownEntry {
  program: string
  students: number
  schools: number
  countries: number
  partners: string
}

export interface EducatorDetail {
  name: string
  avatar?: string | null
  subject: string
  school: string
  country: string
  flag: string
  projectCount: number
  ageGroup: string
  project: string | null
}
