'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import Image from 'next/image'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Mail,
  Phone,
  BarChart3,
  Target,
  Tag,
  Edit,
  Building2,
  Award,
  ShieldCheck,
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
  childRightsFocus: string[]
  description?: string
  mission?: string
}

const CRC_ARTICLE_DETAILS: Record<string, { title: string }> = {
  '12': { title: 'Respect for the views of the child' },
  '13': { title: 'Freedom of expression' },
  '24': { title: 'Health and health services' },
  '28': { title: 'Right to education' },
  '29': { title: 'Goals of education' },
  '31': { title: 'Leisure, play, and culture' },
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
        studentCount: 850,
        teacherCount: 65,
        languages: ['Danish', 'English', 'German', 'Spanish'],
        contactName: 'Henrik Vestergaard',
        contactEmail: 'henrik.vestergaard@orestadgym.dk',
        contactPhone: '+45 32 54 89 00',
        interests: ['Global Citizenship', 'Climate Action', 'Cultural Exchange', 'Human Rights Education', 'Digital Innovation'],
        sdgFocus: ['4', '10', '13', '16'],
        childRightsFocus: ['12', '28', '29', '31'],
        description: 'A forward-thinking international school committed to global citizenship education and collaborative learning across borders.',
        mission: 'Ørestad Gymnasium is dedicated to preparing students for a globalized world through innovative teaching methods, international collaboration, and a strong focus on sustainability and human rights. We believe in empowering young people to become active, informed global citizens.',
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

  const childRightsEntries = school.childRightsFocus.map((article) => {
    const details = CRC_ARTICLE_DETAILS[article] ?? { title: `Article ${article}` }
    const padded = article.padStart(2, '0')
    return {
      article,
      title: details.title,
      iconSrc: `/crc/icons/article-${padded}.png`,
    }
  })

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
              <p className="text-gray-500">Principal</p>
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

        {/* Quick Stats */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Quick Stats
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-4 gap-4">
              <div>
                <div className="text-2xl font-bold text-purple-600">2</div>
                <div className="text-sm text-gray-600">Programs</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-emerald-600">4</div>
                <div className="text-sm text-gray-600">Projects</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-blue-600">{school.studentCount}</div>
                <div className="text-sm text-gray-600">Students</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-amber-600">{school.teacherCount}</div>
                <div className="text-sm text-gray-600">Teachers</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Mission Statement */}
      {school.mission && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-4 w-4" />
              Our Mission
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="leading-relaxed text-gray-700">{school.mission}</p>
          </CardContent>
        </Card>
      )}

      {/* Focus Areas */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* SDG Focus */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="h-4 w-4" />
              UN SDG Focus
            </CardTitle>
            <CardDescription>
              Priority Sustainable Development Goals our school advances.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {school.sdgFocus.length > 0 ? (
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
                {school.sdgFocus.map((sdgString) => {
                  const sdgId = typeof sdgString === 'string' ? Number.parseInt(sdgString, 10) : sdgString
                  const sdg = SDG_OPTIONS.find((s) => s.id === sdgId)
                  return sdg ? (
                    <div key={sdgId} className="flex flex-col items-center gap-2">
                      <SDGIcon number={sdgId} size="lg" showTitle={false} />
                      <p className="text-center text-xs leading-tight text-gray-900">
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

        {/* Child Rights Focus */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4" />
              CRC Child Rights Focus
            </CardTitle>
            <CardDescription>
              Priority articles from the UN Convention on the Rights of the Child.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {childRightsEntries.length > 0 ? (
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
                {childRightsEntries.map((entry) => (
                  <div key={entry.article} className="flex flex-col items-center gap-2">
                    <div className="relative h-20 w-20">
                      <Image
                        src={entry.iconSrc}
                        alt={entry.title}
                        fill
                        sizes="80px"
                        className="rounded object-contain"
                      />
                    </div>
                    <p className="text-center text-xs leading-tight text-gray-900">
                      {entry.title}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500">
                Add your Convention on the Rights of the Child focus areas.
              </p>
            )}
          </CardContent>
        </Card>
      </div>

    </div>
  )
}
