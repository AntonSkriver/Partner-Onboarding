'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { 
  Users, 
  Globe2, 
  Target, 
  School,
  Calendar,
  MapPin,
  Award,
  BookOpen,
  Clock,
  ArrowRight,
  CheckCircle2,
  Star
} from 'lucide-react'
import Link from 'next/link'
import { LanguageSwitcher } from '@/components/language-switcher'
import Image from 'next/image'

const featuredProject = {
  id: 1,
  title: "Children's Rights & Safe Communities",
  subtitle: "Ensuring Every Child Feels Heard and Has a Voice",
  partner: "UNICEF Denmark",
  partnerLogo: "/isotipo.png", // Using existing logo as placeholder
  description: "A global initiative connecting classrooms to discuss children's rights, create safe community spaces, and amplify young voices on issues that matter to them.",
  longDescription: "This comprehensive program brings together schools from around the world to explore children's rights through interactive workshops, collaborative projects, and peer-to-peer learning. Students work together to identify challenges in their communities, design solutions, and advocate for positive change.",
  stats: {
    schools: 47,
    countries: 15,
    students: 1247,
    teachers: 89,
    progress: 68
  },
  sdgs: [3, 4, 10, 16, 17],
  status: "active",
  duration: "12 months",
  startDate: "September 2024",
  endDate: "August 2025",
  highlights: [
    "Students created a Global Charter of Children's Rights",
    "Established 47 Safe Space Committees across participating schools",
    "Launched peer mediation programs in 23 schools",
    "Generated 156 community improvement proposals"
  ],
  participatingCountries: [
    { name: "Denmark", schools: 8, flag: "🇩🇰" },
    { name: "Kenya", schools: 5, flag: "🇰🇪" },
    { name: "Brazil", schools: 4, flag: "🇧🇷" },
    { name: "India", schools: 6, flag: "🇮🇳" },
    { name: "Philippines", schools: 4, flag: "🇵🇭" },
    { name: "Guatemala", schools: 3, flag: "🇬🇹" },
    { name: "Bangladesh", schools: 4, flag: "🇧🇩" },
    { name: "Uganda", schools: 3, flag: "🇺🇬" },
    { name: "Mexico", schools: 2, flag: "🇲🇽" },
    { name: "Cambodia", schools: 3, flag: "🇰🇭" },
    { name: "Peru", schools: 2, flag: "🇵🇪" },
    { name: "Ghana", schools: 2, flag: "🇬🇭" },
    { name: "Nepal", schools: 2, flag: "🇳🇵" },
    { name: "Morocco", schools: 2, flag: "🇲🇦" },
    { name: "Colombia", schools: 1, flag: "🇨🇴" }
  ]
}

const additionalProjects = [
  {
    id: 2,
    title: "Climate Action Champions",
    partner: "WWF International",
    description: "Students collaborate on environmental projects and climate solutions.",
    stats: { schools: 32, countries: 12, students: 856 },
    sdgs: [13, 14, 15],
    status: "active",
    progress: 45
  },
  {
    id: 3,
    title: "Digital Innovation Labs",
    partner: "Microsoft Education",
    description: "Cross-cultural tech projects fostering digital literacy and innovation.",
    stats: { schools: 28, countries: 9, students: 672 },
    sdgs: [4, 8, 9],
    status: "planning",
    progress: 15
  },
  {
    id: 4,
    title: "Global Peace Builders",
    partner: "UNESCO",
    description: "Youth-led peace initiatives connecting diverse communities worldwide.",
    stats: { schools: 41, countries: 18, students: 1034 },
    sdgs: [16, 17],
    status: "active",
    progress: 82
  }
]

export default function ProjectsPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center gap-3">
              <Link href="/" className="flex items-center gap-3">
                <Image 
                  src="/isotipo.png" 
                  alt="Class2Class Logo" 
                  width={40} 
                  height={40}
                  className="w-10 h-10"
                />
                <span className="text-xl font-semibold text-gray-900">Class2Class</span>
              </Link>
            </div>
            <nav className="hidden md:flex items-center space-x-8">
              <Link href="/" className="text-gray-600 hover:text-gray-900 transition-colors">Home</Link>
              <Link href="/partners" className="text-gray-600 hover:text-gray-900 transition-colors">Partners</Link>
              <LanguageSwitcher />
              <div className="flex items-center space-x-4">
                <Link href="/sign-in">
                  <Button variant="outline" className="border-[#7F56D9] text-[#7F56D9] hover:bg-purple-50">
                    Login
                  </Button>
                </Link>
                <Link href="/signup">
                  <Button className="bg-[#7F56D9] hover:bg-purple-700 text-white">
                    Sign Up
                  </Button>
                </Link>
              </div>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-16 bg-gradient-to-br from-[#DFCFFF] via-white to-[#DFCFFF]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Global Education Projects
            </h1>
            <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto">
              Discover collaborative learning experiences connecting classrooms worldwide through 
              meaningful partnerships focused on the UN Sustainable Development Goals.
            </p>
          </div>
          
          {/* Global Stats */}
          <div className="grid md:grid-cols-4 gap-6 max-w-4xl mx-auto">
            <div className="text-center bg-white/50 backdrop-blur-sm rounded-lg p-6">
              <div className="text-3xl font-bold text-[#7F56D9] mb-2">148</div>
              <div className="text-sm text-gray-600">Active Schools</div>
            </div>
            <div className="text-center bg-white/50 backdrop-blur-sm rounded-lg p-6">
              <div className="text-3xl font-bold text-[#7F56D9] mb-2">34</div>
              <div className="text-sm text-gray-600">Countries</div>
            </div>
            <div className="text-center bg-white/50 backdrop-blur-sm rounded-lg p-6">
              <div className="text-3xl font-bold text-[#7F56D9] mb-2">3,809</div>
              <div className="text-sm text-gray-600">Students</div>
            </div>
            <div className="text-center bg-white/50 backdrop-blur-sm rounded-lg p-6">
              <div className="text-3xl font-bold text-[#7F56D9] mb-2">287</div>
              <div className="text-sm text-gray-600">Teachers</div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Project */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <Badge className="mb-4 bg-yellow-100 text-yellow-800 hover:bg-yellow-200">
              <Star className="w-4 h-4 mr-1" />
              Featured Project
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              {featuredProject.title}
            </h2>
            <p className="text-xl text-gray-600 mb-6">
              {featuredProject.subtitle}
            </p>
          </div>

          <Card className="max-w-6xl mx-auto shadow-xl border-0">
            <CardHeader className="pb-4">
              <div className="flex items-center gap-4 mb-4">
                <Image 
                  src={featuredProject.partnerLogo} 
                  alt="Partner Logo" 
                  width={48} 
                  height={48}
                  className="w-12 h-12 rounded-lg"
                />
                <div>
                  <div className="text-sm text-gray-500">In partnership with</div>
                  <div className="font-semibold text-lg">{featuredProject.partner}</div>
                </div>
                <div className="ml-auto">
                  <Badge variant="secondary" className="bg-green-100 text-green-800">
                    {featuredProject.status}
                  </Badge>
                </div>
              </div>
              <p className="text-gray-600 leading-relaxed">
                {featuredProject.longDescription}
              </p>
            </CardHeader>
            
            <CardContent>
              {/* Project Stats */}
              <div className="grid md:grid-cols-5 gap-6 mb-8">
                <div className="text-center">
                  <div className="text-2xl font-bold text-[#7F56D9] mb-1">{featuredProject.stats.schools}</div>
                  <div className="text-sm text-gray-600 flex items-center justify-center gap-1">
                    <School className="w-4 h-4" />
                    Schools
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-[#7F56D9] mb-1">{featuredProject.stats.countries}</div>
                  <div className="text-sm text-gray-600 flex items-center justify-center gap-1">
                    <Globe2 className="w-4 h-4" />
                    Countries
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-[#7F56D9] mb-1">{featuredProject.stats.students.toLocaleString()}</div>
                  <div className="text-sm text-gray-600 flex items-center justify-center gap-1">
                    <Users className="w-4 h-4" />
                    Students
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-[#7F56D9] mb-1">{featuredProject.stats.teachers}</div>
                  <div className="text-sm text-gray-600 flex items-center justify-center gap-1">
                    <BookOpen className="w-4 h-4" />
                    Teachers
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-[#7F56D9] mb-1">{featuredProject.stats.progress}%</div>
                  <div className="text-sm text-gray-600 flex items-center justify-center gap-1">
                    <Target className="w-4 h-4" />
                    Complete
                  </div>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="mb-8">
                <div className="flex justify-between text-sm text-gray-600 mb-2">
                  <span>Project Progress</span>
                  <span>{featuredProject.stats.progress}% Complete</span>
                </div>
                <Progress value={featuredProject.stats.progress} className="h-2" />
              </div>

              {/* Project Highlights */}
              <div className="mb-8">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Award className="w-5 h-5 text-yellow-500" />
                  Key Achievements
                </h3>
                <div className="grid md:grid-cols-2 gap-3">
                  {featuredProject.highlights.map((highlight, index) => (
                    <div key={index} className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <span className="text-sm text-gray-700">{highlight}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Participating Countries */}
              <div className="mb-8">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-blue-500" />
                  Participating Countries
                </h3>
                <div className="grid grid-cols-3 md:grid-cols-5 gap-3">
                  {featuredProject.participatingCountries.map((country, index) => (
                    <div key={index} className="flex items-center gap-2 text-sm">
                      <span className="text-lg">{country.flag}</span>
                      <div>
                        <div className="font-medium">{country.name}</div>
                        <div className="text-xs text-gray-500">{country.schools} schools</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Project Duration */}
              <div className="flex items-center gap-6 text-sm text-gray-600 mb-6">
                <div className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  <span>{featuredProject.duration}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  <span>{featuredProject.startDate} - {featuredProject.endDate}</span>
                </div>
              </div>

              {/* CTA */}
              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/school/onboarding" className="flex-1">
                  <Button className="w-full bg-[#7F56D9] hover:bg-purple-700">
                    Join This Project
                    <ArrowRight className="ml-2 w-4 h-4" />
                  </Button>
                </Link>
                <Button variant="outline" className="flex-1">
                  Learn More
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Other Active Projects */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Other Active Projects
            </h2>
            <p className="text-lg text-gray-600">
              Explore more opportunities to connect your classroom globally
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {additionalProjects.map((project) => (
              <Card key={project.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex justify-between items-start mb-2">
                    <Badge 
                      variant={project.status === 'active' ? 'default' : 'secondary'}
                      className={project.status === 'active' ? 'bg-green-100 text-green-800' : ''}
                    >
                      {project.status}
                    </Badge>
                    <span className="text-sm text-gray-500">{project.stats.countries} countries</span>
                  </div>
                  <CardTitle className="text-xl mb-2">{project.title}</CardTitle>
                  <CardDescription className="text-sm text-gray-500 mb-2">
                    Partner: {project.partner}
                  </CardDescription>
                  <p className="text-sm text-gray-600">{project.description}</p>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                    <div>
                      <span className="font-medium">{project.stats.schools}</span>
                      <span className="text-gray-500 ml-1">schools</span>
                    </div>
                    <div>
                      <span className="font-medium">{project.stats.students}</span>
                      <span className="text-gray-500 ml-1">students</span>
                    </div>
                  </div>
                  
                  <div className="mb-4">
                    <div className="flex justify-between text-xs text-gray-500 mb-1">
                      <span>Progress</span>
                      <span>{project.progress}%</span>
                    </div>
                    <Progress value={project.progress} className="h-1.5" />
                  </div>

                  <Button 
                    variant="outline" 
                    className="w-full"
                    disabled={project.status === 'planning'}
                  >
                    {project.status === 'planning' ? 'Coming Soon' : 'Join Project'}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-[#7F56D9] to-indigo-600 text-white">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Ready to Connect Your Classroom?
          </h2>
          <p className="text-lg mb-8 text-purple-100 max-w-2xl mx-auto">
            Join thousands of educators and students creating positive change through 
            collaborative global education projects.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/school/onboarding">
              <Button size="lg" className="bg-white text-[#7F56D9] hover:bg-gray-50 px-8 py-3 text-lg font-semibold">
                Join as a School
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href="/partner/onboarding">
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-purple-600 px-8 py-3 text-lg font-semibold">
                Become a Partner
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center gap-3 mb-4 md:mb-0">
              <Link href="/" className="flex items-center gap-3">
                <Image 
                  src="/isotipo.png" 
                  alt="Class2Class Logo" 
                  width={32} 
                  height={32}
                  className="w-8 h-8"
                />
                <span className="text-lg font-semibold">Class2Class</span>
              </Link>
            </div>
            <div className="text-sm text-gray-400">
              © 2025 Class2Class. Connecting Classrooms for a Better World.
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}