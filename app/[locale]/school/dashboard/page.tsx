'use client'

import { useEffect } from 'react'
import { useRouter } from '@/i18n/navigation'
import { Loader2 } from 'lucide-react'

export default function SchoolDashboardPage() {
  const router = useRouter()

  useEffect(() => {
    // Redirect to dashboard home page
    router.replace('/school/dashboard/home')
  }, [router])

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="text-center">
        <Loader2 className="mx-auto mb-4 h-8 w-8 animate-spin text-purple-600" />
        <h2 className="text-lg font-semibold text-gray-900">Loading Dashboard</h2>
        <p className="text-gray-600">Redirecting to your dashboard...</p>
      </div>
    </div>
  )
}
