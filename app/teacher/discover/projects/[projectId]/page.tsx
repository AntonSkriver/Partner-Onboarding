'use client'

import { useParams, useRouter } from 'next/navigation'
import Image from 'next/image'
import { ArrowLeft, Clock, Globe2, Languages, Share2, Users2, FileText, Sparkles, Shield } from 'lucide-react'
import { useMemo, useState } from 'react'

import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { usePrototypeDb } from '@/hooks/use-prototype-db'
import { getCountryDisplay } from '@/lib/countries'
import { cn } from '@/lib/utils'

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

    // Normalize data for display
    const isMock = projectData?.type === 'mock'
    const mock = isMock && projectData ? projectData.data : null
    const db = projectData && !isMock ? projectData : null

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
    const languageSupport = isMock
        ? mock?.language
        : (db?.template?.languageSupport?.map(l => l.toUpperCase()).join(', ') ??
            db?.institution?.languages?.map(l => l.toUpperCase()).join(', ') ??
            'EN')

    const collaborationType = isMock
        ? mock?.projectType
        : (db?.program?.projectTypes?.[0]?.replaceAll('_', ' ') ?? 'Collaboration')

    const ageGroup = isMock
        ? mock?.ageRange
        : (db?.program?.targetAgeRanges?.map(range => `${range.replace('-', ' - ')} yrs`).join(' • ') ?? 'All ages')

    const startWindow = isMock
        ? mock?.startMonth
        : (db?.template?.recommendedStartMonth ?? 'Flexible start')

    const duration = db?.template?.estimatedDurationWeeks
        ? `${db.template.estimatedDurationWeeks} week${db.template.estimatedDurationWeeks > 1 ? 's' : ''}`
        : 'Flexible pacing'

    const teacherAvatar = useMemo(() => {
        if (creatorName?.includes('Ulla Jensen')) return '/images/avatars/ulla-new.jpg'
        if (creatorName?.includes('Karin Albrectsen')) return '/images/avatars/karin-new.jpg'
        if (creatorName?.includes('Maria Garcia')) return '/images/avatars/maria-new.jpg'
        if (creatorName?.includes('Raj Patel')) return '/images/avatars/raj-new.jpg'
        if (creatorName?.includes('Jonas Madsen')) return '/images/avatars/jonas-final.jpg?v=final'
        return null
    }, [creatorName])

    const resources = useMemo(() => {
        const base = [
            {
                title: 'Document "Policies for the C2C Teaching Community"',
                description: 'Ensure everyone enjoys a respectful, productive collaboration space before kicking off.',
            },
            {
                title: 'Document "Coexistence Policy"',
                description: 'Shared guidelines that help partner classes align on communication, safety, and tone.',
            },
            {
                title: 'Activity "Get to know each other"',
                description: 'Start with a quick icebreaker so students feel ready to co-create and share perspectives.',
            },
        ]

        if (db?.template?.requiredMaterials?.length) {
            const materials = db.template.requiredMaterials.slice(0, 3).join(' • ')
            base.push({
                title: 'Project materials checklist',
                description: materials,
            })
        }

        return base.slice(0, 3)
    }, [db?.template?.requiredMaterials])

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

    return (
        <div className="min-h-screen bg-[#f5f4fb]">
            <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                <div className="flex items-center justify-between gap-3 mb-3">
                    <Button
                        variant="outline"
                        className="bg-white text-sm text-purple-700 border-white hover:border-purple-200 hover:bg-white"
                        onClick={() => router.back()}
                    >
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Go Back
                    </Button>
                    <Button className="bg-[#7f56d9] hover:bg-[#6b47bf] text-white shadow-md px-4 h-9">
                        Request to join
                    </Button>
                </div>

                <div className="flex flex-col lg:flex-row gap-4 items-start">
                    <div className="flex-1 space-y-4 min-w-0">
                        <div className="rounded-xl bg-[#d9c8ff] border border-purple-100 shadow-sm p-3 space-y-2.5">
                            <div className="flex items-center gap-2.5 bg-white/85 rounded-lg px-3 py-2 w-full sm:w-auto">
                                <div className="relative h-8 w-8 rounded-full overflow-hidden border border-purple-50 shrink-0">
                                    {teacherAvatar ? (
                                        <Image src={teacherAvatar} alt={creatorName} fill className="object-cover" />
                                    ) : (
                                        <div className="h-full w-full bg-purple-100 flex items-center justify-center text-purple-700 font-semibold text-xs">
                                            {creatorInitials}
                                        </div>
                                    )}
                                </div>
                                <p className="text-xs text-gray-700 leading-snug">
                                    <span className="font-semibold text-gray-900">{creatorName}</span> has created the project{' '}
                                    <span className="font-semibold text-gray-900">"{title}"</span> in Class2Class.org
                                </p>
                            </div>

                            <div className="flex flex-col sm:flex-row gap-3 items-start">
                                <div className="w-[150px] rounded-lg bg-white border border-purple-50 shadow-sm overflow-hidden">
                                    <div className="relative aspect-[3/4]">
                                        <Image
                                            src={image || ''}
                                            alt={title || 'Project cover'}
                                            fill
                                            className="object-cover"
                                        />
                                    </div>
                                </div>

                                <div className="flex-1 space-y-2">
                                    <div className="flex items-center gap-1.5 flex-wrap">
                                        {partnerName && (
                                            <div className="flex items-center gap-1 rounded-full bg-white border border-purple-50 px-2.5 py-1 shadow-sm">
                                                <Sparkles className="h-3.5 w-3.5 text-purple-600" />
                                                <span className="text-[11px] font-semibold text-gray-800">{partnerName}</span>
                                            </div>
                                        )}
                                        <div className="flex items-center gap-1 rounded-full bg-white border border-purple-50 px-2.5 py-1 shadow-sm">
                                            <Shield className="h-3.5 w-3.5 text-purple-600" />
                                            <span className="text-[11px] font-semibold text-gray-800">{collaborationType}</span>
                                        </div>
                                        {programName && (
                                            <Badge className="bg-white text-purple-700 border border-purple-100 shadow-sm text-[11px]">
                                                {programName}
                                            </Badge>
                                        )}
                                    </div>

                                    <div className="space-y-0.5">
                                        <h1 className="text-xl font-semibold text-gray-900 leading-tight">{title}</h1>
                                        {programName && (
                                            <p className="text-xs text-gray-700">{db?.program?.marketingTagline ?? 'Cross-class collaboration to grow community and belonging.'}</p>
                                        )}
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-w-xl">
                                        <div className="rounded-lg bg-white border border-purple-50 p-2 shadow-sm">
                                            <p className="text-[10px] font-semibold text-gray-600 uppercase">Type of collaboration</p>
                                            <p className="text-sm font-medium text-gray-900 mt-0.5">{collaborationType}</p>
                                        </div>
                                        <div className="rounded-lg bg-white border border-purple-50 p-2 shadow-sm">
                                            <p className="text-[10px] font-semibold text-gray-600 uppercase">Age group</p>
                                            <p className="text-sm font-medium text-gray-900 mt-0.5">{ageGroup}</p>
                                        </div>
                                        <div className="rounded-lg bg-white border border-purple-50 p-2 shadow-sm">
                                            <p className="text-[10px] font-semibold text-gray-600 uppercase">Languages</p>
                                            <p className="text-sm font-medium text-gray-900 mt-0.5">{languageSupport}</p>
                                        </div>
                                        <div className="rounded-lg bg-white border border-purple-50 p-2 shadow-sm">
                                            <p className="text-[10px] font-semibold text-gray-600 uppercase">Start window</p>
                                            <p className="text-sm font-medium text-gray-900 mt-0.5">{startWindow}</p>
                                        </div>
                                    </div>

                                    <div className="rounded-xl bg-white border border-purple-50 shadow-sm p-3">
                                        <h3 className="text-sm font-semibold text-gray-900 mb-1">What is this project about?</h3>
                                        <p className={cn('text-sm text-gray-700 leading-relaxed', !isExpanded && 'line-clamp-3')}>
                                            {description}
                                        </p>
                                        {description && description.length > 200 && (
                                            <button
                                                onClick={() => setIsExpanded(!isExpanded)}
                                                className="mt-1.5 text-sm font-medium text-purple-700 hover:text-purple-800"
                                            >
                                                {isExpanded ? 'Show less' : 'Read more'}
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <Card className="shadow-sm border border-purple-50">
                            <CardContent className="p-4 space-y-3">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-base font-semibold text-gray-900">Resources and tools</h3>
                                    <Badge className="bg-purple-50 text-purple-700 border border-purple-100 text-[11px]">
                                        Curated for partners
                                    </Badge>
                                </div>
                                <div className="space-y-2">
                                    {resources.map((resource) => (
                                        <div key={resource.title} className="flex items-start gap-3 rounded-xl border border-purple-50 bg-white px-4 py-3 shadow-sm">
                                            <div className="mt-0.5 rounded-full bg-purple-100 text-purple-700 p-2 shadow-inner">
                                                <FileText className="h-4 w-4" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-semibold text-gray-900">{resource.title}</p>
                                                <p className="text-sm text-gray-600 leading-relaxed">{resource.description}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    <div className="w-full lg:w-[360px] flex-shrink-0 space-y-3">
                        <Card className="border border-purple-100 bg-white shadow-sm">
                            <CardContent className="p-4 space-y-2">
                                <p className="text-sm text-gray-700">Be part of this project</p>
                                <Button className="w-full bg-[#7f56d9] hover:bg-[#6b47bf] text-white shadow-md h-9 text-sm">
                                    Request to join
                                </Button>
                                <Button variant="outline" className="w-full gap-2 h-9 text-sm">
                                    <Share2 className="w-4 h-4" />
                                    Share project
                                </Button>
                            </CardContent>
                        </Card>

                        <Card className="border border-purple-50 shadow-sm">
                            <CardContent className="p-4 space-y-3">
                                <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                                    Teachers involved <span className="text-gray-400 font-normal">(1)</span>
                                </h3>
                                <div className="flex items-start gap-3">
                                    <div className="h-9 w-9 rounded-full overflow-hidden relative border border-purple-100 shrink-0">
                                        {teacherAvatar ? (
                                            <Image src={teacherAvatar} alt={creatorName} fill className="object-cover" />
                                        ) : (
                                            <div className="h-full w-full bg-gray-100 flex items-center justify-center text-gray-600 font-semibold">
                                                {creatorInitials}
                                            </div>
                                        )}
                                    </div>
                                    <div>
                                        <p className="font-semibold text-gray-900 leading-tight text-sm">
                                            {creatorName} <span className="text-[11px] font-normal text-gray-500 ml-1">(Host)</span>
                                        </p>
                                        <div className="flex items-center gap-1.5 mt-1">
                                            <span className="text-sm leading-none">{flag}</span>
                                            <span className="text-[11px] text-gray-500 pb-0.5">{countryName}</span>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {db?.program && db?.partner && (
                            <Card className="border border-purple-50 shadow-sm">
                                <CardContent className="p-4 space-y-3">
                                    <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                                        Partner involved <span className="text-gray-400 font-normal">(1)</span>
                                    </h3>
                                    <div className="flex items-start gap-3">
                                        {partnerLogo ? (
                                            <div
                                                className="relative w-9 h-9 rounded-full overflow-hidden border border-purple-100 shrink-0 cursor-pointer"
                                                onClick={() => db.partner && router.push(`/teacher/partners/${db.partner.id}`)}
                                            >
                                                <Image src={partnerLogo} alt={partnerName || 'Partner'} fill className="object-cover" />
                                            </div>
                                        ) : (
                                            <div
                                                className="w-9 h-9 bg-purple-100 text-purple-700 rounded-full flex items-center justify-center font-semibold shrink-0 cursor-pointer text-sm"
                                                onClick={() => db.partner && router.push(`/teacher/partners/${db.partner.id}`)}
                                            >
                                                {partnerName?.[0] ?? 'P'}
                                            </div>
                                        )}
                                        <div className="flex-1">
                                            <p
                                                className="font-semibold text-gray-900 leading-tight truncate cursor-pointer hover:text-purple-700 text-sm"
                                                onClick={() => db.partner && router.push(`/teacher/partners/${db.partner.id}`)}
                                            >
                                                {partnerName}
                                            </p>
                                            <p className="text-[11px] text-gray-500 mt-0.5">Partner organization</p>
                                            <button
                                                onClick={() => db.program && router.push(`/teacher/discover/programs/${db.program.id}`)}
                                                className="text-[11px] font-medium text-purple-700 hover:text-purple-800 mt-2"
                                            >
                                                View program
                                            </button>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        <Card className="border border-purple-50 shadow-sm">
                            <CardContent className="p-4 space-y-3">
                                <div className="flex items-start gap-3">
                                    <Clock className="w-4 h-4 text-gray-400 mt-0.5" />
                                    <div>
                                        <p className="text-sm font-medium text-gray-900">Timeline</p>
                                        <p className="text-sm text-gray-600">Starts in {startWindow} · {duration}</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3">
                                    <Users2 className="w-4 h-4 text-gray-400 mt-0.5" />
                                    <div>
                                        <p className="text-sm font-medium text-gray-900">Age group</p>
                                        <p className="text-sm text-gray-600">{ageGroup}</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3">
                                    <Globe2 className="w-4 h-4 text-gray-400 mt-0.5" />
                                    <div>
                                        <p className="text-sm font-medium text-gray-900">Project type</p>
                                        <p className="text-sm text-gray-600 capitalize">{collaborationType}</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3">
                                    <Languages className="w-4 h-4 text-gray-400 mt-0.5" />
                                    <div>
                                        <p className="text-sm font-medium text-gray-900">Language</p>
                                        <p className="text-sm text-gray-600">{languageSupport}</p>
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
