'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import {
  Target,
  CheckCircle,
  Users,
  GraduationCap,
  BookOpen,
  Globe,
  Map as MapIcon,
  Handshake,
  TrendingUp,
  FileText,
  Video,
  MessageSquare,
  Star,
  Clock,
  Sparkles,
  Heart,
  Award,
  Lightbulb,
} from 'lucide-react'

export default function SchoolAnalyticsPage() {
  // Impact hero numbers
  const impactStats = {
    totalStudents: 120,
    totalHours: 480,
    projectsCompleted: 1,
    countriesConnected: 4,
  }

  // Program engagement data
  const programs = [
    {
      name: 'Build the Change 2025',
      partner: 'Save the Children',
      color: 'bg-red-500',
      students: 75,
      progress: 65,
      resources: { used: 12, total: 18 },
      projects: 2,
      status: 'active',
    },
    {
      name: 'Communities in Focus',
      partner: 'UNICEF Denmark',
      color: 'bg-cyan-500',
      students: 45,
      progress: 40,
      resources: { used: 8, total: 15 },
      projects: 2,
      status: 'active',
    },
  ]

  // Project timeline
  const projectTimeline = [
    {
      name: 'City Guardians',
      status: 'active',
      students: 45,
      partner: 'São Paulo Makerspace School',
      country: 'Brazil',
      flag: '🇧🇷',
      startDate: 'Jan 2025',
      progress: 70,
      milestones: { completed: 5, total: 7 },
    },
    {
      name: 'Teen Voices',
      status: 'active',
      students: 35,
      partner: 'Punti di Luce Palermo',
      country: 'Italy',
      flag: '🇮🇹',
      startDate: 'Feb 2025',
      progress: 55,
      milestones: { completed: 4, total: 8 },
    },
    {
      name: 'Digital Rights',
      status: 'active',
      students: 25,
      partner: 'Mexico City Creative School',
      country: 'Mexico',
      flag: '🇲🇽',
      startDate: 'Feb 2025',
      progress: 45,
      milestones: { completed: 3, total: 6 },
    },
    {
      name: 'Climate Action',
      status: 'completed',
      students: 15,
      partner: 'Bangalore Global School',
      country: 'India',
      flag: '🇮🇳',
      startDate: 'Sep 2024',
      progress: 100,
      milestones: { completed: 6, total: 6 },
    },
  ]

  // Resource usage
  const resourceUsage = [
    { type: 'Lesson Plans', icon: FileText, used: 14, color: 'text-purple-600', bgColor: 'bg-purple-100' },
    { type: 'Video Guides', icon: Video, used: 8, color: 'text-blue-600', bgColor: 'bg-blue-100' },
    { type: 'Discussion Prompts', icon: MessageSquare, used: 22, color: 'text-amber-600', bgColor: 'bg-amber-100' },
    { type: 'Assessment Tools', icon: Target, used: 6, color: 'text-emerald-600', bgColor: 'bg-emerald-100' },
  ]

  // Skills developed
  const skillsData = [
    { skill: 'Global Citizenship', level: 85, color: 'bg-purple-500' },
    { skill: 'Critical Thinking', level: 78, color: 'bg-blue-500' },
    { skill: 'Collaboration', level: 92, color: 'bg-emerald-500' },
    { skill: 'Digital Literacy', level: 70, color: 'bg-amber-500' },
    { skill: 'Cultural Awareness', level: 88, color: 'bg-pink-500' },
  ]

  // Monthly engagement (simplified bar chart)
  const monthlyEngagement = [
    { month: 'Sep', students: 15, hours: 45 },
    { month: 'Oct', students: 35, hours: 105 },
    { month: 'Nov', students: 55, hours: 165 },
    { month: 'Dec', students: 75, hours: 200 },
    { month: 'Jan', students: 95, hours: 320 },
    { month: 'Feb', students: 120, hours: 480 },
  ]
  const maxHours = Math.max(...monthlyEngagement.map(m => m.hours))

  // Country connections
  const countryConnections = [
    { country: 'Brazil', flag: '🇧🇷', students: 45, exchanges: 12 },
    { country: 'Italy', flag: '🇮🇹', students: 35, exchanges: 8 },
    { country: 'Mexico', flag: '🇲🇽', students: 25, exchanges: 6 },
    { country: 'India', flag: '🇮🇳', students: 15, exchanges: 4 },
  ]

  // Teacher engagement
  const teacherStats = [
    { name: 'Anne Holm', projects: 2, hours: 120, avatar: 'AH' },
    { name: 'Jonas Madsen', projects: 1, hours: 85, avatar: 'JM' },
    { name: 'Sofie Larsen', projects: 1, hours: 65, avatar: 'SL' },
  ]

  return (
    <div className="space-y-10">
      {/* Hero Header */}
      <header className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-purple-600 via-purple-700 to-indigo-800 p-8 text-white">
        <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] opacity-10" />
        <div className="relative">
          <div className="flex items-center gap-2 text-purple-200">
            <Sparkles className="h-5 w-5" />
            <span className="text-sm font-medium">Your School&apos;s Global Impact</span>
          </div>
          <h1 className="mt-2 text-3xl font-bold">Impact & Analytics</h1>
          <p className="mt-2 max-w-xl text-purple-100">
            Track your school&apos;s journey in global education. See how your students are connecting,
            learning, and making a difference across borders.
          </p>

          {/* Hero Stats */}
          <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
            <div className="rounded-xl bg-white/10 p-4 backdrop-blur">
              <div className="flex items-center gap-2">
                <GraduationCap className="h-5 w-5 text-purple-200" />
                <span className="text-3xl font-bold">{impactStats.totalStudents}</span>
              </div>
              <p className="mt-1 text-sm text-purple-200">Students Engaged</p>
            </div>
            <div className="rounded-xl bg-white/10 p-4 backdrop-blur">
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-purple-200" />
                <span className="text-3xl font-bold">{impactStats.totalHours}</span>
              </div>
              <p className="mt-1 text-sm text-purple-200">Learning Hours</p>
            </div>
            <div className="rounded-xl bg-white/10 p-4 backdrop-blur">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-purple-200" />
                <span className="text-3xl font-bold">4</span>
              </div>
              <p className="mt-1 text-sm text-purple-200">Active Projects</p>
            </div>
            <div className="rounded-xl bg-white/10 p-4 backdrop-blur">
              <div className="flex items-center gap-2">
                <Globe className="h-5 w-5 text-purple-200" />
                <span className="text-3xl font-bold">{impactStats.countriesConnected}</span>
              </div>
              <p className="mt-1 text-sm text-purple-200">Countries Connected</p>
            </div>
          </div>
        </div>
      </header>

      {/* Program Engagement */}
      <section>
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Program Engagement</h2>
            <p className="text-sm text-gray-500">How your school is participating in each program</p>
          </div>
          <Badge variant="secondary" className="bg-purple-100 text-purple-700">
            {programs.length} Active Programs
          </Badge>
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          {programs.map((program) => (
            <Card key={program.name} className="overflow-hidden">
              <div className={`h-1.5 ${program.color}`} />
              <CardContent className="p-5">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold text-gray-900">{program.name}</h3>
                    <p className="text-sm text-gray-500">by {program.partner}</p>
                  </div>
                  <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                    Active
                  </Badge>
                </div>

                <div className="mt-4 grid grid-cols-3 gap-4">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-gray-900">{program.students}</p>
                    <p className="text-xs text-gray-500">Students</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-gray-900">{program.projects}</p>
                    <p className="text-xs text-gray-500">Projects</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-gray-900">{program.resources.used}</p>
                    <p className="text-xs text-gray-500">Resources Used</p>
                  </div>
                </div>

                <div className="mt-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Program Progress</span>
                    <span className="font-medium text-gray-900">{program.progress}%</span>
                  </div>
                  <Progress value={program.progress} className="mt-2 h-2" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Engagement Over Time */}
      <section>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-purple-600" />
              Student Engagement Over Time
            </CardTitle>
            <CardDescription>Monthly growth in student participation and learning hours</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-end gap-3 h-48">
              {monthlyEngagement.map((month) => {
                const heightPercent = (month.hours / maxHours) * 100
                return (
                  <div key={month.month} className="flex-1 flex flex-col items-center gap-2">
                    <div className="w-full flex flex-col items-center justify-end h-36">
                      <span className="text-xs font-medium text-gray-600 mb-1">{month.hours}h</span>
                      <div
                        className="w-full rounded-t-lg bg-gradient-to-t from-purple-600 to-purple-400 transition-all duration-500"
                        style={{ height: `${heightPercent}%`, minHeight: '8px' }}
                      />
                    </div>
                    <div className="text-center">
                      <p className="text-xs font-medium text-gray-900">{month.month}</p>
                      <p className="text-xs text-gray-500">{month.students} students</p>
                    </div>
                  </div>
                )
              })}
            </div>
            <div className="mt-6 flex items-center justify-center gap-8 border-t pt-4">
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-purple-500" />
                <span className="text-sm text-gray-600">Learning Hours</span>
              </div>
              <div className="text-center">
                <span className="text-lg font-bold text-purple-600">+700%</span>
                <span className="ml-2 text-sm text-gray-500">growth since September</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Projects & Resources Grid */}
      <section className="grid gap-6 lg:grid-cols-[2fr,1fr]">
        {/* Project Timeline */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Handshake className="h-5 w-5 text-purple-600" />
              Project Progress
            </CardTitle>
            <CardDescription>Track milestones and progress for each collaboration</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {projectTimeline.map((project) => (
              <div
                key={project.name}
                className={`rounded-xl border p-4 ${
                  project.status === 'completed'
                    ? 'border-green-200 bg-green-50/50'
                    : 'border-gray-100 bg-white'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{project.flag}</span>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-semibold text-gray-900">{project.name}</h4>
                        {project.status === 'completed' && (
                          <CheckCircle className="h-4 w-4 text-green-600" />
                        )}
                      </div>
                      <p className="text-sm text-gray-500">with {project.partner}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-gray-900">{project.students} students</p>
                    <p className="text-xs text-gray-500">Started {project.startDate}</p>
                  </div>
                </div>

                <div className="mt-4">
                  <div className="flex items-center justify-between text-sm mb-2">
                    <span className="text-gray-600">
                      {project.milestones.completed}/{project.milestones.total} milestones
                    </span>
                    <span className={`font-medium ${
                      project.status === 'completed' ? 'text-green-600' : 'text-purple-600'
                    }`}>
                      {project.progress}%
                    </span>
                  </div>
                  <div className="h-2 rounded-full bg-gray-100">
                    <div
                      className={`h-2 rounded-full transition-all ${
                        project.status === 'completed' ? 'bg-green-500' : 'bg-purple-500'
                      }`}
                      style={{ width: `${project.progress}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Resource Usage */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-purple-600" />
              Resource Usage
            </CardTitle>
            <CardDescription>Materials accessed by your teachers</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {resourceUsage.map((resource) => {
              const Icon = resource.icon
              return (
                <div key={resource.type} className="flex items-center gap-3">
                  <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${resource.bgColor}`}>
                    <Icon className={`h-5 w-5 ${resource.color}`} />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">{resource.type}</p>
                    <p className="text-xs text-gray-500">{resource.used} accessed</p>
                  </div>
                  <div className="text-right">
                    <span className={`text-lg font-bold ${resource.color}`}>{resource.used}</span>
                  </div>
                </div>
              )
            })}

            <div className="mt-4 rounded-lg bg-gradient-to-br from-purple-50 to-blue-50 p-4">
              <div className="flex items-center gap-2">
                <Star className="h-5 w-5 text-amber-500" />
                <span className="font-medium text-gray-900">Most Popular</span>
              </div>
              <p className="mt-1 text-sm text-gray-600">
                &quot;Global Citizenship Discussion Guide&quot; was used by all 3 teachers
              </p>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Skills & Global Connections */}
      <section className="grid gap-6 lg:grid-cols-2">
        {/* Skills Developed */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lightbulb className="h-5 w-5 text-purple-600" />
              Skills Developed
            </CardTitle>
            <CardDescription>Competencies strengthened through global collaboration</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {skillsData.map((skill) => (
              <div key={skill.skill}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-900">{skill.skill}</span>
                  <span className="text-sm font-bold text-gray-600">{skill.level}%</span>
                </div>
                <div className="h-2.5 rounded-full bg-gray-100">
                  <div
                    className={`h-2.5 rounded-full ${skill.color} transition-all duration-500`}
                    style={{ width: `${skill.level}%` }}
                  />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Global Connections */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapIcon className="h-5 w-5 text-purple-600" />
              Global Connections
            </CardTitle>
            <CardDescription>Your international partner network</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {countryConnections.map((connection) => (
                <div key={connection.country} className="flex items-center justify-between rounded-lg border border-gray-100 p-3">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{connection.flag}</span>
                    <div>
                      <p className="font-medium text-gray-900">{connection.country}</p>
                      <p className="text-xs text-gray-500">{connection.students} students connected</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <MessageSquare className="h-4 w-4 text-gray-400" />
                    <span className="text-sm font-medium text-gray-600">{connection.exchanges} exchanges</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 grid grid-cols-2 gap-4">
              <div className="rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 p-4 text-center text-white">
                <p className="text-3xl font-bold">30</p>
                <p className="text-sm text-purple-100">Total Exchanges</p>
              </div>
              <div className="rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 p-4 text-center text-white">
                <p className="text-3xl font-bold">5</p>
                <p className="text-sm text-blue-100">Partner Schools</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Teacher Engagement */}
      <section>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-purple-600" />
              Teacher Engagement
            </CardTitle>
            <CardDescription>How your educators are contributing to global collaboration</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              {teacherStats.map((teacher) => (
                <div key={teacher.name} className="flex items-center gap-4 rounded-xl border border-gray-100 p-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-purple-100 text-lg font-semibold text-purple-700">
                    {teacher.avatar}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{teacher.name}</p>
                    <div className="mt-1 flex items-center gap-3 text-sm text-gray-500">
                      <span className="flex items-center gap-1">
                        <Target className="h-3 w-3" />
                        {teacher.projects} projects
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {teacher.hours}h
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Impact Summary */}
      <section>
        <Card className="bg-gradient-to-br from-purple-50 via-white to-blue-50 border-purple-100">
          <CardContent className="p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-purple-100">
                <Heart className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900">Your Impact Summary</h3>
                <p className="text-sm text-gray-500">The difference your school is making</p>
              </div>
            </div>

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              <div className="rounded-xl bg-white p-4 shadow-sm">
                <div className="flex items-center gap-2 text-purple-600">
                  <Award className="h-5 w-5" />
                  <span className="text-sm font-medium">Top Contributor</span>
                </div>
                <p className="mt-2 text-2xl font-bold text-gray-900">Anne Holm</p>
                <p className="text-xs text-gray-500">120 hours of collaboration</p>
              </div>

              <div className="rounded-xl bg-white p-4 shadow-sm">
                <div className="flex items-center gap-2 text-emerald-600">
                  <CheckCircle className="h-5 w-5" />
                  <span className="text-sm font-medium">Completed</span>
                </div>
                <p className="mt-2 text-2xl font-bold text-gray-900">18 Milestones</p>
                <p className="text-xs text-gray-500">Across all active projects</p>
              </div>

              <div className="rounded-xl bg-white p-4 shadow-sm">
                <div className="flex items-center gap-2 text-blue-600">
                  <MessageSquare className="h-5 w-5" />
                  <span className="text-sm font-medium">Cross-cultural</span>
                </div>
                <p className="mt-2 text-2xl font-bold text-gray-900">30 Exchanges</p>
                <p className="text-xs text-gray-500">Video calls & shared projects</p>
              </div>

              <div className="rounded-xl bg-white p-4 shadow-sm">
                <div className="flex items-center gap-2 text-amber-600">
                  <Star className="h-5 w-5" />
                  <span className="text-sm font-medium">Student Rating</span>
                </div>
                <p className="mt-2 text-2xl font-bold text-gray-900">4.8 / 5.0</p>
                <p className="text-xs text-gray-500">Based on student feedback</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  )
}
