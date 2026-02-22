'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { 
  Search,
  ChevronDown,
  Home,
  Compass,
  Link as LinkIcon,
  FolderOpen,
  BookOpen,
  GraduationCap,
  Users,
  Clock,
  UserCheck,
  UserPlus,
  Mail
} from 'lucide-react'
import { Link } from '@/i18n/navigation'
import Image from 'next/image'

// Sample data for different connection types
const teachersData = {
  all: [
    {
      id: 1,
      name: "Paola Visnevetzky",
      country: "Argentina",
      flag: "🇦🇷",
      experience: "Experienced",
      subjects: ["Environmental Science", "Geography"],
      students: "Ages 12-16",
      timeZone: "5 hours from you",
      avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b64c?w=400&h=400&fit=crop&crop=face",
      verified: true
    },
    {
      id: 2,
      name: "Sri Prakash Parchieappan", 
      country: "Malaysia",
      flag: "🇲🇾",
      experience: "Experienced",
      subjects: ["STEM", "Technology"],
      students: "Ages 14-18", 
      timeZone: "8 hours from you",
      avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face",
      verified: true
    },
    {
      id: 3,
      name: "Claire Blake",
      country: "South Africa", 
      flag: "🇿🇦",
      experience: "New",
      subjects: ["Arts", "Culture"],
      students: "Ages 10-14",
      timeZone: "2 hours from you", 
      avatar: "CB",
      verified: false
    },
    {
      id: 4,
      name: "Md Nur Kutubul Alam",
      country: "Bangladesh",
      flag: "🇧🇩", 
      experience: "Experienced",
      subjects: ["Mathematics", "Science"],
      students: "Ages 8-12",
      timeZone: "4 hours from you",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face",
      verified: true
    },
    {
      id: 5,
      name: "Fatima Laraj",
      country: "Tunisia",
      flag: "🇹🇳",
      experience: "Experienced", 
      subjects: ["Languages", "Social Studies"],
      students: "Ages 15-18",
      timeZone: "1 hour from you",
      avatar: "FL",
      verified: true
    }
  ],
  myNetwork: [],
  incoming: [],
  sent: []
}

const schoolsData = {
  all: [
    {
      id: 1,
      name: "Copenhagen International School",
      city: "Copenhagen",
      country: "Denmark", 
      flag: "🇩🇰",
      type: "International",
      students: 1200,
      teachers: 85,
      languages: ["English", "Danish"],
      programs: ["IB Programme", "STEM Focus"],
      avatar: "https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=100&h=100&fit=crop"
    },
    {
      id: 2, 
      name: "São Paulo Global Academy",
      city: "São Paulo",
      country: "Brazil",
      flag: "🇧🇷",
      type: "Public",
      students: 800,
      teachers: 45,
      languages: ["Portuguese", "English"],
      programs: ["Environmental Focus", "Community Projects"],
      avatar: "https://images.unsplash.com/photo-1562774053-701939374585?w=100&h=100&fit=crop"
    },
    {
      id: 3,
      name: "Nairobi International School", 
      city: "Nairobi",
      country: "Kenya",
      flag: "🇰🇪",
      type: "International",
      students: 650,
      teachers: 38,
      languages: ["English", "Swahili"],
      programs: ["UN SDG Focus", "Cultural Exchange"],
      avatar: "https://images.unsplash.com/photo-1497486751825-1233686d5d80?w=100&h=100&fit=crop"
    },
    {
      id: 4,
      name: "Mumbai Tech Academy",
      city: "Mumbai", 
      country: "India",
      flag: "🇮🇳",
      type: "Private",
      students: 950,
      teachers: 62,
      languages: ["English", "Hindi"],
      programs: ["Technology Integration", "Global Citizenship"],
      avatar: "https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=100&h=100&fit=crop"
    }
  ],
  myNetwork: [],
  incoming: [],
  sent: []
}

const partnersData = {
  all: [
    {
      id: 1,
      name: "UNICEF Denmark",
      type: "NGO",
      focus: "Children's Rights & Education",
      location: "Copenhagen, Denmark",
      flag: "🇩🇰",
      projects: 5,
      schools: 47,
      countries: 15,
      logo: "https://logo.clearbit.com/unicef.org",
      verified: true
    },
    {
      id: 2,
      name: "LEGO Education", 
      type: "Corporate",
      focus: "STEAM Learning & Innovation",
      location: "Billund, Denmark",
      flag: "🇩🇰", 
      projects: 3,
      schools: 28,
      countries: 10,
      logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/2/24/LEGO_logo.svg/200px-LEGO_logo.svg.png",
      verified: true
    },
    {
      id: 3,
      name: "Microsoft Education",
      type: "Corporate", 
      focus: "Digital Innovation & Technology",
      location: "Global",
      flag: "🌍",
      projects: 8,
      schools: 156,
      countries: 25,
      logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/44/Microsoft_logo.svg/200px-Microsoft_logo.svg.png",
      verified: true
    },
    {
      id: 4,
      name: "UNESCO",
      type: "International Organization",
      focus: "Education & Cultural Preservation", 
      location: "Paris, France",
      flag: "🇫🇷",
      projects: 12,
      schools: 89,
      countries: 42,
      logo: "https://logo.clearbit.com/unesco.org",
      verified: true
    }
  ],
  myNetwork: [],
  incoming: [], 
  sent: []
}

export default function ConnectPage() {
  const [activeMainTab, setActiveMainTab] = useState('teachers')
  const [activeSubTab, setActiveSubTab] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')

  const mainTabs = [
    { id: 'teachers', label: 'Teachers', count: teachersData.all.length },
    { id: 'schools', label: 'Schools', count: schoolsData.all.length }, 
    { id: 'partners', label: 'Partners', count: partnersData.all.length }
  ]

  const getSubTabData = () => {
    switch(activeMainTab) {
      case 'teachers': return teachersData
      case 'schools': return schoolsData
      case 'partners': return partnersData
      default: return teachersData
    }
  }

  const getCurrentData = () => {
    const data = getSubTabData()
    switch(activeSubTab) {
      case 'all': return data.all
      case 'network': return data.myNetwork
      case 'incoming': return data.incoming
      case 'sent': return data.sent
      default: return data.all
    }
  }

  const renderTeacherCard = (teacher: typeof teachersData.all[number]) => (
    <Card key={teacher.id} className="hover:shadow-lg transition-shadow">
      <CardHeader className="pb-4">
        <div className="flex items-start gap-4">
          <div className="relative">
            {teacher.avatar.startsWith('http') ? (
              <Image
                src={teacher.avatar}
                alt={teacher.name}
                width={56}
                height={56}
                className="w-14 h-14 rounded-full object-cover"
              />
            ) : (
              <div className="w-14 h-14 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 font-semibold text-lg">
                {teacher.avatar}
              </div>
            )}
            {teacher.verified && (
              <div className="absolute -top-1 -right-1 w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                <UserCheck className="w-3 h-3 text-white" />
              </div>
            )}
          </div>
          <div className="flex-1">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-semibold text-gray-900">{teacher.name}</h3>
                <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                  <span>{teacher.flag}</span>
                  <span>{teacher.country}</span>
                </div>
              </div>
              <Badge variant={teacher.experience === 'Experienced' ? 'default' : 'secondary'}>
                {teacher.experience}
              </Badge>
            </div>
            <div className="space-y-1 text-sm text-gray-600">
              <div className="flex items-center gap-1">
                <Users className="w-3 h-3" />
                <span>{teacher.students}</span>
              </div>
              <div className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                <span>{teacher.timeZone}</span>
              </div>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="mb-4">
          <div className="flex flex-wrap gap-1">
            {teacher.subjects.map((subject: string, idx: number) => (
              <Badge key={idx} variant="outline" className="text-xs">
                {subject}
              </Badge>
            ))}
          </div>
        </div>
        <div className="flex gap-2">
          <Button size="sm" variant="outline" className="flex-1">
            <Mail className="w-4 h-4 mr-1" />
            Message
          </Button>
          <Button size="sm" className="flex-1 bg-purple-600 hover:bg-purple-700">
            <UserPlus className="w-4 h-4 mr-1" />
            Connect
          </Button>
        </div>
      </CardContent>
    </Card>
  )

  const renderSchoolCard = (school: typeof schoolsData.all[number]) => (
    <Card key={school.id} className="hover:shadow-lg transition-shadow">
      <CardHeader className="pb-4">
        <div className="flex items-start gap-4">
          <Image
            src={school.avatar}
            alt={school.name}
            width={72}
            height={72}
            className="w-20 h-20 rounded-full object-cover"
          />
          <div className="flex-1">
            <h3 className="font-semibold text-gray-900 mb-1">{school.name}</h3>
            <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
              <span>{school.flag}</span>
              <span>{school.city}, {school.country}</span>
            </div>
            <Badge variant="outline" className="text-xs">
              {school.type}
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
          <div>
            <span className="font-medium">{school.students.toLocaleString()}</span>
            <span className="text-gray-500 ml-1">students</span>
          </div>
          <div>
            <span className="font-medium">{school.teachers}</span>
            <span className="text-gray-500 ml-1">teachers</span>
          </div>
        </div>
        <div className="mb-4">
          <div className="text-xs text-gray-600 mb-2">Programs</div>
          <div className="flex flex-wrap gap-1">
            {school.programs.map((program: string, idx: number) => (
              <Badge key={idx} variant="outline" className="text-xs">
                {program}
              </Badge>
            ))}
          </div>
        </div>
        <div className="flex gap-2">
          <Button size="sm" variant="outline" className="flex-1">
            View Profile
          </Button>
          <Button size="sm" className="flex-1 bg-purple-600 hover:bg-purple-700">
            <UserPlus className="w-4 h-4 mr-1" />
            Connect
          </Button>
        </div>
      </CardContent>
    </Card>
  )

  const renderPartnerCard = (partner: typeof partnersData.all[number]) => (
    <Card key={partner.id} className="hover:shadow-lg transition-shadow">
      <CardHeader className="pb-4">
        <div className="flex items-start gap-4">
          <div className="relative">
            <Image
              src={partner.logo}
              alt={partner.name}
              width={72}
              height={72}
              className="w-20 h-20 rounded-full object-cover"
            />
            {partner.verified && (
              <div className="absolute -top-1 -right-1 w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                <UserCheck className="w-3 h-3 text-white" />
              </div>
            )}
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-gray-900 mb-1">{partner.name}</h3>
            <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
              <span>{partner.flag}</span>
              <span>{partner.location}</span>
            </div>
            <Badge variant="outline" className="text-xs">
              {partner.type}
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-gray-700 mb-4">{partner.focus}</p>
        <div className="grid grid-cols-3 gap-2 mb-4 text-sm text-center">
          <div>
            <div className="font-medium text-purple-600">{partner.projects}</div>
            <div className="text-xs text-gray-500">Projects</div>
          </div>
          <div>
            <div className="font-medium text-purple-600">{partner.schools}</div>
            <div className="text-xs text-gray-500">Schools</div>
          </div>
          <div>
            <div className="font-medium text-purple-600">{partner.countries}</div>
            <div className="text-xs text-gray-500">Countries</div>
          </div>
        </div>
        <div className="flex gap-2">
          <Button size="sm" variant="outline" className="flex-1">
            View Projects
          </Button>
          <Button size="sm" className="flex-1 bg-purple-600 hover:bg-purple-700">
            <UserPlus className="w-4 h-4 mr-1" />
            Connect
          </Button>
        </div>
      </CardContent>
    </Card>
  )

  const renderContent = () => {
    const currentData = getCurrentData()
    
    if (activeSubTab !== 'all' && currentData.length === 0) {
      return (
        <div className="text-center py-12">
          <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-500 mb-2">
            No {activeSubTab === 'network' ? 'connections' : activeSubTab} yet
          </h3>
          <p className="text-gray-400">
            {activeSubTab === 'network' && 'Start connecting with other educators to build your network.'}
            {activeSubTab === 'incoming' && 'You have no pending connection requests.'}
            {activeSubTab === 'sent' && 'You haven&apos;t sent any connection requests yet.'}
          </p>
        </div>
      )
    }

    return (
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {currentData.map((item) => {
          if (activeMainTab === 'teachers') return renderTeacherCard(item as typeof teachersData.all[number])
          if (activeMainTab === 'schools') return renderSchoolCard(item as typeof schoolsData.all[number])
          if (activeMainTab === 'partners') return renderPartnerCard(item as typeof partnersData.all[number])
          return null
        })}
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Left side - Logo and nav */}
            <div className="flex items-center gap-8">
              <Link href="/" className="flex items-center gap-3">
                <Image 
                  src="/isotipo.png" 
                  alt="Class2Class Logo" 
                  width={32} 
                  height={32}
                  className="w-8 h-8"
                />
              </Link>
              
              {/* Sidebar navigation */}
              <nav className="hidden md:flex items-center gap-6">
                <Link href="/" className="flex items-center gap-2 text-gray-700 hover:text-purple-600">
                  <Home className="w-4 h-4" />
                  <span className="text-sm">Home</span>
                </Link>
                <Link href="/discover" className="flex items-center gap-2 text-gray-700 hover:text-purple-600">
                  <Compass className="w-4 h-4" />
                  <span className="text-sm">Discover</span>
                </Link>
                <Link href="/connect" className="flex items-center gap-2 text-purple-600 font-medium">
                  <LinkIcon className="w-4 h-4" />
                  <span className="text-sm">Connect</span>
                </Link>
                <Link href="/teacher/projects" className="flex items-center gap-2 text-gray-700 hover:text-purple-600">
                  <FolderOpen className="w-4 h-4" />
                  <span className="text-sm">My Projects</span>
                </Link>
                <Link href="/resources" className="flex items-center gap-2 text-gray-700 hover:text-purple-600">
                  <BookOpen className="w-4 h-4" />
                  <span className="text-sm">Resources</span>
                </Link>
                <Link href="/students" className="flex items-center gap-2 text-gray-700 hover:text-purple-600">
                  <GraduationCap className="w-4 h-4" />
                  <span className="text-sm">My Students</span>
                </Link>
              </nav>
            </div>

            {/* Right side - User info */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-medium">A</span>
                </div>
                <div className="hidden md:block">
                  <div className="text-sm font-medium text-gray-900">Anton Skriver</div>
                  <div className="text-xs text-gray-500">Teacher</div>
                </div>
                <ChevronDown className="w-4 h-4 text-gray-400" />
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {activeMainTab.charAt(0).toUpperCase() + activeMainTab.slice(1)} Connections
            </h1>
            <p className="text-gray-600">
              Connect and network with {activeMainTab} from around the world
            </p>
          </div>
          <Button className="bg-purple-600 hover:bg-purple-700 text-white">
            Refer a fellow {activeMainTab.slice(0, -1)} to join
          </Button>
        </div>

        {/* Main Tabs */}
        <div className="border-b border-gray-200 mb-8">
          <nav className="-mb-px flex space-x-8">
            {mainTabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveMainTab(tab.id)
                  setActiveSubTab('all')
                }}
                className={`whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm ${
                  activeMainTab === tab.id
                    ? 'border-purple-500 text-purple-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.label}
                <span className={`ml-2 py-0.5 px-2 rounded-full text-xs ${
                  activeMainTab === tab.id 
                    ? 'bg-purple-100 text-purple-600'
                    : 'bg-gray-100 text-gray-500'
                }`}>
                  {tab.count}
                </span>
              </button>
            ))}
          </nav>
        </div>

        {/* Sub-tabs and Search */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="flex border-b border-gray-200 md:border-b-0">
            <nav className="flex space-x-8">
              {[
                { id: 'all', label: `All ${activeMainTab}` },
                { id: 'network', label: 'My network' },
                { id: 'incoming', label: 'Incoming' },
                { id: 'sent', label: 'Sent' }
              ].map((subTab) => (
                <button
                  key={subTab.id}
                  onClick={() => setActiveSubTab(subTab.id)}
                  className={`whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm ${
                    activeSubTab === subTab.id
                      ? 'border-purple-500 text-purple-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  {subTab.label}
                </button>
              ))}
            </nav>
          </div>
          
          <div className="flex-1 md:max-w-md">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder={`Search for ${activeMainTab.slice(0, -1)} name`}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-white border-gray-300 focus:border-purple-500"
              />
            </div>
          </div>
        </div>

        {/* Filters */}
        {activeSubTab === 'all' && (
          <div className="flex flex-wrap gap-4 mb-8">
            <select className="px-4 py-2 border border-gray-300 rounded-lg text-sm">
              <option>Student&apos;s age</option>
              <option>Ages 5-8</option>
              <option>Ages 9-12</option>
              <option>Ages 13-16</option>
              <option>Ages 17+</option>
            </select>
            <select className="px-4 py-2 border border-gray-300 rounded-lg text-sm">
              <option>Type of collaboration</option>
              <option>Virtual Exchange</option>
              <option>Joint Projects</option>
              <option>Resource Sharing</option>
            </select>
            <select className="px-4 py-2 border border-gray-300 rounded-lg text-sm">
              <option>SDGs</option>
              <option>Quality Education</option>
              <option>Climate Action</option>
              <option>Peace & Justice</option>
            </select>
            <select className="px-4 py-2 border border-gray-300 rounded-lg text-sm">
              <option>Country</option>
              <option>Denmark</option>
              <option>Brazil</option>
              <option>Kenya</option>
              <option>India</option>
            </select>
          </div>
        )}

        {/* Content */}
        <div>
          {activeSubTab === 'all' && (
            <div className="mb-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                {activeMainTab === 'teachers' && 'Recommended teachers for you'}
                {activeMainTab === 'schools' && 'Recommended schools for you'}
                {activeMainTab === 'partners' && 'Recommended partners for you'}
              </h2>
            </div>
          )}
          {renderContent()}
        </div>
      </main>
    </div>
  )
}
