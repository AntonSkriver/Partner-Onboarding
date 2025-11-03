'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Plus, BookOpen, FileText, MoreVertical, Building2 } from 'lucide-react'
import { getCurrentSession } from '@/lib/auth/session'
import { Database } from '@/lib/types/database'
import { SDG_DATA } from '@/components/sdg-icons'

type Organization = Database['public']['Tables']['organizations']['Row']

export default function PartnerResourcesPage() {
  const [organization, setOrganization] = useState<Organization | null>(null)
  const [loading, setLoading] = useState(true)
  const [resources, setResources] = useState<any[]>([])

  useEffect(() => {
    loadOrganizationData()
  }, [])

  const loadOrganizationData = async () => {
    setLoading(true)
    try {
      const session = getCurrentSession()
      if (!session || session.role !== 'partner') {
        return
      }

      // For demo purposes - sample organization data
      const sampleOrg: Organization = {
        id: 'demo-org-id',
        name: 'UNICEF Denmark',
        organization_type: 'ngo',
        website: 'https://unicef.dk',
        logo: null,
        short_description:
          'Connecting classrooms worldwide through collaborative learning experiences aligned with UN Sustainable Development Goals',
        primary_contacts: [],
        regions_of_operation: ['Europe', 'Africa', 'Asia-Pacific'],
        countries_of_operation: ['Denmark', 'Mexico', 'Italy', 'Germany', 'Brazil', 'Finland'],
        languages: ['Danish', 'English', 'Spanish', 'Italian'],
        sdg_tags: ['4', '10', '16', '17'],
        thematic_tags: [
          "Children's Rights",
          'Global Citizenship',
          'Cultural Exchange',
          'Human Rights Education',
        ],
        verification_status: 'verified',
        brand_settings: null,
        created_at: '2024-01-15T10:00:00Z',
        updated_at: '2024-03-10T15:30:00Z',
        is_active: true,
      }

      const mockResources = [
        {
          id: 'children-rights-toolkit',
          title: "Children's Rights Education Toolkit",
          description:
            "Comprehensive guide for teaching children's rights concepts across cultures. Perfect for middle and high school students exploring global citizenship and human rights.",
          type: 'Document',
          category: 'Teaching Guide',
          ageRange: '13-19 years old',
          sdgAlignment: [16],
          language: 'English',
          heroImageUrl:
            'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=800&h=480&fit=crop',
          updated_at: '2025-01-10T10:00:00Z',
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
          updated_at: '2024-12-15T15:30:00Z',
        },
        {
          id: 'sustainability-action-guide',
          title: 'Climate Action for Young Leaders',
          description:
            'Engaging guide to help students understand climate change and take meaningful action in their communities through hands-on projects and global collaboration.',
          type: 'Book',
          category: 'Action Guide',
          ageRange: '13-19 years old',
          sdgAlignment: [13],
          language: 'English',
          heroImageUrl:
            'https://images.unsplash.com/photo-1611273426858-450d8e3c9fce?w=800&h=480&fit=crop',
          updated_at: '2025-02-01T09:00:00Z',
        },
      ]

      setOrganization(sampleOrg)
      setResources(mockResources)
    } catch (err) {
      console.error('Error loading resources:', err)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-20 w-full rounded-2xl" />
        <div className="space-y-4">
          <Skeleton className="h-48 rounded-2xl" />
          <Skeleton className="h-48 rounded-2xl" />
        </div>
      </div>
    )
  }

  if (!organization) {
    return (
      <Card>
        <CardContent className="p-10 text-center">
          <Building2 className="mx-auto mb-4 h-12 w-12 text-gray-400" />
          <h2 className="mb-2 text-lg font-semibold text-gray-900">No Organization Profile</h2>
          <p className="text-gray-600">Please create an organization profile to get started.</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-semibold text-gray-900">Resources</h1>
            <p className="text-sm text-gray-600">
              Manage educational resources for teachers and students.
            </p>
          </div>
          {resources.length > 0 && (
            <Button className="bg-purple-600 hover:bg-purple-700" asChild>
              <Link href="/partner/content/upload">
                <Plus className="mr-2 h-4 w-4" />
                Add Resources
              </Link>
            </Button>
          )}
        </div>
      </div>

      {/* Resources List */}
      {resources.length > 0 ? (
        <div className="space-y-4">
          {resources.map((resource) => {
            // Get SDG data
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
                      <div className="mb-3 flex items-start justify-between gap-4">
                        <h3 className="text-xl font-semibold leading-tight text-gray-900">
                          {resource.title}
                        </h3>
                        <Button variant="ghost" size="sm" className="flex-shrink-0">
                          <MoreVertical className="h-4 w-4 text-gray-400" />
                        </Button>
                      </div>

                      {/* Metadata badges */}
                      <div className="mb-3 flex flex-wrap gap-2">
                        <Badge className="bg-purple-600 text-white hover:bg-purple-700">
                          {resource.type}
                        </Badge>

                        {resource.category && (
                          <Badge variant="outline" className="capitalize">
                            {resource.category}
                          </Badge>
                        )}

                        {resource.ageRange && <Badge variant="outline">{resource.ageRange}</Badge>}

                        {sdgTitles.length > 0 && (
                          <Badge variant="outline" className="border-orange-300 text-orange-700">
                            {sdgTitles[0]}
                          </Badge>
                        )}

                        <Badge className="bg-purple-600 text-white hover:bg-purple-700">
                          {resource.language}
                        </Badge>
                      </div>

                      {/* Description */}
                      <p className="text-sm leading-relaxed text-gray-600">{resource.description}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      ) : (
        <Card>
          <CardContent className="space-y-4 p-10 text-center">
            <BookOpen className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="text-lg font-medium text-gray-900">No Resources Yet</h3>
            <p className="text-gray-500">
              Add educational resources to share with teachers and students.
            </p>
            <Button className="bg-purple-600 hover:bg-purple-700" asChild>
              <Link href="/partner/content/upload">
                <Plus className="mr-2 h-4 w-4" />
                Add Resources
              </Link>
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
