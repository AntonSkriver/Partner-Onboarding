'use client'

import { useState, useEffect } from 'react'
import { PartnerProfileDashboard } from '@/components/partner/partner-profile-dashboard'
import { PartnerProfileForm } from '@/components/partner/partner-profile-form'
import { OrganizationAPI } from '@/lib/api/organizations'
import { Database } from '@/lib/types/database'
import { getCurrentSession } from '@/lib/auth/session'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Loader2, Building2 } from 'lucide-react'

type Organization = Database['public']['Tables']['organizations']['Row']

export default function PartnerProfilePage() {
  const [organization, setOrganization] = useState<Organization | null>(null)
  const [loading, setLoading] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadOrganizationProfile()
  }, [])

  const loadOrganizationProfile = async () => {
    setLoading(true)
    setError(null)
    
    try {
      const session = getCurrentSession()
      if (!session || session.role !== 'partner') {
        setError('Please log in as a partner to view this page')
        return
      }

      // For demo purposes, we'll create a sample organization
      // In a real implementation, you'd get the organization ID from the user session
      const sampleOrg: Organization = {
        id: 'demo-org-id',
        name: 'UNICEF Danmark',
        organization_type: 'ngo',
        website: 'https://unicef.dk',
        logo: null,
        short_description: 'Connecting classrooms worldwide through collaborative learning experiences aligned with UN Sustainable Development Goals',
        primary_contacts: [
          {
            name: 'Sarah Hansen',
            email: 'sarah@unicef.dk',
            phone: '+45 35 27 35 35',
            role: 'Program Director',
            isPrimary: true
          },
          {
            name: 'Michael Andersen',
            email: 'michael@unicef.dk',
            phone: '+45 35 27 35 36',
            role: 'Partnership Coordinator',
            isPrimary: false
          }
        ],
        regions_of_operation: ['Europe', 'Africa', 'Asia-Pacific'],
        countries_of_operation: ['Denmark', 'Kenya', 'Philippines', 'Germany', 'Brazil', 'Finland'],
        languages: ['Danish', 'English', 'Portuguese', 'German', 'Swahili'],
        sdg_tags: ['4', '10', '16', '17'],
        thematic_tags: ['Children\'s Rights', 'Global Citizenship', 'Cultural Exchange', 'Human Rights Education'],
        verification_status: 'verified',
        brand_settings: {
          allowLogoUsage: true,
          brandGuidelines: 'Please ensure our logo is used in accordance with our brand guidelines',
          approvedUseCase: 'Educational materials and program communications',
          restrictedUsage: 'Commercial use without permission is prohibited'
        },
        created_at: '2024-01-15T10:00:00Z',
        updated_at: '2024-03-10T15:30:00Z',
        is_active: true
      }

      setOrganization(sampleOrg)
    } catch (err) {
      console.error('Error loading organization profile:', err)
      setError('Failed to load organization profile')
    } finally {
      setLoading(false)
    }
  }

  const handleSaveProfile = (updatedOrganization: Organization) => {
    setOrganization(updatedOrganization)
    setIsEditing(false)
  }

  const handleStartEditing = () => {
    setIsEditing(true)
  }

  const handleCancelEditing = () => {
    setIsEditing(false)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
          <h2 className="text-lg font-semibold text-gray-900">Loading Profile</h2>
          <p className="text-gray-600">Please wait while we load your organization profile...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="p-6 text-center">
            <Building2 className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-lg font-semibold text-gray-900 mb-2">Error Loading Profile</h2>
            <p className="text-gray-600 mb-4">{error}</p>
            <Button onClick={loadOrganizationProfile} variant="outline">
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!organization) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="p-6 text-center">
            <Building2 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h2 className="text-lg font-semibold text-gray-900 mb-2">No Organization Profile</h2>
            <p className="text-gray-600 mb-4">
              You haven't created an organization profile yet. Would you like to create one?
            </p>
            <Button onClick={() => setIsEditing(true)}>
              Create Profile
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {isEditing ? (
          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-900">
                  {organization ? 'Edit Organization Profile' : 'Create Organization Profile'}
                </h1>
                <p className="text-gray-600 mt-2">
                  Update your organization's information to help schools and partners find and connect with you.
                </p>
              </div>
              
              <PartnerProfileForm
                organization={organization}
                onSave={handleSaveProfile}
                onCancel={handleCancelEditing}
                isEditing={!!organization}
              />
            </div>
          </div>
        ) : (
          <div className="max-w-6xl mx-auto">
            <PartnerProfileDashboard
              organization={organization}
              onEdit={handleStartEditing}
              isOwnProfile={true}
            />
          </div>
        )}
      </div>
    </div>
  )
}