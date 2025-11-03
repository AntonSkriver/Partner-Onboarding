'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Mail,
  Phone,
  School,
  BarChart3,
  Target,
  Tag,
  Edit,
  Building2,
} from 'lucide-react'
import { getCurrentSession } from '@/lib/auth/session'
import { SDGIcon } from '@/components/sdg-icons'
import { SDG_OPTIONS } from '@/contexts/partner-onboarding-context'

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

export default function SchoolOverviewPage() {
  const [school, setSchool] = useState<SchoolProfile | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadSchoolProfile()
  }, [])

  const loadSchoolProfile = async () => {
    setLoading(true)
    try {
      const session = getCurrentSession()
      if (!session || session.role !== 'teacher') {
        return
      }

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
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-40 w-full rounded-2xl" />
        <div className="grid gap-4 md:grid-cols-3">
          <Skeleton className="h-48 rounded-2xl" />
          <Skeleton className="h-48 rounded-2xl" />
          <Skeleton className="h-48 rounded-2xl" />
        </div>
      </div>
    )
  }

  if (!school) {
    return (
      <Card>
        <CardContent className="p-10 text-center">
          <Building2 className="mx-auto mb-4 h-12 w-12 text-gray-400" />
          <h2 className="mb-2 text-lg font-semibold text-gray-900">No School Profile</h2>
          <p className="text-gray-600">Please create a school profile to get started.</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-10">
      {/* Header Section */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-semibold text-gray-900">{school.name}</h1>
          <Button variant="outline" asChild>
            <Link href="/school/dashboard/edit">
              <Edit className="mr-2 h-4 w-4" />
              Edit Profile
            </Link>
          </Button>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">School Overview</h2>
          <p className="text-sm text-gray-600">
            {school.description || `${school.type} in ${school.location}`}
          </p>
        </div>
      </div>

      {/* Detailed Information Sections */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Contact Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="h-4 w-4" />
              Contact Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div>
              <p className="font-semibold text-gray-900">{school.contactName}</p>
              <p className="text-gray-500">Primary contact</p>
            </div>
            <div className="flex items-center gap-2 text-gray-600">
              <Mail className="h-3 w-3" />
              <span>{school.contactEmail}</span>
            </div>
            {school.contactPhone && (
              <div className="flex items-center gap-2 text-gray-600">
                <Phone className="h-3 w-3" />
                <span>{school.contactPhone}</span>
              </div>
            )}
          </CardContent>
        </Card>

        {/* School Snapshot */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <School className="h-4 w-4" />
              School Snapshot
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-xs uppercase text-gray-500">Type</p>
              <p className="font-semibold text-gray-900">{school.type}</p>
            </div>
            <div>
              <p className="text-xs uppercase text-gray-500">Students</p>
              <p className="font-semibold text-gray-900">{school.studentCount}</p>
            </div>
            <div>
              <p className="text-xs uppercase text-gray-500">Teachers</p>
              <p className="font-semibold text-gray-900">{school.teacherCount}</p>
            </div>
            <div>
              <p className="text-xs uppercase text-gray-500">Languages</p>
              <div className="flex flex-wrap gap-1">
                {school.languages.map((language) => (
                  <Badge key={language} variant="secondary" className="text-xs">
                    {language}
                  </Badge>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Stats */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Quick Stats
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-2xl font-bold text-purple-600">2</div>
                <div className="text-sm text-gray-600">Active Programs</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-green-600">4</div>
                <div className="text-sm text-gray-600">Active Projects</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Focus Areas */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* SDG Focus */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-4 w-4" />
              UN SDG Focus
            </CardTitle>
          </CardHeader>
          <CardContent>
            {school.sdgFocus.length > 0 ? (
              <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6">
                {school.sdgFocus.map((sdgString) => {
                  const sdgId = typeof sdgString === 'string' ? Number.parseInt(sdgString, 10) : sdgString
                  const sdg = SDG_OPTIONS.find((s) => s.id === sdgId)
                  return sdg ? (
                    <div key={sdgId} className="flex flex-col items-center">
                      <SDGIcon
                        number={sdgId}
                        size="md"
                        showTitle={false}
                        className="h-16 w-16 rounded-lg object-cover shadow-sm transition-shadow hover:shadow-md"
                      />
                      <p className="mt-1 text-center text-xs leading-tight text-gray-600">
                        {sdg.title}
                      </p>
                    </div>
                  ) : null
                })}
              </div>
            ) : (
              <p className="text-gray-500">No SDG focus areas specified</p>
            )}
          </CardContent>
        </Card>

        {/* Thematic Areas */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Tag className="h-4 w-4" />
              Thematic Areas
            </CardTitle>
          </CardHeader>
          <CardContent>
            {school.interests.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {school.interests.map((interest) => (
                  <Badge key={interest} variant="outline">
                    {interest}
                  </Badge>
                ))}
              </div>
            ) : (
              <p className="text-gray-500">No thematic areas specified</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
