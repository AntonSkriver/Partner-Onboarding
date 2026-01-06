'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  School, 
  Building, 
  CheckCircle, 
  ArrowRight, 
  Mail, 
  Globe,
  Target,
  Users,
  AlertCircle,
  Heart,
  Layers
} from 'lucide-react'
import Link from 'next/link'

interface Invitation {
  invitationId: string
  schoolName: string
  contactEmail: string
  contactName?: string
  country: string
  partnerName: string
  programId?: string
  programName?: string
  customMessage?: string
  invitedAt: string
  status: 'sent' | 'accepted' | 'declined'
  inviteUrl: string
}

export default function SchoolInvitePage() {
  const router = useRouter()
  const params = useParams()
  const [invitation, setInvitation] = useState<Invitation | null>(null)
  const [loading, setLoading] = useState(true)
  const [accepting, setAccepting] = useState(false)

  useEffect(() => {
    const loadInvitation = () => {
      try {
        const inviteId = params?.inviteId as string
        if (!inviteId) {
          setLoading(false)
          return
        }

        // Get stored invitations from localStorage (in real app, this would be from API)
        const sentInvitations = JSON.parse(localStorage.getItem('sentInvitations') || '[]')
        
        // Find invitation by email (since inviteId is encoded email)
        const decodedEmail = inviteId.replace('_at_', '@').replace('_dot_', '.')
        const foundInvitation = sentInvitations.find((inv: Invitation) => 
          inv.contactEmail === decodedEmail
        )

        if (foundInvitation) {
          setInvitation(foundInvitation)
        }
      } catch (error) {
        console.error('Error loading invitation:', error)
      } finally {
        setLoading(false)
      }
    }

    loadInvitation()
  }, [params])

  const handleAcceptInvitation = async () => {
    if (!invitation) return

    setAccepting(true)
    try {
      // Simulate processing delay
      await new Promise(resolve => setTimeout(resolve, 1500))

      // Update invitation status
      const sentInvitations = JSON.parse(localStorage.getItem('sentInvitations') || '[]')
      const updatedInvitations = sentInvitations.map((inv: Invitation) => 
        inv.contactEmail === invitation.contactEmail 
          ? { ...inv, status: 'accepted', acceptedAt: new Date().toISOString() }
          : inv
      )
      localStorage.setItem('sentInvitations', JSON.stringify(updatedInvitations))

      // Store invitation acceptance data for school onboarding
      localStorage.setItem('pendingInvitationAcceptance', JSON.stringify({
        ...invitation,
        acceptedAt: new Date().toISOString()
      }))

      // Redirect to school onboarding with pre-filled data
      router.push('/school/onboarding?from=invitation')
      
    } catch (error) {
      console.error('Error accepting invitation:', error)
    } finally {
      setAccepting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="max-w-md w-full mx-4">
          <CardContent className="text-center p-8">
            <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Loading invitation...</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!invitation) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardContent className="text-center p-8">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="h-8 w-8 text-red-600" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Invitation Not Found</h2>
            <p className="text-gray-600 mb-6">
              This invitation link may have expired or is invalid. Please contact the partner organization for a new invitation.
            </p>
            <Link href="/">
              <Button className="w-full bg-blue-600 hover:bg-blue-700">
                Go to Class2Class Homepage
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (invitation.status === 'accepted') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardContent className="text-center p-8">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Already Accepted</h2>
            <p className="text-gray-600 mb-6">
              This invitation has already been accepted. You can sign in to your Class2Class account to access your dashboard.
            </p>
            <Link href="/sign-in">
              <Button className="w-full bg-blue-600 hover:bg-blue-700">
                Sign In to Dashboard
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="flex items-center justify-center">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-bold">C2C</span>
              </div>
              <span className="text-xl font-semibold text-gray-900">Class2Class</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto p-4 py-8">
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Mail className="h-10 w-10 text-blue-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            You're Invited to Join Class2Class!
          </h1>
          <p className="text-xl text-gray-600">
            Connect your school with global educational opportunities
          </p>
        </div>

        {/* Partner Information */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building className="h-5 w-5 text-purple-600" />
              Invitation from {invitation.partnerName}
            </CardTitle>
            <CardDescription>
              You've been invited to join the Class2Class global education network
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <School className="h-5 w-5 text-blue-600" />
                <div>
                  <p className="font-medium text-gray-900">School: {invitation.schoolName}</p>
                  <p className="text-sm text-gray-600">{invitation.country}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <Mail className="h-5 w-5 text-gray-500" />
                <p className="text-gray-700">{invitation.contactEmail}</p>
              </div>

              {invitation.programName && (
                <div className="flex items-center gap-3">
                  <Layers className="h-5 w-5 text-purple-600" />
                  <p className="text-gray-700">Program: {invitation.programName}</p>
                </div>
              )}

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-semibold text-blue-900 mb-2">Personal Message:</h4>
                <p className="text-blue-800 text-sm italic">
                  {invitation.customMessage || 'We would love to invite your school to join our partnership program with Class2Class. This platform enables meaningful educational collaborations between classrooms worldwide.'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* What You'll Get */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>What Your School Will Gain</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <Globe className="h-4 w-4 text-green-600" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">Global Connections</h4>
                  <p className="text-sm text-gray-600">Connect with schools in 50+ countries for cultural exchange</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <Target className="h-4 w-4 text-purple-600" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">SDG-Aligned Projects</h4>
                  <p className="text-sm text-gray-600">Participate in meaningful projects supporting UN goals</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <Users className="h-4 w-4 text-blue-600" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">Collaborative Learning</h4>
                  <p className="text-sm text-gray-600">Engage students in international collaborative projects</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <Heart className="h-4 w-4 text-yellow-600" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">Educational Resources</h4>
                  <p className="text-sm text-gray-600">Access curated educational content and project templates</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Partnership Badge */}
        <div className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-lg p-6 text-white mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold mb-2">Partnership Program</h3>
              <p className="text-purple-100">
                Join as a partner school under {invitation.partnerName} to access exclusive collaborative opportunities
              </p>
            </div>
            <Badge className="bg-white text-purple-600 px-3 py-1">
              Exclusive Access
            </Badge>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-4">
          <Button 
            onClick={handleAcceptInvitation}
            disabled={accepting}
            size="lg"
            className="w-full bg-blue-600 hover:bg-blue-700 text-lg py-3"
          >
            {accepting ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                Accepting Invitation...
              </>
            ) : (
              <>
                Accept Invitation & Join Class2Class
                <ArrowRight className="ml-2 h-5 w-5" />
              </>
            )}
          </Button>

          <div className="text-center">
            <p className="text-sm text-gray-600 mb-4">
              By accepting, you'll be taken to complete your school registration
            </p>
            <Link href="/" className="text-blue-600 hover:text-blue-700 text-sm">
              Learn more about Class2Class
            </Link>
          </div>
        </div>

        <Alert className="mt-6">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <strong>Need help?</strong> Contact your partner organization directly or reach out to our support team at support@class2class.org
          </AlertDescription>
        </Alert>
      </div>
    </div>
  )
}
