'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { TabsContent } from '@/components/ui/tabs'
import {
  Mail,
  Users,
  School,
  UserPlus,
  Send,
} from 'lucide-react'

interface CountryCoordinator {
  id: string
  name: string
  country: string
  email: string
}

interface EducationalInstitution {
  id: string
  name: string
  country: string
  category: string
  pointOfContact: string
  email: string
}

interface NetworkTabProps {
  countryCoordinators: CountryCoordinator[]
  educationalInstitutions: EducationalInstitution[]
  showInviteCoordinatorDialog: boolean
  setShowInviteCoordinatorDialog: (show: boolean) => void
  showInviteInstitutionDialog: boolean
  setShowInviteInstitutionDialog: (show: boolean) => void
}

export function NetworkTab({
  countryCoordinators,
  educationalInstitutions,
  showInviteCoordinatorDialog,
  setShowInviteCoordinatorDialog,
  showInviteInstitutionDialog,
  setShowInviteInstitutionDialog,
}: NetworkTabProps) {
  return (
    <TabsContent value="network" className="space-y-6">
      {/* Country Coordinators Section */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-4 h-4" />
                Country Coordinators
              </CardTitle>
              <CardDescription>
                Manage your organization&apos;s country coordinators
              </CardDescription>
            </div>
            <Button className="bg-purple-600 hover:bg-purple-700" onClick={() => setShowInviteCoordinatorDialog(true)}>
              <UserPlus className="w-4 h-4 mr-2" />
              Invite Coordinator
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {countryCoordinators.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Name</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Country</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Email</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {countryCoordinators.map((coordinator) => (
                    <tr key={coordinator.id} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4">{coordinator.name}</td>
                      <td className="py-3 px-4">
                        <Badge variant="secondary">{coordinator.country}</Badge>
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-600">{coordinator.email}</td>
                      <td className="py-3 px-4">
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline">
                            <Mail className="w-3 h-3 mr-1" />
                            Contact
                          </Button>
                          <Button size="sm" variant="outline">
                            Edit
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-8">
              <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="font-medium text-gray-900 mb-2">No Country Coordinators</h3>
              <p className="text-gray-500 mb-4">
                Invite country coordinators to help manage your organization&apos;s regional presence.
              </p>
              <Button onClick={() => setShowInviteCoordinatorDialog(true)}>
                <UserPlus className="w-4 h-4 mr-2" />
                Invite First Coordinator
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Educational Institutions Section */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <School className="w-4 h-4" />
                Educational Institutions
              </CardTitle>
              <CardDescription>
                Schools, libraries, municipality centers and other educational partners
              </CardDescription>
            </div>
            <Button className="bg-purple-600 hover:bg-purple-700" onClick={() => setShowInviteInstitutionDialog(true)}>
              <UserPlus className="w-4 h-4 mr-2" />
              Invite Institution
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {educationalInstitutions.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Name</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Country</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Category</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Point of Contact</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {educationalInstitutions.map((institution) => (
                    <tr key={institution.id} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4 font-medium">{institution.name}</td>
                      <td className="py-3 px-4">
                        <Badge variant="secondary">{institution.country}</Badge>
                      </td>
                      <td className="py-3 px-4">
                        <Badge variant="outline">{institution.category}</Badge>
                      </td>
                      <td className="py-3 px-4">
                        <div className="text-sm">
                          <div className="font-medium">{institution.pointOfContact}</div>
                          <div className="text-gray-600">{institution.email}</div>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline">
                            <Mail className="w-3 h-3 mr-1" />
                            Contact
                          </Button>
                          <Button size="sm" variant="outline">
                            View
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-8">
              <School className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="font-medium text-gray-900 mb-2">No Educational Institutions</h3>
              <p className="text-gray-500 mb-4">
                Connect with schools, libraries, and other educational institutions.
              </p>
              <Button onClick={() => setShowInviteInstitutionDialog(true)}>
                <UserPlus className="w-4 h-4 mr-2" />
                Invite First Institution
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Invitation Dialogs Placeholder */}
      {showInviteCoordinatorDialog && (
        <Card className="border-purple-200 bg-purple-50">
          <CardContent className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold">Invite Country Coordinator</h3>
                <p className="text-sm text-gray-600 mt-1">Send an invitation to a country coordinator</p>
              </div>
              <Button variant="ghost" size="sm" onClick={() => setShowInviteCoordinatorDialog(false)}>
                ✕
              </Button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  placeholder="Coordinator name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  placeholder="coordinator@email.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Country</label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  placeholder="Country"
                />
              </div>
              <Button className="w-full bg-purple-600 hover:bg-purple-700">
                <Send className="w-4 h-4 mr-2" />
                Send Invitation
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {showInviteInstitutionDialog && (
        <Card className="border-purple-200 bg-purple-50">
          <CardContent className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold">Invite Educational Institution</h3>
                <p className="text-sm text-gray-600 mt-1">Send an invitation to an educational institution</p>
              </div>
              <Button variant="ghost" size="sm" onClick={() => setShowInviteInstitutionDialog(false)}>
                ✕
              </Button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Institution Name</label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  placeholder="School or institution name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-md">
                  <option>School</option>
                  <option>Library</option>
                  <option>Municipality Center</option>
                  <option>Cultural Center</option>
                  <option>Other</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Country</label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  placeholder="Country"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Point of Contact</label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  placeholder="Contact person name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Contact Email</label>
                <input
                  type="email"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  placeholder="contact@institution.edu"
                />
              </div>
              <Button className="w-full bg-purple-600 hover:bg-purple-700">
                <Send className="w-4 h-4 mr-2" />
                Send Invitation
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </TabsContent>
  )
}
