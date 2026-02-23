'use client'

import {
  Card,
  CardContent,
  CardDescription,
  CardTitle,
  CardHeader,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { TabsContent } from '@/components/ui/tabs'
import {
  School,
  Users,
  UserPlus,
} from 'lucide-react'
import type { ProgramSummary } from '@/lib/programs/selectors'

type TeacherEntry = {
  id: string
  name: string
  email: string
  subject: string
  status: string
  programName: string
}

type PartnerSchoolEntry = {
  id: string
  name: string
  country?: string
  programName: string
}

interface NetworkTabProps {
  teachers: TeacherEntry[]
  partnerSchools: PartnerSchoolEntry[]
  programSummaries: ProgramSummary[]
  showInviteTeacherDialog: boolean
  setShowInviteTeacherDialog: (value: boolean) => void
  showInviteSchoolDialog: boolean
  setShowInviteSchoolDialog: (value: boolean) => void
}

export function NetworkTab({
  teachers,
  partnerSchools,
  programSummaries,
  showInviteTeacherDialog,
  setShowInviteTeacherDialog,
  showInviteSchoolDialog,
  setShowInviteSchoolDialog,
}: NetworkTabProps) {
  return (
    <TabsContent value="network" className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-purple-600" />
                Teachers
              </CardTitle>
              <CardDescription>
                Manage the educators from your school who collaborate across programs.
              </CardDescription>
            </div>
            <Button
              onClick={() => setShowInviteTeacherDialog(true)}
              size="sm"
              className="bg-purple-600 hover:bg-purple-700"
            >
              <UserPlus className="mr-2 h-4 w-4" />
              Invite teacher
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {teachers.map((teacher) => (
            <div
              key={teacher.id}
              className="flex flex-wrap items-center justify-between gap-4 rounded-lg border border-gray-200 p-4"
            >
              <div>
                <p className="font-semibold text-gray-900">
                  {teacher.name}{' '}
                  <span className="text-xs text-gray-500">· {teacher.programName}</span>
                </p>
                <p className="text-sm text-gray-600">
                  {teacher.subject} • {teacher.email}
                </p>
              </div>
              <Badge variant={teacher.status === 'active' ? 'default' : 'secondary'}>
                {teacher.status}
              </Badge>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <CardTitle className="flex items-center gap-2">
                <School className="h-5 w-5 text-purple-600" />
                Partner schools
              </CardTitle>
              <CardDescription>
                Schools you collaborate with inside your shared programs.
              </CardDescription>
            </div>
            <Button variant="outline" size="sm" onClick={() => setShowInviteSchoolDialog(true)}>
              Invite school
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {partnerSchools.map((partnerSchool) => (
            <div
              key={partnerSchool.id}
              className="flex flex-wrap items-center justify-between gap-4 rounded-lg border border-gray-200 p-4"
            >
              <div>
                <p className="font-semibold text-gray-900">
                  {partnerSchool.name}{' '}
                  <span className="text-xs text-gray-500">· {partnerSchool.programName}</span>
                </p>
                <p className="text-sm text-gray-600">
                  {partnerSchool.country ?? 'Country coming soon'}
                </p>
              </div>
              <Button variant="outline" size="sm">
                View profile
              </Button>
            </div>
          ))}
        </CardContent>
      </Card>

      {showInviteTeacherDialog && (
        <Card className="border-purple-200 bg-purple-50">
          <CardContent className="space-y-4 p-6">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Invite teacher</h3>
                <p className="text-sm text-gray-600">
                  Send an invitation to bring a new teacher into your programs.
                </p>
              </div>
              <Button variant="ghost" size="sm" onClick={() => setShowInviteTeacherDialog(false)}>
                Close
              </Button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium text-gray-700">Name</label>
                <input
                  className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                  placeholder="Teacher name"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Email</label>
                <input
                  type="email"
                  className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                  placeholder="teacher@email.com"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Program</label>
                <select className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm">
                  {programSummaries.map((summary) => (
                    <option key={summary.program.id}>{summary.program.displayTitle ?? summary.program.name}</option>
                  ))}
                  {programSummaries.length === 0 && <option>Program selection coming soon</option>}
                </select>
              </div>
              <Button className="w-full bg-purple-600 hover:bg-purple-700">
                <UserPlus className="mr-2 h-4 w-4" />
                Send invite
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {showInviteSchoolDialog && (
        <Card className="border-purple-200 bg-purple-50">
          <CardContent className="space-y-4 p-6">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Invite partner school</h3>
                <p className="text-sm text-gray-600">
                  Share your program workspace with another school you want to collaborate with.
                </p>
              </div>
              <Button variant="ghost" size="sm" onClick={() => setShowInviteSchoolDialog(false)}>
                Close
              </Button>
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              <div className="md:col-span-2">
                <label className="text-sm font-medium text-gray-700">School name</label>
                <input
                  className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                  placeholder="International School Name"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Country</label>
                <input
                  className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                  placeholder="Country"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Primary contact email</label>
                <input
                  type="email"
                  className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                  placeholder="contact@school.org"
                />
              </div>
              <div className="md:col-span-2">
                <label className="text-sm font-medium text-gray-700">Program</label>
                <select className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm">
                  {programSummaries.map((summary) => (
                    <option key={summary.program.id}>{summary.program.displayTitle ?? summary.program.name}</option>
                  ))}
                  {programSummaries.length === 0 && <option>Program selection coming soon</option>}
                </select>
              </div>
            </div>
            <Button className="w-full bg-purple-600 hover:bg-purple-700">
              <UserPlus className="mr-2 h-4 w-4" />
              Send invite
            </Button>
          </CardContent>
        </Card>
      )}
    </TabsContent>
  )
}
