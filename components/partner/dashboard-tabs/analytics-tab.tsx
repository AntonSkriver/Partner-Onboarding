'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { TabsContent } from '@/components/ui/tabs'
import {
  Globe,
  Users,
  BookOpen,
  BarChart3,
  CheckCircle,
  School,
  GraduationCap,
  Target,
} from 'lucide-react'
import type { ProgramSummary, PartnerProgramMetrics } from '@/lib/programs/selectors'

interface AnalyticsTabProps {
  programMetrics: PartnerProgramMetrics
  programSummaries: ProgramSummary[]
}

export function AnalyticsTab({
  programMetrics,
  programSummaries,
}: AnalyticsTabProps) {
  return (
    <TabsContent value="analytics" className="space-y-6">
      {/* Key Metrics Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
        {/* Active Projects */}
        <Card>
          <CardContent className="p-4 text-center">
            <Target className="w-6 h-6 text-blue-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-gray-900">{programMetrics.activeProjects}</div>
            <div className="text-xs text-gray-600 mt-1">Active Projects</div>
          </CardContent>
        </Card>

        {/* Finished Projects */}
        <Card>
          <CardContent className="p-4 text-center">
            <CheckCircle className="w-6 h-6 text-green-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-gray-900">{programMetrics.completedProjects}</div>
            <div className="text-xs text-gray-600 mt-1">Finished Projects</div>
          </CardContent>
        </Card>

        {/* Teachers */}
        <Card>
          <CardContent className="p-4 text-center">
            <Users className="w-6 h-6 text-purple-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-gray-900">{programMetrics.teachers}</div>
            <div className="text-xs text-gray-600 mt-1">Teachers</div>
          </CardContent>
        </Card>

        {/* Students */}
        <Card>
          <CardContent className="p-4 text-center">
            <GraduationCap className="w-6 h-6 text-orange-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-gray-900">{programMetrics.students.toLocaleString()}</div>
            <div className="text-xs text-gray-600 mt-1">Students</div>
          </CardContent>
        </Card>

        {/* Institutions */}
        <Card>
          <CardContent className="p-4 text-center">
            <School className="w-6 h-6 text-indigo-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-gray-900">{programMetrics.institutions}</div>
            <div className="text-xs text-gray-600 mt-1">Institutions</div>
          </CardContent>
        </Card>

        {/* Programs */}
        <Card>
          <CardContent className="p-4 text-center">
            <BookOpen className="w-6 h-6 text-pink-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-gray-900">{programSummaries.length}</div>
            <div className="text-xs text-gray-600 mt-1">Programs</div>
          </CardContent>
        </Card>

        {/* Country Reach */}
        <Card>
          <CardContent className="p-4 text-center">
            <Globe className="w-6 h-6 text-teal-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-gray-900">{programMetrics.countryCount}</div>
            <div className="text-xs text-gray-600 mt-1">Countries</div>
          </CardContent>
        </Card>
      </div>

      {/* Program Performance */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5" />
            Program Performance
          </CardTitle>
          <CardDescription>
            Top performing programs by student engagement
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {programSummaries.slice(0, 3).map(({ program, metrics }, index) => (
              <div key={program.id} className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-purple-100 text-purple-700 flex items-center justify-center font-semibold text-sm">
                  {index + 1}
                </div>
                <div className="flex-1">
                  <div className="font-medium text-gray-900 text-sm">
                    {program.displayTitle ?? program.name}
                  </div>
                  <div className="text-xs text-gray-600">
                    {metrics.studentCount} students • {metrics.institutionCount} institutions
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-semibold text-green-600">
                    {metrics.activeProjectCount} active
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </TabsContent>
  )
}
