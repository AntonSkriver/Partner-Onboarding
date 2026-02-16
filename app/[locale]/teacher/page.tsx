"use client"

import { useEffect } from 'react'
import { useRouter } from '@/i18n/navigation'

export default function TeacherRootPage() {
  const router = useRouter()

  useEffect(() => {
    router.replace('/teacher/dashboard')
  }, [router])

  return null
}
