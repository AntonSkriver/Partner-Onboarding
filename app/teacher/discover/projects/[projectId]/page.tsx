'use client'

import { useParams, useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowLeft, Calendar, Clock, Globe2, Languages, Share2, Users2, Building2 } from 'lucide-react'
import { useMemo, useState } from 'react'

import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { usePrototypeDb } from '@/hooks/use-prototype-db'
import { getCountryDisplay } from '@/lib/countries'
import { buildProgramSummary } from '@/lib/programs/selectors'

// Re-using mock data from discover-content for consistency if the ID matches
const MOCK_PROJECTS = [
    {
        id: '1',
        title: 'A Small Step To Save The World',
        subtitle: 'Change Is Started From ...',
        startMonth: 'September',
        image: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=500&h=300&fit=crop',
        description: 'This project began with a simple yet powerful idea to make students aware of environmental sustainability through local action and global collaboration.',
        projectType: 'Explore Global Challenges',
        ageRange: 'Ages 9 - 13 years',
        timezone: '+1 hour from you',
        language: 'English, Spanish',
        teacherName: 'Maria Garcia',
        teacherInitials: 'MG',
        teacherCountry: 'Spain',
        createdAt: 'Created 3 days ago',
    },
    {
        id: '2',
        title: 'Machine Learning Prediction System',
        subtitle: '',
        startMonth: 'August',
        image: 'https://images.unsplash.com/photo-1555949963-aa79dcee981c?w=500&h=300&fit=crop',
        description: 'The project is all about machine learning with python to create a model to predict disease patterns and understand data science concepts through practical application.',
        projectType: 'Create Solutions',
        ageRange: 'Ages 15 - 18 years',
        timezone: '+5 hours from you',
        language: 'English',
        teacherName: 'Raj Patel',
        teacherInitials: 'RP',
        teacherCountry: 'India',
        createdAt: 'Created 1 week ago',
    },
    {
        id: '3',
        title: 'Community Building Together',
        subtitle: '',
        startMonth: 'August',
        image: 'https://images.unsplash.com/photo-1573164713714-d95e436ab8d6?w=500&h=300&fit=crop',
        description: 'This project is designed to engage students both creatively and intellectually by exploring local communities, sharing traditions, and building cross-cultural understanding.',
        projectType: 'Cultural Exchange',
        ageRange: 'Ages 11 - 15 years',
        timezone: '-6 hours from you',
        language: 'English, French',
        teacherName: 'Sophie Martin',
        teacherInitials: 'SM',
        teacherCountry: 'Canada',
        createdAt: 'Created 2 weeks ago',
    },
]

export default function ProjectDetailsPage() {
    const params = useParams()
    const router = useRouter()
    const projectId = params.projectId as string
    const { database } = usePrototypeDb()
    const [isExpanded, setIsExpanded] = useState(false)

    const projectData = useMemo(() => {
        // 1. Check Mock Projects
        const mock = MOCK_PROJECTS.find((p) => p.id === projectId)
        if (mock) {
            return {
                type: 'mock',
                data: mock,
            }
        }

        // 2. Check Database Projects (Partner Programs)
        if (database) {
            const dbProject = database.programProjects.find((p) => p.id === projectId)
            if (dbProject) {
                const program = database.programs.find((p) => p.id === dbProject.programId)
                const template = database.programTemplates.find((t) => t.id === dbProject.templateId)
                const teacher = database.institutionTeachers.find((t) => t.id === dbProject.createdById)
                const institution = teacher ? database.institutions.find((i) => i.id === teacher.institutionId) : null
                const partner = program ? database.partners.find(p => p.id === program.partnerId) : null
                const partnerRelation = program ? database.programPartners.find(r => r.programId === program.id && r.role === 'host') : null

                // Build summary for metrics if needed, or just use raw data

                return {
                    type: 'database',
                    project: dbProject,
                    program,
                    template,
                    teacher,
                    institution,
                    partner,
                }
            }
        }

        return null
    }, [projectId, database])

    if (!projectData) {
        return (
            <div className="flex h-96 items-center justify-center">
                <div className="text-center">
                    <h2 className="text-xl font-semibold text-gray-900">Project not found</h2>
                    <Button variant="link" onClick={() => router.back()}>
                        Go back
                    </Button>
                </div>
            </div>
        )
    }

    // Normalize data for display
    const isMock = projectData.type === 'mock'
    const mock = isMock ? projectData.data : null
    const db = !isMock ? projectData : null

    const title = isMock ? mock?.title : (db?.template?.title ?? 'Untitled Project')
    const description = isMock ? mock?.description : (db?.template?.summary ?? 'No description available.')
    const image = isMock
        ? mock?.image
        : (db?.project?.coverImageUrl ?? db?.template?.heroImageUrl ?? db?.program?.heroImageUrl ?? 'https://images.unsplash.com/photo-1509062522246-3755977927d7?w=800&fit=crop')

    const creatorName = isMock
        ? mock?.teacherName
        : (db?.teacher ? `${db.teacher.firstName} ${db.teacher.lastName}` : 'Unknown Teacher')

    const creatorInitials = isMock
        ? mock?.teacherInitials
        : (db?.teacher ? `${db.teacher.firstName?.[0] ?? ''}${db.teacher.lastName?.[0] ?? ''}` : '??')

    const countryCode = isMock
        ? 'ES' // Mock default
        : (db?.institution?.country ?? 'US')

    const { flag, name: countryName } = getCountryDisplay(countryCode)

    const programName = db?.program?.displayTitle ?? db?.program?.name
    const partnerName = db?.partner?.organizationName
    const partnerLogo = db?.partner?.logo

    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            {/* Header / Nav */}
            <div className="bg-white border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center">
                    <Button variant="ghost" className="gap-2 text-gray-600 pl-0 hover:bg-transparent hover:text-gray-900" onClick={() => router.back()}>
                        <ArrowLeft className="h-4 w-4" />
                        Back to Discover
                    </Button>
                </div>
            </div>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-8">

                        {/* Hero Section */}
                        <div className="space-y-6">
                            <div className="aspect-video w-full relative rounded-xl overflow-hidden shadow-sm">
                                <Image
                                    src={image || ''}
                                    alt={title || 'Project cover'}
                                    fill
                                    className="object-cover"
                                />
                            </div>

                            <div>
                                {db?.program && (
                                    <Badge className="mb-3 bg-purple-100 text-purple-700 hover:bg-purple-200 border-none">
                                        {db.program.displayTitle}
                                    </Badge>
                                )}
                                <h1 className="text-3xl font-bold text-gray-900 leading-tight">{title}</h1>
                                {isMock && <p className="text-lg text-gray-500 mt-2">{mock?.subtitle}</p>}
                            </div>
                        </div>

                        {/* About Section */}
                        <Card>
                            <CardContent className="p-6 space-y-4">
                                <h3 className="text-xl font-semibold text-gray-900">About this project</h3>
                                <div className={`prose prose-purple max-w-none text-gray-600 ${!isExpanded ? 'line-clamp-4' : ''}`}>
                                    {description}
                                </div>
                                {description && description.length > 200 && (
                                    <Button
                                        variant="link"
                                        className="px-0 text-purple-600"
                                        onClick={() => setIsExpanded(!isExpanded)}
                                    >
                                        {isExpanded ? 'Read less' : 'Read more'}
                                    </Button>
                                )}
                            </CardContent>
                        </Card>

                        {/* Partner Section - ONLY for Partner Projects */}
                        {db?.program && db?.partner && (
                            <Card className="border-purple-100 bg-purple-50/30 overflow-hidden">
                                <CardContent className="p-6">
                                    <div className="flex flex-col sm:flex-row gap-6">
                                        {/* Partner Logo/Info */}
                                        <div className="flex-1 space-y-4">
                                            <div className="flex items-center gap-2 mb-2">
                                                <Building2 className="w-5 h-5 text-purple-600" />
                                                <h3 className="font-semibold text-gray-900">Partner Involved</h3>
                                            </div>

                                            <div className="flex items-center gap-4">
                                                {partnerLogo ? (
                                                    <div className="relative w-16 h-16 bg-white rounded-lg border border-gray-200 p-2 shadow-sm cursor-pointer hover:border-purple-300 transition-colors group" onClick={() => db.partner && router.push(`/teacher/partners/${db.partner.id}`)}>
                                                        <Image src={partnerLogo} alt={partnerName || 'Partner'} fill className="object-contain p-1" />
                                                        <div className="absolute inset-0 bg-black/5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity" />
                                                    </div>
                                                ) : (
                                                    <div className="w-16 h-16 bg-purple-100 rounded-lg flex items-center justify-center text-purple-600 font-bold text-xl cursor-pointer hover:bg-purple-200 transition-colors" onClick={() => db.partner && router.push(`/teacher/partners/${db.partner.id}`)}>
                                                        {partnerName?.[0] ?? 'P'}
                                                    </div>
                                                )}

                                                <div>
                                                    <p className="font-medium text-gray-900 leading-tight">{partnerName}</p>

                                                    {/* Explicit call to action next to logo */}
                                                    <button
                                                        onClick={() => db.partner && router.push(`/teacher/partners/${db.partner.id}`)}
                                                        className="text-xs font-medium text-purple-600 hover:text-purple-700 hover:underline flex items-center gap-1 mt-1"
                                                    >
                                                        Go to partner page
                                                        <ArrowLeft className="w-3 h-3 rotate-180" />
                                                    </button>

                                                    <div className="mt-2 pt-2 border-t border-purple-200/50">
                                                        <Link href={`/teacher/discover/programs/${db.program.id}`} className="text-sm text-gray-600 hover:text-purple-700 hover:underline flex items-center gap-1">
                                                            View Program Details
                                                        </Link>
                                                    </div>
                                                </div>
                                            </div>
                                            <p className="text-sm text-gray-600 mb-3 text-center sm:text-right">
                                                This project is part of the <strong>{programName}</strong> community.
                                            </p>
                                            <Button className="w-full sm:w-auto bg-purple-600 hover:bg-purple-700 text-white" onClick={() => db.program && router.push(`/teacher/discover/programs/${db.program.id}`)}>
                                                Visit Program Page
                                            </Button>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">

                        {/* Join / Share */}
                        <Card className="shadow-md border-purple-100">
                            <CardContent className="p-6 space-y-4">
                                <div className="text-center">
                                    <p className="text-sm text-gray-500 mb-1">Interested in this collaboration?</p>
                                    <Button className="w-full text-lg py-6 bg-purple-600 hover:bg-purple-700 shadow-lg shadow-purple-200">
                                        Request to Join
                                    </Button>
                                </div>
                                <Button variant="outline" className="w-full gap-2">
                                    <Share2 className="w-4 h-4" />
                                    Share Project
                                </Button>
                            </CardContent>
                        </Card>

                        {/* Teacher Info */}
                        <Card>
                            <CardContent className="p-6">
                                <h3 className="font-semibold text-gray-900 mb-4">Teacher Involved</h3>
                                <div className="flex items-center gap-3">
                                    <div className="h-12 w-12 rounded-full bg-purple-100 flex items-center justify-center text-purple-700 font-bold text-lg">
                                        {creatorInitials}
                                    </div>
                                    <div>
                                        <p className="font-medium text-gray-900">{creatorName}</p>
                                        {db?.teacher?.subject && <p className="text-xs text-gray-500">{db.teacher.subject} Teacher</p>}
                                        <div className="flex items-center gap-1 mt-1">
                                            <span className="text-lg">{flag}</span>
                                            <span className="text-sm text-gray-600">{countryName}</span>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Details List */}
                        <Card>
                            <CardContent className="p-6 space-y-4">
                                <div className="flex items-start gap-3">
                                    <Clock className="w-5 h-5 text-gray-400 mt-0.5" />
                                    <div>
                                        <p className="text-sm font-medium text-gray-900">Timeline</p>
                                        <p className="text-sm text-gray-600">
                                            Starts in {isMock ? mock?.startMonth : (db?.template?.recommendedStartMonth ?? 'Flexible')}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-3">
                                    <Users2 className="w-5 h-5 text-gray-400 mt-0.5" />
                                    <div>
                                        <p className="text-sm font-medium text-gray-900">Age Group</p>
                                        <p className="text-sm text-gray-600">
                                            {isMock ? mock?.ageRange : (db?.program?.targetAgeRanges?.join(', ') ?? 'All ages')}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-3">
                                    <Globe2 className="w-5 h-5 text-gray-400 mt-0.5" />
                                    <div>
                                        <p className="text-sm font-medium text-gray-900">Project Type</p>
                                        <p className="text-sm text-gray-600 capitalize">
                                            {isMock ? mock?.projectType : (db?.program?.projectTypes?.[0]?.replaceAll('_', ' ') ?? 'Collaboration')}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-3">
                                    <Languages className="w-5 h-5 text-gray-400 mt-0.5" />
                                    <div>
                                        <p className="text-sm font-medium text-gray-900">Language</p>
                                        <p className="text-sm text-gray-600">
                                            {isMock ? mock?.language : (db?.institution?.languages?.join(', ') ?? 'English')}
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                    </div>
                </div>
            </main>
        </div>
    )
}
