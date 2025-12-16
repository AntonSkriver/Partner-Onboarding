'use client'

import React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useParams } from 'next/navigation'
import { useState, useEffect, useMemo } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import {
    Mail,
    BarChart3,
    Award,
    Tag,
    Target,
    Building2,
    ShieldCheck,
    MapPin,
    Layers,
    BookOpen,
    Users,
    Globe,
    ArrowLeft
} from 'lucide-react'

import { usePrototypeDb } from '@/hooks/use-prototype-db'
import { SDGIcon } from '@/components/sdg-icons'
import { SDG_OPTIONS } from '@/contexts/partner-onboarding-context'
import {
    buildProgramSummariesForPartner,
    aggregateProgramMetrics,
    type ProgramSummary,
} from '@/lib/programs/selectors'

const CRC_ARTICLE_DETAILS: Record<string, { title: string }> = {
    '12': { title: 'Respect for the views of the child' },
    '13': { title: 'Freedom of expression' },
    '24': { title: 'Health and health services' },
    '28': { title: 'Right to education' },
    '31': { title: 'Leisure, play, and culture' },
}

export default function TeacherPartnerProfilePage() {
    const params = useParams<{ partnerId: string }>()
    const { ready, database } = usePrototypeDb()
    const [loading, setLoading] = useState(true)

    const [isClient, setIsClient] = useState(false)

    useEffect(() => {
        setIsClient(true)
        if (ready) {
            setLoading(false)
        }
    }, [ready])

    const partner = useMemo(() => {
        if (!database || !params?.partnerId) return null
        return database.partners.find(p => p.id === params.partnerId)
    }, [database, params?.partnerId])

    const programSummaries = useMemo<ProgramSummary[]>(() => {
        if (!database || !partner) {
            return []
        }
        return buildProgramSummariesForPartner(database, partner.id, {
            includeRelatedPrograms: true,
        })
    }, [database, partner])

    const aggregatedMetrics = useMemo(() => {
        // Mock metrics if no programs
        if (programSummaries.length === 0) {
            return {
                programs: 0,
                resources: 0,
                countries: 1, // Organization country
                students: 0,
            }
        }
        const agg = aggregateProgramMetrics(programSummaries)
        return {
            programs: programSummaries.length,
            resources: 3, // Mock
            countries: agg.countryCount || 1,
            students: agg.students || 0,
        }
    }, [programSummaries])

    // Determine SDG Focus
    const sdgFocus = useMemo(() => {
        if (!partner?.sdgFocus) return []
        return (partner.sdgFocus as unknown[]).map(val => {
            if (typeof val === 'number') return val;
            if (typeof val === 'string') {
                const match = val.match(/SDG\s?(\d+)/i);
                return match ? parseInt(match[1]) : parseInt(val);
            }
            return NaN;
        }).filter(n => !isNaN(n));
    }, [partner]);

    // Aggregating CRCs from programs
    const partnerCrcFocus = useMemo(() => {
        const crcSet = new Set<string>();
        programSummaries.forEach(summary => {
            summary.program.crcFocus?.forEach(crc => crcSet.add(String(crc)));
        });
        return Array.from(crcSet).sort((a, b) => parseInt(a) - parseInt(b));
    }, [programSummaries]);

    if (!isClient) {
        return (
            <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">
                <Skeleton className="h-40 w-full rounded-2xl" />
                <div className="grid gap-4 md:grid-cols-3">
                    <Skeleton className="h-48 rounded-2xl" />
                    <Skeleton className="h-48 rounded-2xl" />
                    <Skeleton className="h-48 rounded-2xl" />
                </div>
            </div>
        )
    }

    if (loading) {
        return (
            <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">
                <Skeleton className="h-40 w-full rounded-2xl" />
                <div className="grid gap-4 md:grid-cols-3">
                    <Skeleton className="h-48 rounded-2xl" />
                    <Skeleton className="h-48 rounded-2xl" />
                    <Skeleton className="h-48 rounded-2xl" />
                </div>
            </div>
        )
    }

    if (!partner) {
        return (
            <div className="max-w-7xl mx-auto px-4 py-8">
                <Button variant="ghost" size="sm" asChild className="px-0 mb-6 text-purple-600 hover:text-purple-700">
                    <Link href="/teacher/discover">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back to Discover
                    </Link>
                </Button>
                <Card>
                    <CardContent className="p-10 text-center">
                        <Building2 className="mx-auto mb-4 h-12 w-12 text-gray-400" />
                        <h2 className="mb-2 text-lg font-semibold text-gray-900">Partner Not Found</h2>
                        <p className="text-gray-600">The organization profile you are looking for could not be found.</p>
                    </CardContent>
                </Card>
            </div>
        )
    }

    // Use data from partner record or fallback/mock data (similar to parent profile)
    const contactEmail = partner.contactEmail
    const thematicTags = ["Children's Rights", "Global Citizenship", "Education"] // Mock or add to Partner type
    const countriesOfOperation = [partner.country, "Global"] // Mock

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">

            {/* Header Section */}
            <div className="space-y-6">
                <Button variant="ghost" size="sm" asChild className="px-0 text-purple-600 hover:text-purple-700">
                    <Link href="/teacher/discover">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back to Discover
                    </Link>
                </Button>

                <div className="flex items-center gap-6">
                    {partner.logo ? (
                        <div className="relative h-24 w-24 rounded-xl border border-gray-100 bg-white p-2 shadow-sm">
                            <Image src={partner.logo} alt={partner.organizationName} fill className="object-contain p-2" />
                        </div>
                    ) : (
                        <div className="h-24 w-24 rounded-xl bg-purple-100 flex items-center justify-center text-3xl font-bold text-purple-600">
                            {partner.organizationName.charAt(0)}
                        </div>
                    )}
                    <div>
                        <h1 className="text-3xl font-semibold text-gray-900">{partner.organizationName}</h1>
                        <div className="flex items-center gap-2 mt-2">
                            <Badge variant="secondary" className="capitalize">{partner.organizationType}</Badge>
                            <div className="flex items-center text-sm text-gray-500">
                                <MapPin className="h-3.5 w-3.5 mr-1" />
                                {partner.country}
                            </div>
                        </div>
                    </div>
                </div>

                <div>
                    <h2 className="text-xl font-semibold text-gray-900">Organization Overview</h2>
                    <p className="text-sm text-gray-600">
                        Learn more about {partner.organizationName} and their impact.
                    </p>
                </div>
            </div>

            {/* Detailed Information Sections */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                {/* Contact Information */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Mail className="h-4 w-4" />
                            Contact Information
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <div className="flex items-center space-x-2 text-sm">
                                <Mail className="h-3 w-3 text-gray-500" />
                                <span className="text-gray-800">{contactEmail}</span>
                            </div>
                            {partner.website && (
                                <div className="flex items-center space-x-2 text-sm">
                                    <Globe className="h-3 w-3 text-gray-500" />
                                    <a href={partner.website} target="_blank" rel="noopener noreferrer" className="text-purple-600 hover:underline">
                                        Website
                                    </a>
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Thematic Areas */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Tag className="h-4 w-4" />
                            Thematic Areas
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {thematicTags.length > 0 ? (
                            <div className="flex flex-wrap gap-2">
                                {thematicTags.map((tag) => (
                                    <Badge key={tag} variant="outline">
                                        {tag}
                                    </Badge>
                                ))}
                            </div>
                        ) : (
                            <p className="text-gray-500">No thematic areas specified</p>
                        )}
                    </CardContent>
                </Card>

                {/* Geographic Scope */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <MapPin className="h-4 w-4" />
                            Geographic Scope
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex flex-wrap gap-2">
                            {countriesOfOperation.map((country) => (
                                <Badge key={country} variant="secondary" className="text-xs">
                                    {country}
                                </Badge>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Mission Statement */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Target className="h-4 w-4" />
                        Our Mission
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="leading-relaxed text-gray-700">
                        {partner.mission || partner.description || "Mission statement not available."}
                    </p>
                </CardContent>
            </Card>

            {/* Quick Stats */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <BarChart3 className="h-4 w-4" />
                        Quick Stats
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                        {[
                            {
                                label: 'Countries',
                                value: aggregatedMetrics.countries,
                                icon: Globe,
                                color: 'text-purple-700',
                                bg: 'bg-purple-50',
                            },
                            {
                                label: 'Programs',
                                value: aggregatedMetrics.programs,
                                icon: Layers,
                                color: 'text-blue-700',
                                bg: 'bg-blue-50',
                            },
                            {
                                label: 'Resources',
                                value: aggregatedMetrics.resources,
                                icon: BookOpen,
                                color: 'text-emerald-700',
                                bg: 'bg-emerald-50',
                            },
                            {
                                label: 'Students',
                                value: aggregatedMetrics.students.toLocaleString(),
                                icon: Users,
                                color: 'text-amber-700',
                                bg: 'bg-amber-50',
                            },
                        ].map((stat) => (
                            <div
                                key={stat.label}
                                className="flex items-center gap-3 rounded-xl border border-gray-100 bg-white p-4 shadow-sm"
                            >
                                <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${stat.bg}`}>
                                    <stat.icon className={`h-5 w-5 ${stat.color}`} />
                                </div>
                                <div>
                                    <p className="text-xl font-semibold text-gray-900">{stat.value}</p>
                                    <p className="text-xs uppercase tracking-wide text-gray-600">{stat.label}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>

            {/* SDG Focus */}
            {sdgFocus.length > 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Award className="h-4 w-4" />
                            UN SDG Focus
                        </CardTitle>
                        <CardDescription>
                            Priority Sustainable Development Goals this organization advances.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
                            {sdgFocus.map((sdgId) => {
                                const sdg = SDG_OPTIONS.find((s) => s.id === sdgId)
                                return sdg ? (
                                    <div key={sdgId} className="flex flex-col items-center gap-2">
                                        <SDGIcon number={sdgId} size="lg" showTitle={false} />
                                        <p className="text-center text-xs leading-tight text-gray-900">
                                            {sdg.title}
                                        </p>
                                    </div>
                                ) : null
                            })}
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* CRC Focus (Derived from Programs) */}
            {partnerCrcFocus.length > 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <ShieldCheck className="h-4 w-4" />
                            CRC Child Rights Focus
                        </CardTitle>
                        <CardDescription>
                            Key articles from the Convention on the Rights of the Child supported by this partner&apos;s programs.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
                            {partnerCrcFocus.map((article) => {
                                const paddedNum = article.toString().padStart(2, '0')
                                const imageUrl = `/crc/icons/article-${paddedNum}.png`
                                const details = CRC_ARTICLE_DETAILS[article] ?? { title: `Article ${article}` }

                                return (
                                    <div key={article} className="flex flex-col items-center gap-2">
                                        <div className="relative h-20 w-20">
                                            <Image src={imageUrl} alt={`CRC Article ${article}`} fill className="object-contain" />
                                        </div>
                                        <p className="text-center text-xs leading-tight text-gray-900">
                                            {details.title}
                                        </p>
                                    </div>
                                )
                            })}
                        </div>
                    </CardContent>
                </Card>
            )}

        </div>
    )
}
