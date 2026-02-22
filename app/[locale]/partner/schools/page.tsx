'use client'

import type { JSX } from 'react'
import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  School, 
  Mail, 
  Globe, 
  Clock,
  CheckCircle,
  XCircle,
  Send,
  Plus,
  Calendar,
  ArrowLeft,
  AlertCircle,
  Users,
  Trash2,
  RefreshCw,
  Layers
} from 'lucide-react'
import { Link } from '@/i18n/navigation'

interface Invitation {
  invitationId: string
  schoolName: string
  contactEmail: string
  contactName?: string
  country: string
  countryCode?: string
  partnerName: string
  partnerId?: string
  programId?: string
  programName?: string
  customMessage?: string
  invitedAt: string
  status: 'sent' | 'accepted' | 'declined'
  acceptedAt?: string
  inviteUrl: string
}

export default function PartnerSchoolsPage() {
  const [invitations, setInvitations] = useState<Invitation[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadInvitations()
  }, [])

  const loadInvitations = () => {
    try {
      const sentInvitations = JSON.parse(localStorage.getItem('sentInvitations') || '[]')
      setInvitations(sentInvitations)
    } catch (error) {
      console.error('Error loading invitations:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleResendInvitation = async (invitation: Invitation) => {
    try {
      // Simulate resending invitation
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Update invitation timestamp
      const updatedInvitations = invitations.map(inv => 
        inv.invitationId === invitation.invitationId 
          ? { ...inv, invitedAt: new Date().toISOString() }
          : inv
      )
      
      setInvitations(updatedInvitations)
      localStorage.setItem('sentInvitations', JSON.stringify(updatedInvitations))
    } catch (error) {
      console.error('Error resending invitation:', error)
    }
  }

  const handleDeleteInvitation = (invitationId: string) => {
    const updatedInvitations = invitations.filter(inv => inv.invitationId !== invitationId)
    setInvitations(updatedInvitations)
    localStorage.setItem('sentInvitations', JSON.stringify(updatedInvitations))
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'accepted': return 'bg-green-100 text-green-800'
      case 'declined': return 'bg-red-100 text-red-800'
      case 'sent': return 'bg-blue-100 text-blue-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'accepted': return <CheckCircle className="h-4 w-4" />
      case 'declined': return <XCircle className="h-4 w-4" />
      case 'sent': return <Clock className="h-4 w-4" />
      default: return <AlertCircle className="h-4 w-4" />
    }
  }

  const sentInvitations = invitations.filter(inv => inv.status === 'sent')
  const acceptedInvitations = invitations.filter(inv => inv.status === 'accepted')
  const declinedInvitations = invitations.filter(inv => inv.status === 'declined')

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading invitations...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-4">
              <Link href="/partner/dashboard">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Dashboard
                </Button>
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">School Invitations</h1>
                <p className="text-gray-600">Manage and track your school partnership invitations</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <Button variant="outline" onClick={loadInvitations}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
              <Link href="/partner/schools/invite">
                <Button className="bg-purple-600 hover:bg-purple-700">
                  <Plus className="h-4 w-4 mr-2" />
                  Invite Schools
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <Send className="h-4 w-4 text-blue-600" />
                </div>
                <div className="ml-4">
                  <div className="text-2xl font-bold text-gray-900">{invitations.length}</div>
                  <div className="text-sm text-gray-600">Total Sent</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                  <Clock className="h-4 w-4 text-yellow-600" />
                </div>
                <div className="ml-4">
                  <div className="text-2xl font-bold text-gray-900">{sentInvitations.length}</div>
                  <div className="text-sm text-gray-600">Pending</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                </div>
                <div className="ml-4">
                  <div className="text-2xl font-bold text-gray-900">{acceptedInvitations.length}</div>
                  <div className="text-sm text-gray-600">Accepted</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                  <Users className="h-4 w-4 text-purple-600" />
                </div>
                <div className="ml-4">
                  <div className="text-2xl font-bold text-gray-900">
                    {acceptedInvitations.length > 0 ? `${Math.round((acceptedInvitations.length / invitations.length) * 100)}%` : '0%'}
                  </div>
                  <div className="text-sm text-gray-600">Accept Rate</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {invitations.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <School className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No School Invitations Yet</h3>
              <p className="text-gray-600 mb-6 max-w-md mx-auto">
                Start building your school network by sending invitations to schools you'd like to collaborate with.
              </p>
              <Link href="/partner/schools/invite">
                <Button className="bg-purple-600 hover:bg-purple-700">
                  <Plus className="h-4 w-4 mr-2" />
                  Send Your First Invitation
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <Tabs defaultValue="all" className="space-y-6">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="all">All ({invitations.length})</TabsTrigger>
              <TabsTrigger value="pending">Pending ({sentInvitations.length})</TabsTrigger>
              <TabsTrigger value="accepted">Accepted ({acceptedInvitations.length})</TabsTrigger>
              <TabsTrigger value="declined">Declined ({declinedInvitations.length})</TabsTrigger>
            </TabsList>

            <TabsContent value="all">
              <InvitationsList 
                invitations={invitations} 
                onResend={handleResendInvitation}
                onDelete={handleDeleteInvitation}
                getStatusColor={getStatusColor}
                getStatusIcon={getStatusIcon}
                formatDate={formatDate}
              />
            </TabsContent>

            <TabsContent value="pending">
              <InvitationsList 
                invitations={sentInvitations} 
                onResend={handleResendInvitation}
                onDelete={handleDeleteInvitation}
                getStatusColor={getStatusColor}
                getStatusIcon={getStatusIcon}
                formatDate={formatDate}
              />
            </TabsContent>

            <TabsContent value="accepted">
              <InvitationsList 
                invitations={acceptedInvitations} 
                onResend={handleResendInvitation}
                onDelete={handleDeleteInvitation}
                getStatusColor={getStatusColor}
                getStatusIcon={getStatusIcon}
                formatDate={formatDate}
              />
            </TabsContent>

            <TabsContent value="declined">
              <InvitationsList 
                invitations={declinedInvitations} 
                onResend={handleResendInvitation}
                onDelete={handleDeleteInvitation}
                getStatusColor={getStatusColor}
                getStatusIcon={getStatusIcon}
                formatDate={formatDate}
              />
            </TabsContent>
          </Tabs>
        )}
      </div>
    </div>
  )
}

interface InvitationsListProps {
  invitations: Invitation[]
  onResend: (invitation: Invitation) => void
  onDelete: (invitationId: string) => void
  getStatusColor: (status: string) => string
  getStatusIcon: (status: string) => JSX.Element
  formatDate: (dateString: string) => string
}

function InvitationsList({ 
  invitations, 
  onResend, 
  onDelete, 
  getStatusColor, 
  getStatusIcon, 
  formatDate 
}: InvitationsListProps) {
  if (invitations.length === 0) {
    return (
      <Card>
        <CardContent className="text-center py-8">
          <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">No invitations found in this category.</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {invitations.map((invitation) => (
        <Card key={invitation.invitationId} className="hover:shadow-lg transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <School className="h-5 w-5 text-blue-600" />
                  <h3 className="text-lg font-semibold text-gray-900">{invitation.schoolName}</h3>
                  <Badge className={`${getStatusColor(invitation.status)} flex items-center gap-1`}>
                    {getStatusIcon(invitation.status)}
                    {invitation.status.charAt(0).toUpperCase() + invitation.status.slice(1)}
                  </Badge>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm text-gray-600 mb-4">
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    <span>{invitation.contactEmail}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Globe className="h-4 w-4" />
                    <span>{invitation.country}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Layers className="h-4 w-4" />
                    <span>{invitation.programName || 'Program pending'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    <span>Sent {formatDate(invitation.invitedAt)}</span>
                  </div>
                </div>

                {invitation.acceptedAt && (
                  <div className="flex items-center gap-2 text-sm text-green-600 mb-2">
                    <CheckCircle className="h-4 w-4" />
                    <span>Accepted {formatDate(invitation.acceptedAt)}</span>
                  </div>
                )}

                {invitation.customMessage && (
                  <div className="bg-gray-50 rounded-lg p-3 mb-4">
                    <p className="text-sm text-gray-700 italic">
                      &ldquo;{invitation.customMessage.substring(0, 150)}
                      {invitation.customMessage.length > 150 ? '...' : ''}&rdquo;
                    </p>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2 ml-4">
                {invitation.status === 'sent' && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onResend(invitation)}
                  >
                    <RefreshCw className="h-4 w-4 mr-1" />
                    Resend
                  </Button>
                )}
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onDelete(invitation.invitationId)}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
