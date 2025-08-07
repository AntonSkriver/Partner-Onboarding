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
      partner: 'UNICEF Denmark',
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
        
        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <Target className="h-4 w-4 text-blue-600" />
                </div>
                <div className="ml-4">
                  <div className="text-2xl font-bold text-gray-900">{currentProjects.length}</div>
                  <div className="text-sm text-gray-600">Active Projects</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                  <Users className="h-4 w-4 text-green-600" />
                </div>
                <div className="ml-4">
                  <div className="text-2xl font-bold text-gray-900">
                    {currentProjects.reduce((sum, project) => sum + project.participants, 0)}
                  </div>
                  <div className="text-sm text-gray-600">Students Participating</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                  <Globe className="h-4 w-4 text-purple-600" />
                </div>
                <div className="ml-4">
                  <div className="text-2xl font-bold text-gray-900">
                    {[...new Set(currentProjects.flatMap(p => p.countries))].length}
                  </div>
                  <div className="text-sm text-gray-600">Partner Countries</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                  <Star className="h-4 w-4 text-yellow-600" />
                </div>
                <div className="ml-4">
                  <div className="text-2xl font-bold text-gray-900">4.8</div>
                  <div className="text-sm text-gray-600">Project Rating</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="projects" className="space-y-6">
          <TabsList className={`grid w-full ${isIndependentSchool ? 'grid-cols-5' : 'grid-cols-3'}`}>
            <TabsTrigger value="projects">My Projects</TabsTrigger>
            <TabsTrigger value="discover">Discover Projects</TabsTrigger>
            {isIndependentSchool && (
              <>
                <TabsTrigger value="create">Create Project</TabsTrigger>
                <TabsTrigger value="invite">Invite Schools</TabsTrigger>
              </>
            )}
            <TabsTrigger value="profile">School Profile</TabsTrigger>
          </TabsList>

          {/* My Projects Tab */}
          <TabsContent value="projects" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-900">Current Projects</h2>
              <Button className="bg-blue-600 hover:bg-blue-700">
                <Plus className="h-4 w-4 mr-2" />
                Create Project
              </Button>
            </div>

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
                          View Project
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
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No Active Projects</h3>
                  <p className="text-gray-600 mb-6">
                    Start your global education journey by joining a collaborative project
                  </p>
                  <Button className="bg-blue-600 hover:bg-blue-700">
                    <Plus className="h-4 w-4 mr-2" />
                    Discover Projects
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Discover Projects Tab */}
          <TabsContent value="discover" className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Available Projects</h2>
              <p className="text-gray-600 mb-6">
                Discover collaborative projects from partner organizations around the world
              </p>
            </div>

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
          </TabsContent>

          {/* School Profile Tab */}
          <TabsContent value="profile" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <School className="h-5 w-5 text-blue-600" />
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

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Mail className="h-5 w-5 text-blue-600" />
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

              <Card>
                <CardHeader>
                  <CardTitle>Learning Interests</CardTitle>
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

              <Card>
                <CardHeader>
                  <CardTitle>SDG Focus Areas</CardTitle>
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

            <Card>
              <CardHeader>
                <CardTitle>Profile Actions</CardTitle>
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

          {/* Create Project Tab (for independent schools) */}
          {isIndependentSchool && (
            <TabsContent value="create" className="space-y-6">
              <div className="text-center">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Create a Collaborative Project</h2>
                <p className="text-gray-600 mb-8">
                  As an independent school partner, you can create projects and invite other schools to collaborate
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <Card className="hover:shadow-lg transition-shadow cursor-pointer border-blue-200 hover:border-blue-300">
                  <CardHeader className="text-center">
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                      <Users className="h-6 w-6 text-blue-600" />
                    </div>
                    <CardTitle>Host a Live Project</CardTitle>
                    <CardDescription>
                      Create and facilitate a collaborative project with direct school-to-school interaction
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2 text-sm text-gray-600 mb-4">
                      <li className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        Real-time collaboration features
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        Direct communication with participating schools
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        Progress tracking and support
                      </li>
                    </ul>
                    <Button className="w-full bg-blue-600 hover:bg-blue-700">
                      Create Live Project
                    </Button>
                  </CardContent>
                </Card>

                <Card className="hover:shadow-lg transition-shadow cursor-pointer border-purple-200 hover:border-purple-300">
                  <CardHeader className="text-center">
                    <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                      <BookOpen className="h-6 w-6 text-purple-600" />
                    </div>
                    <CardTitle>Create Project Template</CardTitle>
                    <CardDescription>
                      Design a reusable project template that other schools can adapt and implement
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2 text-sm text-gray-600 mb-4">
                      <li className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        Share your successful project ideas
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        Help other schools implement similar projects
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        Build your school's reputation as an education leader
                      </li>
                    </ul>
                    <Button variant="outline" className="w-full border-purple-300 text-purple-700 hover:bg-purple-50">
                      Create Template
                    </Button>
                  </CardContent>
                </Card>
              </div>

              <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                      <Star className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-2">School Partnership Benefits</h3>
                      <p className="text-gray-700 mb-4">
                        As an independent school partner, you have the same project creation capabilities as traditional partner organizations. 
                        You can create projects, invite schools, and lead collaborative educational initiatives.
                      </p>
                      <div className="flex gap-4">
                        <Badge variant="secondary" className="bg-blue-100 text-blue-800">Global Reach</Badge>
                        <Badge variant="secondary" className="bg-purple-100 text-purple-800">SDG Aligned</Badge>
                        <Badge variant="secondary" className="bg-green-100 text-green-800">Impact Tracking</Badge>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          )}

          {/* Invite Schools Tab (for independent schools) */}
          {isIndependentSchool && (
            <TabsContent value="invite" className="space-y-6">
              <div className="text-center">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Invite Partner Schools</h2>
                <p className="text-gray-600 mb-8">
                  Build your collaborative network by inviting other schools to join your projects
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-6 mb-8">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Mail className="h-5 w-5 text-blue-600" />
                      Direct School Invitations
                    </CardTitle>
                    <CardDescription>
                      Send personalized invitations to specific schools you'd like to collaborate with
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button className="w-full bg-blue-600 hover:bg-blue-700">
                      <Plus className="h-4 w-4 mr-2" />
                      Send School Invitations
                    </Button>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Globe className="h-5 w-5 text-green-600" />
                      Network Invitations
                    </CardTitle>
                    <CardDescription>
                      Invite schools from educational networks or regional partnerships
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button variant="outline" className="w-full">
                      <Users className="h-4 w-4 mr-2" />
                      Browse School Networks
                    </Button>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Invitation Statistics</CardTitle>
                  <CardDescription>Track your school partnership invitations</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 gap-6">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">0</div>
                      <div className="text-sm text-gray-600">Invitations Sent</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">0</div>
                      <div className="text-sm text-gray-600">Schools Joined</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-purple-600">0%</div>
                      <div className="text-sm text-gray-600">Acceptance Rate</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  <strong>School-to-School Partnerships:</strong> As an independent school partner, you can create projects and invite other schools directly. 
                  This enables peer-to-peer educational collaboration and knowledge sharing between schools worldwide.
                </AlertDescription>
              </Alert>
            </TabsContent>
          )}
        </Tabs>
      </div>
    </div>
  )
}