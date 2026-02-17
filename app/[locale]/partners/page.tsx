'use client'

import { useTranslations } from 'next-intl'
import { Button } from '@/components/ui/button'
import {
  ArrowRight,
  ArrowUpRight,
  Globe2,
  Users,
  Target,
  Sparkles,
  Building2,
  GraduationCap,
  Landmark,
  Building,
  School,
  ChevronDown
} from 'lucide-react'
import { Link } from '@/i18n/navigation'
import Image from 'next/image'
import { useEffect, useRef, useState } from 'react'
import { LanguageSwitcher } from '@/components/language-switcher'

const partnerTypes = [
  {
    typeKey: "ngos" as const,
    descKey: "ngosDesc" as const,
    icon: Building2,
  },
  {
    typeKey: "government" as const,
    descKey: "governmentDesc" as const,
    icon: Landmark,
  },
  {
    typeKey: "schoolNetworks" as const,
    descKey: "schoolNetworksDesc" as const,
    icon: School,
  },
  {
    typeKey: "corporate" as const,
    descKey: "corporateDesc" as const,
    icon: Building,
  },
  {
    typeKey: "schoolsType" as const,
    descKey: "schoolsTypeDesc" as const,
    icon: GraduationCap,
  }
]

const stats = [
  { value: "134", labelKey: "countries" as const, suffix: "+" },
  { value: "4,542", labelKey: "globalTeachers" as const, suffix: "" },
  { value: "47,500", labelKey: "studentsImpacted" as const, suffix: "+" },
]

function AnimatedCounter({ value, suffix }: { value: string, suffix: string }) {
  const [isVisible, setIsVisible] = useState(false)
  const ref = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
        }
      },
      { threshold: 0.1 }
    )
    if (ref.current) observer.observe(ref.current)
    return () => observer.disconnect()
  }, [])

  return (
    <span ref={ref} className={`transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
      {value}{suffix}
    </span>
  )
}

export default function PartnersPage() {
  const t = useTranslations('landing')
  const tn = useTranslations('nav')
  const [scrollY, setScrollY] = useState(0)

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY)
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <div className="min-h-screen bg-[#E0CCFF] relative overflow-hidden">
      {/* Subtle Grain Overlay */}
      <div
        className="fixed inset-0 pointer-events-none z-50 opacity-[0.015]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
        }}
      />

      {/* Announcement Bar */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-white text-[#1a1a2e] text-center py-2 text-sm font-bold">
        {t('announcement')}
      </div>

      {/* Header */}
      <header className="fixed top-8 left-0 right-0 z-40 transition-all duration-300" style={{
        backgroundColor: scrollY > 50 ? 'rgba(224, 204, 255, 0.95)' : 'transparent',
        backdropFilter: scrollY > 50 ? 'blur(12px)' : 'none',
      }}>
        <div className="max-w-[1400px] mx-auto px-4 md:px-8 lg:px-12 py-4 flex justify-between items-center">
          <Link href="/" className="flex-shrink-0 flex items-center gap-3 group">
            <Image
              src="/isotipo.png"
              alt="Class2Class"
              width={40}
              height={40}
              className="w-10 h-10 group-hover:scale-110 transition-transform duration-300"
            />
          </Link>

          <nav className="hidden lg:flex items-center gap-5 xl:gap-8">
            <Link href="#" className="text-gray-700 hover:text-[#8157D9] text-sm xl:text-base font-semibold transition-colors whitespace-nowrap">{tn('howItWorks')}</Link>
            <Link href="#" className="text-gray-700 hover:text-[#8157D9] text-sm xl:text-base font-semibold transition-colors whitespace-nowrap">{tn('platform')}</Link>
            <Link href="/discover" className="text-gray-700 hover:text-[#8157D9] text-sm xl:text-base font-semibold transition-colors whitespace-nowrap">{tn('exploreProjects')}</Link>
            <Link href="#" className="text-gray-700 hover:text-[#8157D9] text-sm xl:text-base font-semibold transition-colors whitespace-nowrap">{tn('aboutUs')}</Link>
            <button className="flex items-center gap-1 text-gray-700 hover:text-[#8157D9] text-sm xl:text-base font-semibold transition-colors whitespace-nowrap">
              {tn('resources')}
              <ChevronDown className="w-4 h-4" />
            </button>
          </nav>

          <div className="flex items-center gap-2">
            <LanguageSwitcher />
            <Link href="/partner/login">
              <Button variant="ghost" className="text-gray-600 hover:text-[#8157D9] text-sm xl:text-base font-medium px-3 py-4">
                {t('demo')}
              </Button>
            </Link>
            <Link href="/login">
              <Button variant="outline" className="border-[#8157D9] text-[#8157D9] hover:bg-white text-sm xl:text-base font-medium rounded-full bg-white px-4 xl:px-6 py-4">
                {t('logIn')}
              </Button>
            </Link>
            <Link href="/partner/onboarding">
              <Button className="bg-[#8157D9] hover:bg-[#7048C6] text-white text-sm xl:text-base font-medium px-4 xl:px-6 py-4 rounded-full">
                {t('signUp')}
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-40 pb-20 md:pt-52 md:pb-32">
        {/* World Map Background */}
        <div className="absolute inset-0 z-0 flex items-center justify-center overflow-hidden">
          <div className="relative w-[140%] max-w-[1800px] h-[80%] -translate-y-8">
            <Image
              src="/images/world-map.webp"
              alt="World Map Background"
              fill
              className="object-contain opacity-30 brightness-150"
              priority
            />
          </div>
        </div>


        <div className="relative z-10 max-w-[1200px] mx-auto px-6 md:px-16 lg:px-24">
          <div className="grid md:grid-cols-12 gap-8 items-center">
            {/* Left Content */}
            <div className="md:col-span-6 space-y-6">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/60 backdrop-blur-sm rounded-full border border-[#8B5CF6]/20">
                <span className="w-2 h-2 bg-[#8B5CF6] rounded-full animate-pulse" />
                <span className="text-[#7C3AED] text-sm font-medium">{t('forOrganizations')}</span>
              </div>

              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-[#1a1a2e] leading-[1.15] tracking-tight">
                {t.rich('heroTitle', {
                  highlight: (chunks) => (
                    <span className="relative inline-block">
                      <span className="relative z-10 text-[#8B5CF6]">{chunks}</span>
                      <span className="absolute bottom-1 left-0 right-0 h-2 bg-[#8B5CF6]/20 -z-10 -rotate-1 rounded" />
                    </span>
                  )
                })}
              </h1>

              <p className="text-lg text-gray-600 leading-relaxed max-w-md">
                {t('heroSubtitle')}
              </p>

              <div className="flex flex-col sm:flex-row gap-4 pt-2">
                <Link href="/partner/onboarding">
                  <Button size="lg" className="bg-[#8157D9] hover:bg-[#7048C6] text-white px-7 py-5 text-base font-semibold rounded-full shadow-lg shadow-[#8157D9]/25 hover:shadow-xl hover:shadow-[#8157D9]/30 transition-all hover:-translate-y-0.5 group">
                    {t('becomePartner')}
                    <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
                <Link href="/discover">
                  <Button size="lg" variant="outline" className="border-[#8157D9] text-[#8157D9] hover:bg-white hover:text-[#7048C6] px-7 py-5 text-base font-medium rounded-full bg-white">
                    {t('exploreProjects')}
                  </Button>
                </Link>
              </div>
            </div>

            {/* Right Visual */}
            <div className="md:col-span-6 relative">
              <div className="relative aspect-square max-w-md mx-auto">
                {/* Connection Lines SVG — connecting the floating stat cards */}
                <svg className="absolute inset-0 w-full h-full" viewBox="0 0 400 400">
                  <defs>
                    <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#8B5CF6" stopOpacity="0.4" />
                      <stop offset="100%" stopColor="#A78BFA" stopOpacity="0.2" />
                    </linearGradient>
                  </defs>
                  {/* Countries → Teachers */}
                  <path d="M130,40 Q230,60 290,110" stroke="url(#lineGradient)" strokeWidth="2" fill="none" strokeDasharray="8,4" className="animate-pulse" style={{ animationDuration: '3s' }} />
                  {/* Countries → Students */}
                  <path d="M85,55 Q70,130 95,200" stroke="url(#lineGradient)" strokeWidth="2" fill="none" strokeDasharray="8,4" className="animate-pulse" style={{ animationDuration: '4s' }} />
                  {/* Teachers → Connections */}
                  <path d="M330,155 Q340,240 315,300" stroke="url(#lineGradient)" strokeWidth="2" fill="none" strokeDasharray="8,4" className="animate-pulse" style={{ animationDuration: '3.5s' }} />
                  {/* Students → Connections */}
                  <path d="M155,235 Q230,270 275,315" stroke="url(#lineGradient)" strokeWidth="2" fill="none" strokeDasharray="8,4" className="animate-pulse" style={{ animationDuration: '3.2s' }} />
                </svg>

                {/* Floating Cards */}
                <div className="absolute top-4 left-0 bg-white rounded-2xl shadow-xl shadow-[#8B5CF6]/10 p-4 w-40 transform -rotate-6 hover:rotate-0 transition-transform duration-500 border border-[#8B5CF6]/10">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-[#F4EBFF] rounded-xl flex items-center justify-center">
                      <Globe2 className="w-5 h-5 text-[#8B5CF6]" />
                    </div>
                    <div>
                      <div className="text-xs text-gray-500">{t('countries')}</div>
                      <div className="font-bold text-[#1a1a2e]">{t('countriesValue')}</div>
                    </div>
                  </div>
                </div>

                <div className="absolute top-1/4 right-0 bg-white rounded-2xl shadow-xl shadow-[#8B5CF6]/10 p-4 w-44 transform rotate-3 hover:rotate-0 transition-transform duration-500 border border-[#8B5CF6]/10">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-[#F4EBFF] rounded-xl flex items-center justify-center">
                      <GraduationCap className="w-5 h-5 text-[#8B5CF6]" />
                    </div>
                    <div>
                      <div className="text-xs text-gray-500">{t('globalTeachers')}</div>
                      <div className="font-bold text-[#1a1a2e]">{t('globalTeachersValue')}</div>
                    </div>
                  </div>
                </div>

                <div className="absolute top-1/2 left-4 bg-white rounded-2xl shadow-xl shadow-[#8B5CF6]/10 p-4 w-44 transform -rotate-2 hover:rotate-0 transition-transform duration-500 border border-[#8B5CF6]/10">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-[#F4EBFF] rounded-xl flex items-center justify-center">
                      <Users className="w-5 h-5 text-[#8B5CF6]" />
                    </div>
                    <div>
                      <div className="text-xs text-gray-500">{t('studentsImpacted')}</div>
                      <div className="font-bold text-[#1a1a2e]">{t('studentsImpactedValue')}</div>
                    </div>
                  </div>
                </div>

                <div className="absolute bottom-12 right-8 bg-white rounded-2xl shadow-xl shadow-[#8B5CF6]/10 p-4 w-44 transform rotate-2 hover:rotate-0 transition-transform duration-500 border border-[#8B5CF6]/10">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-[#F4EBFF] rounded-xl flex items-center justify-center">
                      <Target className="w-5 h-5 text-[#8B5CF6]" />
                    </div>
                    <div>
                      <div className="text-xs text-gray-500">{t('connections')}</div>
                      <div className="font-bold text-[#1a1a2e]">{t('connectionsValue')}</div>
                    </div>
                  </div>
                </div>

                {/* Central Glow */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-gradient-to-br from-[#8B5CF6] to-[#A78BFA] rounded-full opacity-15 blur-2xl" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SDG & Child Rights Section */}
      <section className="relative py-14 bg-[#F4EBFF]">
        <div className="relative z-10 max-w-[1100px] mx-auto px-6 md:px-12">
          {/* Header */}
          <div className="text-center mb-10">
            <h2 className="text-2xl md:text-3xl font-bold text-[#1a1a2e] mb-3">
              {t('sdgTitle')}
            </h2>
            <p className="text-gray-600 text-sm max-w-xl mx-auto">
              {t('sdgSubtitle')}
            </p>
          </div>

          {/* Cards Grid */}
          <div className="grid md:grid-cols-2 gap-6">
            {/* Child Rights Card - Article 12 */}
            <div className="group relative bg-white rounded-2xl p-6 border border-[#8157D9]/10 shadow-sm hover:shadow-lg hover:border-[#8157D9]/20 transition-all duration-500 hover:-translate-y-1">
              <div className="flex items-start gap-5">
                <div className="flex-shrink-0">
                  <div className="w-24 rounded-xl overflow-hidden group-hover:scale-105 transition-transform duration-500">
                    <Image
                      src="/crc/icons/article-12.png"
                      alt="Child Rights Article 12"
                      width={96}
                      height={120}
                      className="w-full h-auto"
                    />
                  </div>
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="px-2 py-0.5 bg-[#00A3E0]/10 text-[#00A3E0] text-xs font-bold rounded-full">
                      {t('childRights')}
                    </span>
                    <span className="text-gray-400 text-xs">{t('article12')}</span>
                  </div>
                  <h3 className="text-lg font-bold text-[#1a1a2e] mb-1">
                    {t('rightToBeHeard')}
                  </h3>
                  <p className="text-gray-600 text-sm leading-relaxed mb-3">
                    {t('rightToBeHeardDesc')}
                  </p>
                  <div className="flex items-center gap-1.5 text-[#8157D9] text-xs font-medium">
                    <span>{t('uncrc')}</span>
                    <ArrowUpRight className="w-3 h-3" />
                  </div>
                </div>
              </div>
            </div>

            {/* SDG 17 Card */}
            <div className="group relative bg-white rounded-2xl p-6 border border-[#8157D9]/10 shadow-sm hover:shadow-lg hover:border-[#8157D9]/20 transition-all duration-500 hover:-translate-y-1">
              <div className="flex items-start gap-5">
                <div className="flex-shrink-0">
                  <div className="w-28 h-28 rounded-xl overflow-hidden group-hover:scale-105 transition-transform duration-500">
                    <Image
                      src="/sdg/sdg-17.webp"
                      alt="SDG Goal 17"
                      width={112}
                      height={112}
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="px-2 py-0.5 bg-[#19486A]/10 text-[#19486A] text-xs font-bold rounded-full">
                      {t('sdgGoal')}
                    </span>
                    <span className="text-gray-400 text-xs">{t('globalPartnership')}</span>
                  </div>
                  <h3 className="text-lg font-bold text-[#1a1a2e] mb-1">
                    {t('partnershipsForGoals')}
                  </h3>
                  <p className="text-gray-600 text-sm leading-relaxed mb-3">
                    {t('partnershipsForGoalsDesc')}
                  </p>
                  <div className="flex items-center gap-1.5 text-[#8157D9] text-xs font-medium">
                    <span>{t('unsdg')}</span>
                    <ArrowUpRight className="w-3 h-3" />
                  </div>
                </div>
              </div>
              {/* SDG Colors Bar */}
              <div className="absolute bottom-0 left-0 right-0 h-1 rounded-b-2xl overflow-hidden flex">
                <div className="flex-1 bg-[#E5243B]" />
                <div className="flex-1 bg-[#DDA63A]" />
                <div className="flex-1 bg-[#4C9F38]" />
                <div className="flex-1 bg-[#C5192D]" />
                <div className="flex-1 bg-[#FF3A21]" />
                <div className="flex-1 bg-[#26BDE2]" />
                <div className="flex-1 bg-[#FCC30B]" />
                <div className="flex-1 bg-[#A21942]" />
                <div className="flex-1 bg-[#FD6925]" />
                <div className="flex-1 bg-[#DD1367]" />
                <div className="flex-1 bg-[#FD9D24]" />
                <div className="flex-1 bg-[#BF8B2E]" />
                <div className="flex-1 bg-[#3F7E44]" />
                <div className="flex-1 bg-[#0A97D9]" />
                <div className="flex-1 bg-[#56C02B]" />
                <div className="flex-1 bg-[#00689D]" />
                <div className="flex-1 bg-[#19486A]" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Value Props Section */}
      <section className="py-24 md:py-32 bg-white relative">
        <div className="max-w-[1400px] mx-auto px-6 md:px-12">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            {/* Left - Visual Grid */}
            <div className="relative">
              <div className="aspect-[4/3] bg-gradient-to-br from-[#F4EBFF] to-[#EDE9FE] rounded-3xl overflow-hidden relative">
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="grid grid-cols-2 gap-4 p-8">
                    <div className="aspect-square bg-white rounded-2xl shadow-lg p-6 flex flex-col justify-between transform hover:-translate-y-2 transition-transform duration-300 border border-[#8B5CF6]/10">
                      <Globe2 className="w-8 h-8 text-[#8B5CF6]" />
                      <div>
                        <div className="font-semibold text-[#1a1a2e]">{t('globalReach')}</div>
                        <div className="text-sm text-gray-500">{t('countriesValue')} {t('countries').toLowerCase()}</div>
                      </div>
                    </div>
                    <div className="aspect-square bg-[#8B5CF6] rounded-2xl shadow-lg p-6 flex flex-col justify-between transform hover:-translate-y-2 transition-transform duration-300 mt-8">
                      <Sparkles className="w-8 h-8 text-white" />
                      <div>
                        <div className="font-semibold text-white">{t('impact')}</div>
                        <div className="text-sm text-white/80">{t('measurableOutcomes')}</div>
                      </div>
                    </div>
                    <div className="aspect-square bg-[#F4EBFF] rounded-2xl shadow-lg p-6 flex flex-col justify-between transform hover:-translate-y-2 transition-transform duration-300 -mt-4 border border-[#8B5CF6]/20">
                      <Target className="w-8 h-8 text-[#8B5CF6]" />
                      <div>
                        <div className="font-semibold text-[#1a1a2e]">{t('sdgAligned')}</div>
                        <div className="text-sm text-gray-600">{t('unGoalsFocused')}</div>
                      </div>
                    </div>
                    <div className="aspect-square bg-white rounded-2xl shadow-lg p-6 flex flex-col justify-between transform hover:-translate-y-2 transition-transform duration-300 mt-4 border border-[#8B5CF6]/10">
                      <Users className="w-8 h-8 text-[#8B5CF6]" />
                      <div>
                        <div className="font-semibold text-[#1a1a2e]">{t('community')}</div>
                        <div className="text-sm text-gray-500">{t('activeNetwork')}</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              {/* Decorative element */}
              <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-[#8B5CF6]/10 rounded-full blur-2xl" />
            </div>

            {/* Right - Content */}
            <div className="space-y-8">
              <div>
                <span className="text-[#8B5CF6] font-semibold text-sm tracking-wide uppercase">{t('whyPartner')}</span>
                <h2 className="text-4xl md:text-5xl font-bold text-[#1a1a2e] mt-4 leading-tight">
                  {t('amplifyImpact')}
                </h2>
              </div>

              <div className="space-y-6">
                <div className="flex gap-4">
                  <div className="w-12 h-12 bg-[#F4EBFF] rounded-xl flex items-center justify-center flex-shrink-0">
                    <span className="text-[#8B5CF6] font-bold">01</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-[#1a1a2e] text-lg mb-1">{t('extendReach')}</h3>
                    <p className="text-gray-600">{t('extendReachDesc')}</p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="w-12 h-12 bg-[#F4EBFF] rounded-xl flex items-center justify-center flex-shrink-0">
                    <span className="text-[#8B5CF6] font-bold">02</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-[#1a1a2e] text-lg mb-1">{t('trackImpact')}</h3>
                    <p className="text-gray-600">{t('trackImpactDesc')}</p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="w-12 h-12 bg-[#F4EBFF] rounded-xl flex items-center justify-center flex-shrink-0">
                    <span className="text-[#8B5CF6] font-bold">03</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-[#1a1a2e] text-lg mb-1">{t('seamlessCollab')}</h3>
                    <p className="text-gray-600">{t('seamlessCollabDesc')}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Partner Types Section */}
      <section className="py-24 md:py-32 bg-[#FAFAFA] relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-[0.02]">
          <div className="absolute inset-0" style={{
            backgroundImage: `radial-gradient(circle at 2px 2px, #8B5CF6 1px, transparent 0)`,
            backgroundSize: '32px 32px'
          }} />
        </div>

        <div className="relative z-10 max-w-[1400px] mx-auto px-6 md:px-12">
          <div className="text-center mb-16">
            <span className="text-[#8B5CF6] font-semibold text-sm tracking-wide uppercase">{t('ourEcosystem')}</span>
            <h2 className="text-4xl md:text-5xl font-bold text-[#1a1a2e] mt-4 mb-6">
              {t('whoPartners')}
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              {t('whoPartnersDesc')}
            </p>
          </div>

          {/* Partner Type Cards - Staggered Layout */}
          <div className="grid md:grid-cols-5 gap-6">
            {partnerTypes.map((partner, index) => {
              const Icon = partner.icon
              return (
                <div
                  key={index}
                  className={`group relative bg-white rounded-3xl p-8 shadow-sm hover:shadow-xl transition-all duration-500 hover:-translate-y-2 border border-[#8B5CF6]/10 ${index % 2 === 1 ? 'md:mt-8' : ''}`}
                >
                  <div className="w-14 h-14 bg-[#F4EBFF] rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-[#8B5CF6] transition-all duration-300">
                    <Icon className="w-7 h-7 text-[#8B5CF6] group-hover:text-white transition-colors duration-300" />
                  </div>
                  <h3 className="text-xl font-bold text-[#1a1a2e] mb-3">{t(partner.typeKey)}</h3>
                  <p className="text-gray-600 text-sm leading-relaxed">{t(partner.descKey)}</p>

                  {/* Hover indicator */}
                  <div className="absolute bottom-6 right-6 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <ArrowUpRight className="w-5 h-5 text-[#8B5CF6]" />
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-32 overflow-hidden bg-[#E0CCFF]">
        {/* World Map Background */}
        <div className="absolute inset-0 z-0 flex items-center justify-center overflow-hidden">
          <div className="relative w-[140%] max-w-[1800px] h-[90%]">
            <Image
              src="/images/world-map.webp"
              alt="World Map Background"
              fill
              className="object-contain opacity-30 brightness-150"
            />
          </div>
        </div>

        {/* Abstract Shapes */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden">
          <div className="absolute top-1/4 -left-20 w-96 h-96 bg-[#8B5CF6]/10 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 -right-20 w-80 h-80 bg-white/20 rounded-full blur-3xl" />
        </div>

        <div className="relative z-10 max-w-4xl mx-auto text-center px-6">
          <h2 className="text-4xl md:text-6xl font-bold text-[#1a1a2e] mb-8 leading-tight">
            {t('ctaTitle')}
          </h2>
          <p className="text-xl text-gray-700 mb-12 max-w-2xl mx-auto leading-relaxed">
            {t('ctaSubtitle')}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/partner/onboarding">
              <Button size="lg" className="bg-[#8157D9] text-white hover:bg-[#7048C6] px-10 py-6 text-lg font-semibold rounded-full shadow-xl shadow-[#8157D9]/25 transition-all hover:-translate-y-1 group">
                {t('startPartnership')}
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
            <Link href="#" className="text-[#1a1a2e] hover:text-[#8157D9] flex items-center justify-center gap-2 font-medium py-4 px-6 transition-colors">
              {t('scheduleCall')}
              <ArrowUpRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white text-gray-600 py-12 border-t border-gray-100">
        <div className="max-w-[1400px] mx-auto px-6 md:px-12">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-3">
              <Image
                src="/isotipo.png"
                alt="Class2Class"
                width={32}
                height={32}
                className="w-8 h-8"
              />
              <span className="text-[#1a1a2e] font-medium">Class2Class</span>
            </div>

            <div className="flex items-center gap-8 text-sm">
              <Link href="#" className="hover:text-[#8B5CF6] transition-colors">{tn('privacy')}</Link>
              <Link href="#" className="hover:text-[#8B5CF6] transition-colors">{tn('terms')}</Link>
              <Link href="#" className="hover:text-[#8B5CF6] transition-colors">{tn('contact')}</Link>
            </div>

            <div className="text-sm text-gray-500">
              {t('copyright')}
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
