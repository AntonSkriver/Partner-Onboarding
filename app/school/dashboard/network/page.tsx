'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Users, School, UserPlus } from 'lucide-react'

const teachers = [
  { id: '1', name: 'Maria Hansen', email: 'maria@school.dk', subject: 'Social Studies', status: 'active', programName: 'Build the Change' },
  { id: '2', name: 'Peter Nielsen', email: 'peter@school.dk', subject: 'Science', status: 'active', programName: 'Communities in Focus' },
  { id: '3', name: 'Anna Larsen', email: 'anna@school.dk', subject: 'Languages', status: 'invited', programName: 'Build the Change' },
]

const partnerSchools = [
  { id: '1', name: 'Berlin International School', country: 'Germany', programName: 'Build the Change' },
  { id: '2', name: 'São Paulo Academy', country: 'Brazil', programName: 'Communities in Focus' },
]

export default function SchoolNetworkPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold text-gray-900">Network</h1>
        <p className="text-sm text-gray-600">
          Manage teachers and partner schools in your collaboration network.
        </p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-purple-600" />
                Teachers
              </CardTitle>
              <CardDescription>
                Educators from your school who collaborate across programs.
              </CardDescription>
            </div>
            <Button size="sm" className="bg-purple-600 hover:bg-purple-700">
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
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <School className="h-5 w-5 text-purple-600" />
                Partner Schools
              </CardTitle>
              <CardDescription>
                Schools you collaborate with inside your shared programs.
              </CardDescription>
            </div>
            <Button variant="outline" size="sm">
              Invite school
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {partnerSchools.map((school) => (
            <div
              key={school.id}
              className="flex flex-wrap items-center justify-between gap-4 rounded-lg border border-gray-200 p-4"
            >
              <div>
                <p className="font-semibold text-gray-900">
                  {school.name}{' '}
                  <span className="text-xs text-gray-500">· {school.programName}</span>
                </p>
                <p className="text-sm text-gray-600">{school.country}</p>
              </div>
              <Button variant="outline" size="sm">
                View profile
              </Button>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}
