'use client'

import { useState, useMemo } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Building2,
  Globe,
  Layers,
  School,
  Users,
  FileText,
  BookOpen,
  MapPin,
} from 'lucide-react'
import { getCurrentSession } from '@/lib/auth/session'
import { usePrototypeDb } from '@/hooks/use-prototype-db'
import { buildProgramSummariesForPartner } from '@/lib/programs/selectors'
import { SDG_DATA } from '@/components/sdg-icons'

const MOCK_RESOURCES = [
  {
    id: 'children-rights-toolkit',
    title: "Children's Rights Education Toolkit",
    description:
      "Comprehensive guide for teaching children's rights concepts across cultures. Perfect for middle and high school students exploring global citizenship and human rights.",
    type: 'Document',
    category: 'Teaching Guide',
    ageRange: '13-19 years old',
    sdgAlignment: [16],
    language: 'Italian',
    heroImageUrl:
      'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=800&h=480&fit=crop',
  },
  {
    id: 'cultural-exchange-framework',
    title: 'Cultural Exchange Learning Framework',
    description:
      'Structured approach to facilitating cross-cultural learning experiences. Includes activities, discussion prompts, and assessment tools for virtual exchange programs.',
    type: 'Video',
    category: 'Framework',
    ageRange: '9-13 years old',
    sdgAlignment: [4],
    language: 'English',
    heroImageUrl:
      'https://images.unsplash.com/photo-1531482615713-2afd69097998?w=800&h=480&fit=crop',
  },
  {
    id: 'diritti-gioco-guide',
    title: 'Diritti in Gioco – Facilitator Guide',
    description:
      'Step-by-step facilitator guide for running rights-based play workshops in Punti Luce centres. Includes session plans, printable materials, and reflection prompts.',
    type: 'Document',
    category: 'Facilitator Guide',
    ageRange: '6-14 years old',
    sdgAlignment: [4, 10],
    language: 'Italian',
    heroImageUrl:
      'https://images.unsplash.com/photo-1611273426858-450d8e3c9fce?w=800&h=480&fit=crop',
  },
]

export default function CoordinatorPartnerPage() {
  const [session] = useState(() => getCurrentSession())
  const { ready, database } = usePrototypeDb()

  const partnerRecord = useMemo(() => {
    if (!database || !session?.organization) return null
    const normalizedName = session.organization.trim().toLowerCase()
    return (
      database.partners.find(
        (p) => p.organizationName.toLowerCase() === normalizedName,
      ) ?? null
    )
  }, [database, session?.organization])

  const stats = useMemo(() => {
    if (!database || !partnerRecord) return null
    const summaries = buildProgramSummariesForPartner(database, partnerRecord.id, {
      includeRelatedPrograms: true,
    })

    const schoolSet = new Set<string>()
    const teacherSet = new Set<string>()
    const countrySet = new Set<string>()

    summaries.forEach((s) => {
      s.institutions.forEach((inst) => {
        schoolSet.add(inst.id)
        if (inst.country) countrySet.add(inst.country)
      })
      s.teachers.forEach((t) => teacherSet.add(t.id))
    })

    return {
      programs: summaries.length,
      schools: schoolSet.size,
      teachers: teacherSet.size,
      countries: countrySet.size,
    }
  }, [database, partnerRecord])

  if (!ready || !database) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-48 w-full rounded-2xl" />
        <Skeleton className="h-64 w-full rounded-2xl" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold text-gray-900">My Partner</h1>
        <p className="mt-1 text-sm text-gray-600">
          Organization profile and resources from {session?.organization ?? 'your partner'}.
        </p>
      </div>

      {/* Partner profile card */}
      {partnerRecord && (
        <Card className="overflow-hidden">
          <div className="bg-gradient-to-br from-purple-600 to-purple-800 px-6 py-8 text-white">
            <div className="flex items-start gap-4">
              {partnerRecord.logo ? (
                <img
                  src={partnerRecord.logo}
                  alt={partnerRecord.organizationName}
                  className="h-20 w-20 rounded-2xl bg-white object-contain p-2 shadow-lg"
                />
              ) : (
                <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-white/20">
                  <Building2 className="h-9 w-9 text-white" />
                </div>
              )}
              <div className="flex-1">
                <h2 className="text-2xl font-bold">{partnerRecord.organizationName}</h2>
                {partnerRecord.mission && (
                  <p className="mt-1 text-sm text-purple-100">{partnerRecord.mission}</p>
                )}
              </div>
            </div>

            {/* Stats row */}
            {stats && (
              <div className="mt-6 grid grid-cols-4 gap-4">
                <div className="rounded-lg bg-white/10 px-3 py-2 text-center">
                  <p className="text-lg font-bold">{stats.programs}</p>
                  <p className="text-xs text-purple-200">Programs</p>
                </div>
                <div className="rounded-lg bg-white/10 px-3 py-2 text-center">
                  <p className="text-lg font-bold">{stats.schools}</p>
                  <p className="text-xs text-purple-200">Schools</p>
                </div>
                <div className="rounded-lg bg-white/10 px-3 py-2 text-center">
                  <p className="text-lg font-bold">{stats.teachers}</p>
                  <p className="text-xs text-purple-200">Educators</p>
                </div>
                <div className="rounded-lg bg-white/10 px-3 py-2 text-center">
                  <p className="text-lg font-bold">{stats.countries}</p>
                  <p className="text-xs text-purple-200">Countries</p>
                </div>
              </div>
            )}
          </div>

          <CardContent className="p-6">
            {partnerRecord.description && (
              <p className="text-sm leading-relaxed text-gray-600">{partnerRecord.description}</p>
            )}

            <div className="mt-4 flex flex-wrap gap-2">
              {partnerRecord.organizationType && (
                <Badge variant="outline" className="capitalize">
                  {partnerRecord.organizationType}
                </Badge>
              )}
              {partnerRecord.country && (
                <Badge variant="outline">
                  <MapPin className="mr-1 h-3 w-3" />
                  {partnerRecord.country}
                </Badge>
              )}
              {partnerRecord.languages?.map((lang) => (
                <Badge key={lang} variant="outline">
                  <Globe className="mr-1 h-3 w-3" />
                  {lang.toUpperCase()}
                </Badge>
              ))}
            </div>

            {partnerRecord.sdgFocus && partnerRecord.sdgFocus.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-2">
                {partnerRecord.sdgFocus.map((sdg) => {
                  const num = parseInt(sdg.replace('SDG ', ''), 10)
                  const data = SDG_DATA[num]
                  return (
                    <Badge
                      key={sdg}
                      variant="outline"
                      className="border-orange-300 text-orange-700"
                    >
                      SDG {num}{data ? `: ${data.title}` : ''}
                    </Badge>
                  )
                })}
              </div>
            )}

            {partnerRecord.website && (
              <p className="mt-4 text-sm text-gray-500">
                <a
                  href={partnerRecord.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-purple-600 hover:underline"
                >
                  {partnerRecord.website}
                </a>
              </p>
            )}
          </CardContent>
        </Card>
      )}

      {/* Resources / Content Hub */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900">Resources</h2>
        <p className="mt-1 text-sm text-gray-600">
          Educational resources available from your organization.
        </p>
      </div>

      <div className="space-y-4">
        {MOCK_RESOURCES.map((resource) => {
          const sdgTitles =
            resource.sdgAlignment?.map((num: number) => {
              const sdgData = SDG_DATA[num]
              return sdgData ? `SDG #${num}: ${sdgData.title}` : `SDG ${num}`
            }) || []

          return (
            <Card key={resource.id} className="overflow-hidden">
              <CardContent className="p-0">
                <div className="flex flex-col gap-0 sm:flex-row">
                  {/* Thumbnail */}
                  <div className="relative h-40 flex-shrink-0 overflow-hidden bg-gray-100 sm:h-48 sm:w-48">
                    {resource.heroImageUrl ? (
                      <img
                        src={resource.heroImageUrl}
                        alt={resource.title}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-purple-100 to-purple-50">
                        <FileText className="h-12 w-12 text-purple-300" />
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 p-6">
                    <h3 className="text-xl font-semibold leading-tight text-gray-900">
                      {resource.title}
                    </h3>

                    <div className="mb-3 mt-3 flex flex-wrap gap-2">
                      <Badge className="bg-purple-600 text-white hover:bg-purple-700">
                        {resource.type}
                      </Badge>
                      {resource.category && (
                        <Badge variant="outline" className="capitalize">
                          {resource.category}
                        </Badge>
                      )}
                      {resource.ageRange && (
                        <Badge variant="outline">{resource.ageRange}</Badge>
                      )}
                      {sdgTitles.length > 0 && (
                        <Badge variant="outline" className="border-orange-300 text-orange-700">
                          {sdgTitles[0]}
                        </Badge>
                      )}
                      <Badge className="bg-purple-600 text-white hover:bg-purple-700">
                        {resource.language}
                      </Badge>
                    </div>

                    <p className="text-sm leading-relaxed text-gray-600">
                      {resource.description}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
