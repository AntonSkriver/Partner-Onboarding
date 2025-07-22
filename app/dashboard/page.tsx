'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Bell, HelpCircle, Settings, Link, FolderOpen, Users, Zap, BookOpen, FileText,
  Plus, MessageCircle, TrendingUp, Globe, Target, Award, Video, Edit3,
  Mail, Share2, BarChart3, Filter, Download, Calendar, Clock,
  UserCheck, School, GraduationCap, Heart, Star, ArrowUpRight,
  Megaphone, PenTool, Lightbulb, PlayCircle, Shield
} from 'lucide-react'

export default function PartnerDashboard() {
  const [activeTab, setActiveTab] = useState("overview")
  const [progress] = useState(78)
  
  // Enhanced mock data based on comprehensive requirements
  const partnerData = {
    name: "Anton Skriver",
    organization: "UNICEF Denmark",
    organizationType: "NGO",
    role: "Project Coordinator",
    
    // Core KPIs
    metrics: {
      schools: 12,
      teachers: 48,
      students: 1247,
      projects: 3,
      completedProjects: 1,
      activeCollaborations: 8,
      countries: 5,
      npsScore: 8.7,
      engagementRate: 84
    },
    
    // Recent activity
    recentActivity: [
      { type: "school_joined", school: "Copenhagen International School", time: "2 hours ago" },
      { type: "project_update", project: "Global Rights Education", time: "1 day ago" },
      { type: "teacher_message", from: "Maria Santos", time: "2 days ago" }
    ],
    
    // Active projects
    projects: [
      {
        id: 1,
        title: "Global Rights Education",
        status: "active",
        schools: 5,
        teachers: 18,
        students: 420,
        progress: 65,
        sdgs: [4, 10, 16]
      },
      {
        id: 2, 
        title: "Climate Action Youth",
        status: "planning",
        schools: 3,
        teachers: 12,
        students: 280,
        progress: 25,
        sdgs: [13, 15, 17]
      },
      {
        id: 3,
        title: "Digital Inclusion Initiative",
        status: "completed",
        schools: 4,
        teachers: 18,
        students: 547,
        progress: 100,
        sdgs: [4, 8, 9]
      }
    ]
  }

  // Post-onboarding action items based on documentation
  const nextStepActions = [
    {
      id: "invite_schools",
      title: "Invite Schools",
      description: "Invite schools you already know to join your projects",
      icon: School,
      action: "Invite Schools",
      completed: false,
      priority: "high"
    },
    {
      id: "create_content", 
      title: "Create Educational Content",
      description: "Use our AI-powered tools to develop lesson plans and materials",
      icon: PenTool,
      action: "Create Content",
      completed: false,
      priority: "high"
    },
    {
      id: "launch_marketing",
      title: "Promote Your Mission",
      description: "Use marketing tools to attract schools to your cause",
      icon: Megaphone,
      action: "Start Campaign",
      completed: false,
      priority: "medium"
    },
    {
      id: "setup_projects",
      title: "Launch Collaborative Projects",
      description: "Create project frameworks for school collaboration",
      icon: Target,
      action: "Create Project",
      completed: false,
      priority: "medium"
    }
  ]

  const onboardingTasks = [
    { id: 1, text: "Complete organization profile", completed: true },
    { id: 2, text: "Select your SDG focus areas", completed: true },
    { id: 3, text: "Add mission statement and description", completed: true },
    { id: 4, text: "Upload organization logo and media", completed: true },
    { id: 5, text: "Set up team roles and permissions", completed: false },
    { id: 6, text: "Create your first project outline", completed: false }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-50">
      {/* Enhanced Header with Role Display */}
      <header className="bg-white border-b border-purple-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center">
                <Globe className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">Class2Class Partners</h1>
                <p className="text-xs text-gray-500">{partnerData.organization}</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="sm">
                <MessageCircle className="h-4 w-4" />
                <span className="ml-1 text-xs">Messages</span>
              </Button>
              <Button variant="ghost" size="sm">
                <Bell className="h-4 w-4" />
                <span className="ml-1 text-xs">3</span>
              </Button>
              <Button variant="ghost" size="sm">
                <HelpCircle className="h-4 w-4" />
              </Button>
              <div className="flex items-center space-x-3 border-l pl-4">
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">{partnerData.name}</p>
                  <p className="text-xs text-gray-500">{partnerData.role}</p>
                </div>
                <div className="w-10 h-10 bg-purple-600 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-medium">
                    {partnerData.name.split(' ').map(n => n[0]).join('')}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section with Enhanced Metrics */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">
                Hi, {partnerData.name}
              </h2>
              <p className="text-gray-600 flex items-center">
                Welcome to your {partnerData.organizationType} partner dashboard
                <Badge variant="secondary" className="ml-2">{partnerData.role}</Badge>
              </p>
            </div>
            <div className="flex space-x-3">
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Export Report
              </Button>
              <Button className="bg-purple-600 hover:bg-purple-700">
                <Plus className="h-4 w-4 mr-2" />
                New Project
              </Button>
            </div>
          </div>
        </div>

        {/* Compact KPI Metrics - Single Line */}
        <div className="mb-8">
          <div className="flex space-x-2 max-w-2xl">
            {/* All metrics in a single compact row */}
            <Card className="border-purple-200 hover:shadow-md hover:border-purple-300 transition-all cursor-pointer group flex-1" onClick={() => setActiveTab("analytics")}>
              <CardContent className="p-2">
                <div className="text-center">
                  <School className="h-4 w-4 text-purple-600 mx-auto mb-1 group-hover:scale-110 transition-transform" />
                  <p className="text-xs font-medium text-purple-600">Schools</p>
                  <p className="text-lg font-bold text-gray-900">{partnerData.metrics.schools}</p>
                </div>
              </CardContent>
            </Card>

            <Card className="border-purple-200 hover:shadow-md hover:border-purple-300 transition-all cursor-pointer group flex-1" onClick={() => setActiveTab("analytics")}>
              <CardContent className="p-2">
                <div className="text-center">
                  <GraduationCap className="h-4 w-4 text-purple-600 mx-auto mb-1 group-hover:scale-110 transition-transform" />
                  <p className="text-xs font-medium text-purple-600">Teachers</p>
                  <p className="text-lg font-bold text-gray-900">{partnerData.metrics.teachers}</p>
                </div>
              </CardContent>
            </Card>

            <Card className="border-purple-200 hover:shadow-md hover:border-purple-300 transition-all cursor-pointer group flex-1" onClick={() => setActiveTab("analytics")}>
              <CardContent className="p-2">
                <div className="text-center">
                  <Users className="h-4 w-4 text-purple-600 mx-auto mb-1 group-hover:scale-110 transition-transform" />
                  <p className="text-xs font-medium text-purple-600">Students</p>
                  <p className="text-lg font-bold text-gray-900">{partnerData.metrics.students > 999 ? `${Math.floor(partnerData.metrics.students/1000)}k` : partnerData.metrics.students}</p>
                </div>
              </CardContent>
            </Card>

            <Card className="border-purple-200 hover:shadow-md hover:border-purple-300 transition-all cursor-pointer group flex-1" onClick={() => setActiveTab("analytics")}>
              <CardContent className="p-2">
                <div className="text-center">
                  <Globe className="h-4 w-4 text-purple-600 mx-auto mb-1 group-hover:scale-110 transition-transform" />
                  <p className="text-xs font-medium text-purple-600">Countries</p>
                  <p className="text-lg font-bold text-gray-900">{partnerData.metrics.countries}</p>
                </div>
              </CardContent>
            </Card>

            <Card className="border-purple-200 hover:shadow-md hover:border-purple-300 transition-all cursor-pointer group flex-1" onClick={() => setActiveTab("analytics")}>
              <CardContent className="p-2">
                <div className="text-center">
                  <Star className="h-4 w-4 text-purple-600 mx-auto mb-1 group-hover:scale-110 transition-transform" />
                  <p className="text-xs font-medium text-purple-600">NPS</p>
                  <p className="text-lg font-bold text-gray-900">{partnerData.metrics.npsScore}</p>
                </div>
              </CardContent>
            </Card>
          </div>
          
          <p className="text-xs text-gray-500 mt-2">Click any metric to view detailed analytics</p>
        </div>

        {/* Sidebar Layout with Overview and Projects */}
        <div className="flex gap-6">
          {/* Sidebar Navigation */}
          <div className="w-48 flex-shrink-0">
            <div className="space-y-2">
              <button
                onClick={() => setActiveTab("overview")}
                className={`w-full text-left px-4 py-3 rounded-lg transition-colors ${
                  activeTab === "overview"
                    ? "bg-purple-100 text-purple-900 border-l-4 border-purple-600"
                    : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 rounded-lg bg-purple-100 flex items-center justify-center">
                    <Globe className="h-4 w-4 text-purple-600" />
                  </div>
                  <span className="font-medium">Overview</span>
                </div>
              </button>
              
              <button
                onClick={() => setActiveTab("projects")}
                className={`w-full text-left px-4 py-3 rounded-lg transition-colors ${
                  activeTab === "projects"
                    ? "bg-purple-100 text-purple-900 border-l-4 border-purple-600"
                    : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 rounded-lg bg-purple-100 flex items-center justify-center">
                    <FolderOpen className="h-4 w-4 text-purple-600" />
                  </div>
                  <span className="font-medium">Projects</span>
                </div>
              </button>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="flex-1">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {/* Onboarding Progress */}
            <Card className="bg-gradient-to-r from-purple-100 to-indigo-100 border-purple-200">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-gray-900">Complete Your Setup</CardTitle>
                  <Badge variant="secondary" className="bg-white/50">
                    {progress}% Complete
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <Progress value={progress} className="mb-6" />
                <div className="grid md:grid-cols-2 gap-4">
                  {onboardingTasks.map((task) => (
                    <div key={task.id} className="flex items-center space-x-3 p-2 rounded-lg bg-white/50">
                      <div className={`w-5 h-5 rounded-full border-2 ${
                        task.completed 
                          ? 'bg-purple-600 border-purple-600' 
                          : 'border-gray-300 bg-white'
                      }`}>
                        {task.completed && (
                          <div className="w-full h-full flex items-center justify-center">
                            <UserCheck className="w-3 h-3 text-white" />
                          </div>
                        )}
                      </div>
                      <span className={`text-sm ${
                        task.completed ? 'text-gray-600 line-through' : 'text-gray-900 font-medium'
                      }`}>
                        {task.text}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Next Steps Action Items */}
            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-6">Ready to Get Started? Here's What You Can Do Next</h3>
              <div className="grid md:grid-cols-2 gap-6">
                {nextStepActions.map((action) => (
                  <Card key={action.id} className="hover:shadow-lg transition-shadow border-purple-200">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                            <action.icon className="h-5 w-5 text-purple-600" />
                          </div>
                          <div>
                            <CardTitle className="text-lg">{action.title}</CardTitle>
                            <CardDescription className="mt-1">{action.description}</CardDescription>
                          </div>
                        </div>
                        <Badge variant={action.priority === 'high' ? 'default' : 'secondary'}>
                          {action.priority}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardFooter>
                      <Button className="w-full bg-purple-600 hover:bg-purple-700">
                        {action.action}
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            </div>

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Clock className="h-5 w-5 mr-2" />
                  Recent Activity
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {partnerData.recentActivity.map((activity, index) => (
                    <div key={index} className="flex items-center space-x-4 p-3 rounded-lg bg-gray-50">
                      <div className="w-2 h-2 bg-purple-600 rounded-full"></div>
                      <div className="flex-1">
                        <p className="text-sm text-gray-900">
                          {activity.type === 'school_joined' && `${activity.school} joined your network`}
                          {activity.type === 'project_update' && `${activity.project} received an update`}
                          {activity.type === 'teacher_message' && `New message from ${activity.from}`}
                        </p>
                        <p className="text-xs text-gray-500">{activity.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Projects Tab */}
          <TabsContent value="projects" className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-xl font-semibold text-gray-900">Project Management</h3>
              <Button className="bg-purple-600 hover:bg-purple-700">
                <Plus className="h-4 w-4 mr-2" />
                Create New Project
              </Button>
            </div>
            
            <div className="grid gap-6">
              {partnerData.projects.map((project) => (
                <Card key={project.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg">{project.title}</CardTitle>
                        <div className="flex items-center space-x-4 mt-2">
                          <Badge variant={
                            project.status === 'active' ? 'default' : 
                            project.status === 'completed' ? 'secondary' : 'outline'
                          }>
                            {project.status}
                          </Badge>
                          <div className="flex space-x-1">
                            {project.sdgs.map(sdg => (
                              <Badge key={sdg} variant="outline" className="text-xs">SDG {sdg}</Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                      <Button variant="ghost" size="sm">
                        <Edit3 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-3 gap-4 mb-4">
                      <div className="text-center">
                        <p className="text-2xl font-bold text-purple-600">{project.schools}</p>
                        <p className="text-sm text-gray-600">Schools</p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-bold text-purple-600">{project.teachers}</p>
                        <p className="text-sm text-gray-600">Teachers</p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-bold text-purple-600">{project.students}</p>
                        <p className="text-sm text-gray-600">Students</p>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Progress</span>
                        <span>{project.progress}%</span>
                      </div>
                      <Progress value={project.progress} />
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-between">
                    <Button variant="outline" size="sm">View Details</Button>
                    <Button size="sm" className="bg-purple-600 hover:bg-purple-700">Manage</Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </TabsContent>

            </Tabs>
          </div>
        </div>
      </div>
    </div>
  )
}