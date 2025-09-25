'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  School,
  Users,
  Globe,
  BookOpen,
  Target,
  Mail,
  Calendar,
  Star,
  Plus,
  ArrowRight,
  CheckCircle,
  Clock,
  AlertCircle,
  Settings,
  MapPin,
  BarChart3,
  Award,
  Tag,
  LogOut
} from 'lucide-react'
import Link from 'next/link'

export default function SchoolDashboard() {
  const [userData, setUserData] = useState<any>(null)
  const [isIndependentSchool, setIsIndependentSchool] = useState(false)

  useEffect(() => {
    // Check if this is an independent school with partner capabilities
    const storedUser = localStorage.getItem('user')
    if (storedUser) {
      const user = JSON.parse(storedUser)
      setUserData(user)
      setIsIndependentSchool(user.accountType === 'independent_school' && user.partnerCapabilities)
    }
  }, [])

  const [currentProjects] = useState([
    {
      id: '1',
      title: 'Children\'s Rights Across Cultures',
      partner: 'UNICEF Danmark',
      status: 'active',
      participants: 8,
      countries: ['Denmark', 'Kenya', 'Philippines'],
      startDate: '2025-01-15',
      endDate: '2025-02-15',
      sdgs: ['4', '10', '16'],
      progress: 60
    },
    {
      id: '2',
      title: 'Climate Action Champions',
      partner: 'Green Future Initiative',
      status: 'starting',
      participants: 12,
      countries: ['Denmark', 'Germany', 'Brazil'],
      startDate: '2025-02-01',
      endDate: '2025-03-30',
      sdgs: ['13', '7', '11'],
      progress: 10
    }
  ])

  const [availableProjects] = useState([
    {
      id: '3',
      title: 'Digital Innovation Lab',
      partner: 'Tech for Good Foundation',
      description: 'Collaborative coding project focusing on solutions for social challenges',
      participants: 0,
      maxParticipants: 15,
      languages: ['English', 'Spanish'],
      ageGroup: ['12-14 years', '15-17 years'],
      sdgs: ['9', '4', '8'],
      applicationDeadline: '2025-01-20'
    },
    {
      id: '4',
      title: 'Ocean Conservation Project',
      partner: 'Marine Life Organization',
      description: 'Students work together to create awareness campaigns about ocean protection',
      participants: 5,
      maxParticipants: 20,
      languages: ['English', 'French'],
      ageGroup: ['9-11 years', '12-14 years'],
      sdgs: ['14', '13', '12'],
      applicationDeadline: '2025-01-25'
    }
  ])

  const schoolProfile = {
    name: 'Ørestad Gymnasium',
    type: 'High School',
    location: 'Copenhagen, Denmark',
    students: '800',
    languages: ['Danish', 'English', 'German'],
    contact: 'Maria Hansen - International Coordinator',
    email: 'maria.hansen@orestad.dk',
    interests: ['Human Rights', 'Climate Change', 'Technology Projects', 'Cultural Exchange'],
    sdgFocus: ['4', '10', '13', '16']
  }

  const handleLogout = () => {
    // In a real app, this would clear the session and redirect
    window.location.href = '/sign-in'
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800'
      case 'starting': return 'bg-blue-100 text-blue-800'
      case 'completed': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <CheckCircle className="h-4 w-4" />
      case 'starting': return <Clock className="h-4 w-4" />
      case 'completed': return <Star className="h-4 w-4" />
      default: return <AlertCircle className="h-4 w-4" />
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                  <School className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-semibold text-gray-900">
                    {schoolProfile.name}
                    {isIndependentSchool && (
                      <Badge className="ml-2 bg-blue-100 text-blue-800 text-xs">
                        School Partner
                      </Badge>
                    )}
                  </h1>
                  <p className="text-sm text-gray-600">
                    {schoolProfile.location}
                    {isIndependentSchool && (
                      <span className="ml-2 text-blue-600">• Independent Partner School</span>
                    )}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="sm">
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </Button>
              <Button variant="ghost" size="sm" onClick={handleLogout}>
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="programs">Programs</TabsTrigger>
            <TabsTrigger value="resources">Resources</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* School Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <School className="h-4 w-4" />
                    School Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-sm font-medium text-gray-700">School Name</p>
                    <p className="text-lg font-semibold">{schoolProfile.name}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium text-gray-700">Type</p>
                      <p>{schoolProfile.type}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-700">Students</p>
                      <p>{schoolProfile.students}</p>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-700">Location</p>
                    <p>{schoolProfile.location}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-700">Languages</p>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {schoolProfile.languages.map((lang, idx) => (
                        <Badge key={idx} variant="outline" className="text-xs">
                          {lang}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Contact Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    Contact Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-sm font-medium text-gray-700">Contact Person</p>
                    <p className="font-semibold">{schoolProfile.contact}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-700">Email</p>
                    <p>{schoolProfile.email}</p>
                  </div>
                </CardContent>
              </Card>

              {/* Quick Stats */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="h-4 w-4" />
                    Quick Stats
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-2xl font-bold text-blue-600">{currentProjects.length}</div>
                      <div className="text-sm text-gray-600">Active Projects</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-green-600">
                        {currentProjects.reduce((sum, project) => sum + project.participants, 0)}
                      </div>
                      <div className="text-sm text-gray-600">Students</div>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4 pt-2 border-t">
                    <div>
                      <div className="text-xl font-bold text-purple-600">
                        {[...new Set(currentProjects.flatMap(p => p.countries))].length}
                      </div>
                      <div className="text-sm text-gray-600">Countries</div>
                    </div>
                    <div>
                      <div className="text-xl font-bold text-yellow-600">4.8</div>
                      <div className="text-sm text-gray-600">Rating</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Focus Areas */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Learning Interests */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BookOpen className="h-4 w-4" />
                    Learning Interests
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {schoolProfile.interests.map((interest, idx) => (
                      <Badge key={idx} variant="secondary">
                        {interest}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* SDG Focus Areas */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="h-4 w-4" />
                    SDG Focus Areas
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {schoolProfile.sdgFocus.map((sdg, idx) => (
                      <Badge key={idx} className="bg-purple-100 text-purple-800">
                        SDG {sdg}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Profile Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Profile Management</CardTitle>
                <CardDescription>
                  Manage your school profile and settings
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex gap-4">
                  <Button variant="outline">
                    <Settings className="h-4 w-4 mr-2" />
                    Edit Profile
                  </Button>
                  <Button variant="outline">
                    Update Interests
                  </Button>
                  <Button variant="outline">
                    Change Contact Info
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Programs Tab */}
          <TabsContent value="programs" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-900">My Programs</h2>
              <Button className="bg-blue-600 hover:bg-blue-700">
                <Plus className="h-4 w-4 mr-2" />
                {isIndependentSchool ? 'Create Program' : 'Discover Programs'}
              </Button>
            </div>

            {/* Current Programs Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-800">Current Programs</h3>
              {currentProjects.length > 0 ? (
                <div className="grid gap-6">
                  {currentProjects.map((project) => (
                    <Card key={project.id} className="hover:shadow-lg transition-shadow">
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <CardTitle className="text-xl">{project.title}</CardTitle>
                            <CardDescription className="text-lg mt-1">
                              Partner: {project.partner}
                            </CardDescription>
                          </div>
                          <Badge className={`${getStatusColor(project.status)} flex items-center gap-1`}>
                            {getStatusIcon(project.status)}
                            {project.status === 'active' ? 'Active' : 'Starting Soon'}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                          <div>
                            <p className="text-sm font-medium text-gray-700">Participants</p>
                            <div className="flex items-center gap-1">
                              <Users className="h-4 w-4 text-gray-500" />
                              <span>{project.participants} students</span>
                            </div>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-700">Countries</p>
                            <div className="flex items-center gap-1">
                              <Globe className="h-4 w-4 text-gray-500" />
                              <span>{project.countries.length} countries</span>
                            </div>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-700">Duration</p>
                            <div className="flex items-center gap-1">
                              <Calendar className="h-4 w-4 text-gray-500" />
                              <span>{new Date(project.startDate).toLocaleDateString()} - {new Date(project.endDate).toLocaleDateString()}</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-medium text-gray-700">Countries:</span>
                              <div className="flex gap-1">
                                {project.countries.map((country, idx) => (
                                  <Badge key={idx} variant="outline" className="text-xs">
                                    {country}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-medium text-gray-700">SDGs:</span>
                              <div className="flex gap-1">
                                {project.sdgs.map((sdg, idx) => (
                                  <Badge key={idx} className="bg-purple-100 text-purple-800 text-xs">
                                    SDG {sdg}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          </div>
                          <Button variant="outline">
                            View Program
                            <ArrowRight className="h-4 w-4 ml-2" />
                          </Button>
                        </div>

                        {project.status === 'active' && (
                          <div className="mt-4">
                            <div className="flex items-center justify-between text-sm mb-2">
                              <span className="font-medium text-gray-700">Progress</span>
                              <span className="text-gray-600">{project.progress}%</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div
                                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                                style={{ width: `${project.progress}%` }}
                              ></div>
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <Card>
                  <CardContent className="text-center py-12">
                    <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No Active Programs</h3>
                    <p className="text-gray-600 mb-6">
                      Start your global education journey by joining a collaborative program
                    </p>
                    <Button className="bg-blue-600 hover:bg-blue-700">
                      <Plus className="h-4 w-4 mr-2" />
                      Discover Programs
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Available Programs Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-800">Available Programs</h3>
              <p className="text-gray-600">
                Discover collaborative programs from partner organizations around the world
              </p>
              <div className="grid gap-6">
                {availableProjects.map((project) => (
                  <Card key={project.id} className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle className="text-xl">{project.title}</CardTitle>
                          <CardDescription className="text-lg mt-1">
                            by {project.partner}
                          </CardDescription>
                          <p className="text-gray-600 mt-2">{project.description}</p>
                        </div>
                        <Badge variant="outline" className="text-xs">
                          {project.participants}/{project.maxParticipants} schools
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                        <div>
                          <p className="text-sm font-medium text-gray-700">Languages</p>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {project.languages.map((lang, idx) => (
                              <Badge key={idx} variant="secondary" className="text-xs">
                                {lang}
                              </Badge>
                            ))}
                          </div>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-700">Age Groups</p>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {project.ageGroup.map((age, idx) => (
                              <Badge key={idx} variant="secondary" className="text-xs">
                                {age}
                              </Badge>
                            ))}
                          </div>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-700">Application Deadline</p>
                          <div className="flex items-center gap-1 mt-1">
                            <Calendar className="h-4 w-4 text-gray-500" />
                            <span className="text-sm">{new Date(project.applicationDeadline).toLocaleDateString()}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-gray-700">SDGs:</span>
                          <div className="flex gap-1">
                            {project.sdgs.map((sdg, idx) => (
                              <Badge key={idx} className="bg-purple-100 text-purple-800 text-xs">
                                SDG {sdg}
                              </Badge>
                            ))}
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button variant="outline">Learn More</Button>
                          <Button className="bg-blue-600 hover:bg-blue-700">
                            Apply to Join
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </TabsContent>

          {/* Resources Tab */}
          <TabsContent value="resources" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-900">Resources</h2>
              <Button className="bg-blue-600 hover:bg-blue-700">
                <Plus className="h-4 w-4 mr-2" />
                Add Resource
              </Button>
            </div>

            {/* Sample Resources - in a real app this would come from a database */}
            <div className="grid gap-6">
              <Card className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <BookOpen className="w-4 h-4 text-blue-600" />
                        <h3 className="font-semibold">Human Rights Education Toolkit</h3>
                        <Badge variant="outline">PDF</Badge>
                      </div>
                      <p className="text-gray-600 text-sm">Comprehensive guide for teaching human rights concepts to high school students</p>
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <span>English</span>
                        <span>Updated 2 weeks ago</span>
                      </div>
                    </div>
                    <Button variant="outline" size="sm">
                      Download
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <BookOpen className="w-4 h-4 text-blue-600" />
                        <h3 className="font-semibold">Climate Action Project Templates</h3>
                        <Badge variant="outline">ZIP</Badge>
                      </div>
                      <p className="text-gray-600 text-sm">Ready-to-use templates for climate change awareness projects</p>
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <span>Multiple languages</span>
                        <span>Updated 1 month ago</span>
                      </div>
                    </div>
                    <Button variant="outline" size="sm">
                      Download
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Empty state if no resources */}
              <Card>
                <CardContent className="p-6 text-center">
                  <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="font-medium text-gray-900 mb-2">Share Your Resources</h3>
                  <p className="text-gray-500 mb-4">
                    Upload and share educational resources with partner schools and organizations
                  </p>
                  <Button className="bg-blue-600 hover:bg-blue-700">
                    <Plus className="h-4 w-4 mr-2" />
                    Upload Resource
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Analytics & Impact</h2>
              <p className="text-gray-600">
                Track your school's participation and impact in global education programs
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Program Impact */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="w-4 h-4" />
                    Program Impact
                  </CardTitle>
                  <CardDescription>
                    Your school's impact metrics across all programs
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <div className="text-2xl font-bold text-blue-600">
                          {currentProjects.reduce((sum, project) => sum + project.participants, 0)}
                        </div>
                        <div className="text-sm text-gray-600">Students Engaged</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-green-600">
                          {[...new Set(currentProjects.flatMap(p => p.countries))].length}
                        </div>
                        <div className="text-sm text-gray-600">Countries Connected</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-purple-600">{currentProjects.length}</div>
                        <div className="text-sm text-gray-600">Active Programs</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-orange-600">
                          {[...new Set(currentProjects.flatMap(p => p.sdgs))].length}
                        </div>
                        <div className="text-sm text-gray-600">SDGs Addressed</div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Export Data */}
              <Card>
                <CardHeader>
                  <CardTitle>Export Data</CardTitle>
                  <CardDescription>
                    Download your school's participation data for reporting
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button variant="outline" className="w-full">
                    Export Program Report
                  </Button>
                  <Button variant="outline" className="w-full">
                    Export Student Participation (CSV)
                  </Button>
                  <Button variant="outline" className="w-full">
                    Export Impact Metrics
                  </Button>
                </CardContent>
              </Card>

              {/* Program Performance */}
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle>Program Performance</CardTitle>
                  <CardDescription>
                    Detailed breakdown of your participation in each program
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {currentProjects.length > 0 ? (
                    <div className="space-y-4">
                      {currentProjects.map((project) => (
                        <div key={project.id} className="border rounded-lg p-4">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-semibold">{project.title}</h4>
                            <Badge className={getStatusColor(project.status)}>
                              {project.status}
                            </Badge>
                          </div>
                          <div className="grid grid-cols-4 gap-4 text-sm">
                            <div>
                              <span className="text-gray-600">Students:</span>
                              <span className="ml-2 font-medium">{project.participants}</span>
                            </div>
                            <div>
                              <span className="text-gray-600">Progress:</span>
                              <span className="ml-2 font-medium">{project.progress}%</span>
                            </div>
                            <div>
                              <span className="text-gray-600">Duration:</span>
                              <span className="ml-2 font-medium">
                                {Math.round((new Date(project.endDate).getTime() - new Date(project.startDate).getTime()) / (1000 * 60 * 60 * 24))} days
                              </span>
                            </div>
                            <div>
                              <span className="text-gray-600">SDGs:</span>
                              <span className="ml-2 font-medium">{project.sdgs.length} goals</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Target className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="font-medium text-gray-900 mb-2">No Program Data</h3>
                      <p className="text-gray-500">
                        Analytics data will appear here once you start participating in programs.
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}