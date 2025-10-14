'use client'

import { Suspense, useState, useEffect } from 'react'
import { SchoolProfileDashboard } from '@/components/school/school-profile-dashboard'
import { getCurrentSession } from '@/lib/auth/session'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Loader2, School } from 'lucide-react'
import { useSearchParams } from 'next/navigation'

interface SchoolProfile {
  id: string
  name: string
  type: string
  location: string
  city: string
  country: string
  studentCount: number
  teacherCount: number
  languages: string[]
  contactName: string
  contactEmail: string
  contactPhone?: string
  interests: string[]
  sdgFocus: string[]
  description?: string
}

function SchoolDashboardContent() {
  const [school, setSchool] = useState<SchoolProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const searchParams = useSearchParams()
  const tabParam = searchParams.get('tab')
  const allowedTabs = new Set(['overview', 'programs', 'projects', 'network', 'resources', 'analytics'])
  const initialTab = (tabParam && allowedTabs.has(tabParam) ? tabParam : 'overview') as
    | 'overview'
    | 'programs'
    | 'projects'
    | 'network'
    | 'resources'
    | 'analytics'

  useEffect(() => {
    loadSchoolProfile()
  }, [])

  const loadSchoolProfile = async () => {
    setLoading(true)
    setError(null)

    try {
      const session = getCurrentSession()
      if (!session || session.role !== 'teacher') {
        setError('Please log in as a school to view this page')
        return
      }

      // For demo purposes, we'll create a sample school profile
      // In a real implementation, you'd fetch the school profile from your database
      const sampleSchool: SchoolProfile = {
        id: 'school-orestad-gymnasium',
        name: 'Ørestad Gymnasium',
        type: 'High School',
        location: 'Copenhagen, Denmark',
        city: 'Copenhagen',
        country: 'Denmark',
        studentCount: 800,
        teacherCount: 65,
        languages: ['Danish', 'English', 'German', 'Spanish'],
        contactName: 'Maria Hansen',
        contactEmail: 'maria.hansen@orestad.dk',
        contactPhone: '+45 55 77 10 00',
        interests: ['Human Rights', 'Climate Change', 'Technology Projects', 'Cultural Exchange', 'Global Citizenship'],
        sdgFocus: ['4', '10', '13', '16', '17'],
        description: 'A forward-thinking international school committed to global citizenship education and collaborative learning across borders.',
      }

      setSchool(sampleSchool)
    } catch (err) {
      console.error('Error loading school profile:', err)
      setError('Failed to load school profile')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <Loader2 className="mx-auto h-8 w-8 animate-spin text-purple-600" />
          <p className="mt-2 text-sm text-gray-600">Loading school profile...</p>
        </div>
      </div>
    )
  }

  if (error || !school) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <School className="mx-auto mb-4 h-12 w-12 text-gray-400" />
            <h2 className="mb-2 text-lg font-semibold text-gray-900">
              {error || 'School profile not found'}
            </h2>
            <p className="mb-4 text-sm text-gray-600">
              Please log in as a school to access your dashboard.
            </p>
            <Button onClick={() => window.location.href = '/partner/login'}>
              Go to Login
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <SchoolProfileDashboard
        school={school}
        isOwnProfile={true}
        initialTab={initialTab}
      />
    </div>
  )
}

export default function SchoolDashboardPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
      </div>
    }>
      <SchoolDashboardContent />
    </Suspense>
  )
}
