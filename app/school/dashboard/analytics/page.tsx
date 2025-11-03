'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Target, CheckCircle, Users, GraduationCap, School, BookOpen, Globe } from 'lucide-react'

export default function SchoolAnalyticsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold text-gray-900">Analytics</h1>
        <p className="text-sm text-gray-600">
          Track your program performance and impact metrics.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4 lg:grid-cols-7">
        <Card>
          <CardContent className="p-4 text-center">
            <Target className="mx-auto mb-2 h-6 w-6 text-purple-600" />
            <p className="text-2xl font-bold text-gray-900">2</p>
            <p className="text-xs text-gray-600">Active projects</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <CheckCircle className="mx-auto mb-2 h-6 w-6 text-green-600" />
            <p className="text-2xl font-bold text-gray-900">1</p>
            <p className="text-xs text-gray-600">Finished projects</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <Users className="mx-auto mb-2 h-6 w-6 text-purple-600" />
            <p className="text-2xl font-bold text-gray-900">3</p>
            <p className="text-xs text-gray-600">Teachers engaged</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <GraduationCap className="mx-auto mb-2 h-6 w-6 text-orange-500" />
            <p className="text-2xl font-bold text-gray-900">120</p>
            <p className="text-xs text-gray-600">Students reached</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <School className="mx-auto mb-2 h-6 w-6 text-indigo-600" />
            <p className="text-2xl font-bold text-gray-900">2</p>
            <p className="text-xs text-gray-600">Partner schools</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <BookOpen className="mx-auto mb-2 h-6 w-6 text-pink-600" />
            <p className="text-2xl font-bold text-gray-900">2</p>
            <p className="text-xs text-gray-600">Programs joined</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <Globe className="mx-auto mb-2 h-6 w-6 text-teal-600" />
            <p className="text-2xl font-bold text-gray-900">3</p>
            <p className="text-xs text-gray-600">Countries</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
