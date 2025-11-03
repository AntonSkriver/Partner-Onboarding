'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2 } from 'lucide-react'

export default function PartnerProfilePage() {
  const router = useRouter()

  useEffect(() => {
    // Redirect to dashboard page
    router.replace('/partner/profile/dashboard')
  }, [router])

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="text-center">
        <Loader2 className="mx-auto mb-4 h-8 w-8 animate-spin text-blue-600" />
        <h2 className="text-lg font-semibold text-gray-900">Loading Profile</h2>
        <p className="text-gray-600">Redirecting to your profile...</p>
      </div>
    </div>
  )
}
