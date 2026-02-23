'use client'

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { TabsContent } from '@/components/ui/tabs'
import {
  BarChart3,
  BookOpen,
  CheckCircle,
  Globe,
  GraduationCap,
  School,
  Target,
  Users,
} from 'lucide-react'
import type { ProgramSummary, PartnerProgramMetrics } from '@/lib/programs/selectors'

interface AnalyticsTabProps {
  programSummaries: ProgramSummary[]
  programMetrics: PartnerProgramMetrics
}

export function AnalyticsTab({ programSummaries, programMetrics }: AnalyticsTabProps) {
  return (
    <TabsContent value="analytics" className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900">Analytics & impact</h3>
        <p className="text-sm text-gray-600">
          Mirrors the partner profile analytics so your team sees the same insights.
        </p>
      </div>

      {programSummaries.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center text-sm text-gray-500">
            Join a program to unlock analytics.
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4 lg:grid-cols-7">
            <Card>
              <CardContent className="p-4 text-center">
                <Target className="mx-auto mb-2 h-6 w-6 text-blue-600" />
                <p className="text-2xl font-bold text-gray-900">
                  {programMetrics.activeProjects}
                </p>
                <p className="text-xs text-gray-600">Active projects</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <CheckCircle className="mx-auto mb-2 h-6 w-6 text-green-600" />
                <p className="text-2xl font-bold text-gray-900">
                  {programMetrics.completedProjects}
                </p>
                <p className="text-xs text-gray-600">Finished projects</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <Users className="mx-auto mb-2 h-6 w-6 text-purple-600" />
                <p className="text-2xl font-bold text-gray-900">
                  {programMetrics.teachers}
                </p>
                <p className="text-xs text-gray-600">Teachers engaged</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <GraduationCap className="mx-auto mb-2 h-6 w-6 text-orange-500" />
                <p className="text-2xl font-bold text-gray-900">
                  {programMetrics.students.toLocaleString()}
                </p>
                <p className="text-xs text-gray-600">Students reached</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <School className="mx-auto mb-2 h-6 w-6 text-indigo-600" />
                <p className="text-2xl font-bold text-gray-900">
                  {programMetrics.institutions}
                </p>
                <p className="text-xs text-gray-600">Institutions connected</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <BookOpen className="mx-auto mb-2 h-6 w-6 text-pink-600" />
                <p className="text-2xl font-bold text-gray-900">
                  {programSummaries.length}
                </p>
                <p className="text-xs text-gray-600">Programs joined</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <Globe className="mx-auto mb-2 h-6 w-6 text-teal-600" />
                <p className="text-2xl font-bold text-gray-900">
                  {programMetrics.countryCount}
                </p>
                <p className="text-xs text-gray-600">Countries</p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Program Performance
              </CardTitle>
              <CardDescription>
                Top programs ranked by student engagement
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {programSummaries
                .slice()
                .sort((a, b) => b.metrics.studentCount - a.metrics.studentCount)
                .slice(0, 4)
                .map((summary, index) => (
                  <div key={summary.program.id} className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-purple-100 font-semibold text-purple-700">
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-gray-900">
                        {summary.program.displayTitle ?? summary.program.name}
                      </p>
                      <p className="text-xs text-gray-600">
                        {summary.metrics.studentCount.toLocaleString()} students ·{' '}
                        {summary.metrics.institutionCount} schools
                      </p>
                    </div>
                  </div>
                ))}
            </CardContent>
          </Card>
        </>
      )}
    </TabsContent>
  )
}
