'use client'

import Link from 'next/link'
import Image from 'next/image'
import { ArrowRight, CalendarDays, ExternalLink } from 'lucide-react'
import { motion } from 'framer-motion'

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { useTeacherContext } from '@/hooks/use-teacher-context'
import { EmptyState } from '@/components/ui/empty-state'

export default function TeacherProgramsPage() {
    const {
        ready,
        session,
        programSummaries,
        database,
    } = useTeacherContext()

    const isLoading = !ready || !database

    if (isLoading) {
        return (
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <Skeleton className="h-8 w-48" />
                </div>
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {[1, 2, 3].map((i) => (
                        <Skeleton key={i} className="h-[300px] rounded-xl" />
                    ))}
                </div>
            </div>
        )
    }

    if (!session) {
        return (
            <Card className="border-dashed">
                <CardHeader>
                    <CardTitle>Teacher session required</CardTitle>
                    <CardDescription>
                        Use the “Log in as teacher” preview button from the partner dashboard to view this page.
                    </CardDescription>
                </CardHeader>
            </Card>
        )
    }

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-2xl font-bold text-gray-900">My Programs</h1>
                <p className="text-gray-500">
                    Partner programs you have joined or been invited to.
                </p>
            </div>

            {programSummaries.length === 0 ? (
                <EmptyState
                    icon={<ExternalLink className="h-10 w-10 text-gray-400" />}
                    title="No programs yet"
                    description="You haven't joined any partner programs yet. Browse the Discover page to find opportunities."
                    action={
                        <Button asChild>
                            <Link href="/teacher/discover">Browse Programs</Link>
                        </Button>
                    }
                />
            ) : (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {programSummaries.map((summary) => {
                        const partner = database.partners.find(p => p.id === summary.program.partnerId)
                        const isUnicef = partner?.organizationName?.toLowerCase().includes('unicef') || summary.program.name?.toLowerCase().includes('unicef')
                        const isSaveTheChildren = partner?.organizationName?.toLowerCase().includes('save the children') ||
                            summary.program.name?.toLowerCase().includes('save the children') ||
                            summary.program.name?.toLowerCase().includes('build the change')
                        return (
                            <Card key={summary.program.id} className="flex h-full flex-col overflow-hidden hover:shadow-lg transition-all duration-200">
                                <div className="relative h-40 bg-gray-100">
                                    {summary.program.heroImageUrl ? (
                                        <img
                                            src={summary.program.heroImageUrl}
                                            alt={summary.program.name}
                                            className="h-full w-full object-cover"
                                        />
                                    ) : (
                                        <div className="flex h-full w-full items-center justify-center text-gray-400">
                                            <CalendarDays className="h-10 w-10" />
                                        </div>
                                    )}

                                    {/* UNICEF Ribbon Banner */}
                                    {isUnicef && (
                                        <motion.div
                                            className="pointer-events-none absolute top-0 right-0 z-10 overflow-hidden w-28 h-28"
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            transition={{ duration: 0.3 }}
                                        >
                                            <motion.div
                                                className="absolute top-[16px] -right-[30px] w-[140px] bg-gradient-to-r from-[#00AEEF] via-[#29B6F6] to-[#00AEEF] py-2 rotate-45 shadow-lg flex items-center justify-center"
                                                initial={{ x: 50, opacity: 0 }}
                                                animate={{ x: 0, opacity: 1 }}
                                                transition={{ type: "spring", stiffness: 150, damping: 20, delay: 0.2 }}
                                            >
                                                <motion.div
                                                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                                                    initial={{ x: '-100%' }}
                                                    animate={{ x: '200%' }}
                                                    transition={{ duration: 1.5, repeat: Infinity, repeatDelay: 3, ease: "easeInOut" }}
                                                />
                                                <div className="relative z-10 flex items-center gap-1.5">
                                                    <Image src="/partners/unicef-logo.png" alt="UNICEF" width={26} height={26} className="drop-shadow-sm brightness-0 invert" />
                                                    <span className="text-white text-[10px] font-bold tracking-wider drop-shadow-sm">UNICEF</span>
                                                </div>
                                            </motion.div>
                                            <div className="absolute top-[42px] right-0 w-0 h-0 border-l-[6px] border-l-[#0277BD] border-b-[6px] border-b-transparent" />
                                            <div className="absolute top-0 right-[42px] w-0 h-0 border-t-[6px] border-t-transparent border-r-[6px] border-r-[#0277BD]" />
                                        </motion.div>
                                    )}

                                    {/* Save the Children Ribbon Banner */}
                                    {isSaveTheChildren && (
                                        <motion.div
                                            className="pointer-events-none absolute top-0 right-0 z-10 overflow-hidden w-28 h-28"
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            transition={{ duration: 0.3 }}
                                        >
                                            <motion.div
                                                className="absolute top-[16px] -right-[30px] w-[140px] bg-gradient-to-r from-[#E31B23] via-[#FF3B3B] to-[#E31B23] py-2 rotate-45 shadow-lg flex items-center justify-center"
                                                initial={{ x: 50, opacity: 0 }}
                                                animate={{ x: 0, opacity: 1 }}
                                                transition={{ type: "spring", stiffness: 150, damping: 20, delay: 0.2 }}
                                            >
                                                <motion.div
                                                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                                                    initial={{ x: '-100%' }}
                                                    animate={{ x: '200%' }}
                                                    transition={{ duration: 1.5, repeat: Infinity, repeatDelay: 3, ease: "easeInOut" }}
                                                />
                                                <div className="relative z-10 flex items-center gap-1">
                                                    <Image src="/partners/save-the-children-logo.png" alt="Save the Children" width={24} height={24} className="drop-shadow-sm brightness-0 invert" />
                                                    <div className="flex flex-col leading-none">
                                                        <span className="text-white text-[7px] font-bold tracking-wide drop-shadow-sm">Save the</span>
                                                        <span className="text-white text-[7px] font-bold tracking-wide drop-shadow-sm">Children</span>
                                                    </div>
                                                </div>
                                            </motion.div>
                                            <div className="absolute top-[42px] right-0 w-0 h-0 border-l-[6px] border-l-[#B71C1C] border-b-[6px] border-b-transparent" />
                                            <div className="absolute top-0 right-[42px] w-0 h-0 border-t-[6px] border-t-transparent border-r-[6px] border-r-[#B71C1C]" />
                                        </motion.div>
                                    )}

                                    {/* Partner Overlay */}
                                    <div className="absolute bottom-3 left-3 flex items-center gap-2 rounded-full bg-white/90 px-3 py-1 text-xs font-medium text-gray-900 backdrop-blur shadow-sm">
                                        {partner?.logoUrl && (
                                            <img src={partner.logoUrl} alt="" className="h-4 w-4 rounded-full" />
                                        )}
                                        {partner?.name ?? 'Partner'}
                                    </div>
                                </div>

                                <CardContent className="flex flex-1 flex-col p-5">
                                    <div className="mb-2">
                                        <h3 className="text-lg font-bold text-gray-900 line-clamp-1">{summary.program.name}</h3>
                                    </div>

                                    <p className="mb-4 text-sm text-gray-500 line-clamp-3 flex-1">
                                        {summary.program.description}
                                    </p>

                                    <div className="mt-auto pt-4 border-t border-gray-100 flex items-center justify-between">
                                        <Badge variant="secondary" className="font-normal bg-purple-50 text-purple-700 hover:bg-purple-100">
                                            Active Participant
                                        </Badge>

                                        <Button asChild size="sm" variant="outline" className="gap-1">
                                            <Link href={`/teacher/discover/programs/${summary.program.id}`}>
                                                View Details <ArrowRight className="h-3.5 w-3.5" />
                                            </Link>
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        )
                    })}
                </div>
            )}
        </div>
    )
}
