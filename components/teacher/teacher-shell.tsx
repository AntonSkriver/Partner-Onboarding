'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname, useRouter } from 'next/navigation'
import {
  Compass,
  Home,
  Layers,
  LogOut,
  ArrowLeft,
  Users,
  FolderOpen,
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import {
  getCurrentSession,
  hasSessionBackup,
  restoreSessionFromBackup,
  clearSession,
  type UserSession,
} from '@/lib/auth/session'

interface TeacherShellProps {
  children: React.ReactNode
}

const navItems = [
  { href: '/teacher/dashboard', label: 'Dashboard', icon: Home },
  { href: '/teacher/discover', label: 'Discover', icon: Compass },
  { href: '/teacher/projects', label: 'My Projects', icon: Layers },
  { href: '/teacher/programs', label: 'My Programs', icon: FolderOpen },
]

export function TeacherShell({ children }: TeacherShellProps) {
  const router = useRouter()
  const pathname = usePathname()
  const [session, setSession] = useState<UserSession | null>(null)
  const [hasBackup, setHasBackup] = useState(false)

  useEffect(() => {
    setSession(getCurrentSession())
    setHasBackup(hasSessionBackup())
  }, [])

  const initials = useMemo(() => {
    if (!session?.name) return 'T'
    const segments = session.name.split(' ').filter(Boolean)
    if (segments.length === 0) return 'T'
    if (segments.length === 1) return segments[0].charAt(0).toUpperCase()
    return `${segments[0].charAt(0)}${segments[segments.length - 1].charAt(0)}`.toUpperCase()
  }, [session?.name])

  const handleReturnToPartner = () => {
    const restored = restoreSessionFromBackup()
    if (restored) {
      router.push(restored.role === 'partner' ? '/partner/profile?tab=programs' : '/partner/login')
    } else {
      router.push('/partner/login')
    }
  }

  const handleTeacherLogout = () => {
    clearSession()
    router.push('/partner/login')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="border-b border-gray-200 bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-2">
              <Image
                src="/isotipo.png"
                alt="Class2Class"
                width={32}
                height={32}
                className="h-8 w-8"
              />
              <span className="text-lg font-semibold text-gray-900">Class2Class Teacher</span>
            </Link>
            <Badge variant="secondary" className="bg-purple-100 text-purple-700">
              Teacher preview
            </Badge>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden text-right md:block">
              <p className="text-sm font-medium text-gray-900">{session?.name ?? 'Teacher'}</p>
              <p className="text-xs text-gray-500">{session?.organization ?? 'Global Classroom'}</p>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-purple-600 text-sm font-semibold text-white">
              {initials}
            </div>
            <div className="flex items-center gap-2">
              {hasBackup && (
                <Button variant="ghost" size="sm" onClick={handleReturnToPartner}>
                  <ArrowLeft className="mr-1 h-4 w-4" />
                  Back to partner
                </Button>
              )}
              <Button variant="ghost" size="sm" onClick={handleTeacherLogout}>
                <LogOut className="mr-1 h-4 w-4" />
                Sign out
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="mx-auto flex max-w-7xl gap-6 px-4 py-6 sm:px-6 lg:px-8">
        <aside className="hidden w-56 flex-shrink-0 md:block">
          <nav className="space-y-1 rounded-xl border border-gray-200 bg-white p-3 shadow-sm">
            {navItems.map((item) => {
              const Icon = item.icon
              const isActive =
                pathname === item.href || pathname.startsWith(`${item.href}/`)

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-purple-50 text-purple-700'
                      : 'text-gray-600 hover:bg-purple-50 hover:text-purple-700',
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </Link>
              )
            })}
            <div className="mt-4 rounded-lg bg-purple-50 p-3 text-xs text-purple-700">
              <p className="font-semibold">Need a student view?</p>
              <p className="mt-1 text-purple-600">
                Coming soon – preview the student journey from a classroom invite.
              </p>
            </div>
          </nav>
        </aside>

        <main className="flex-1">
          <div className="flex items-center justify-between rounded-lg border border-gray-200 bg-white px-4 py-3 shadow-sm md:hidden">
            <nav className="flex items-center gap-2 text-sm text-gray-600">
              <Users className="h-4 w-4 text-purple-500" />
              <span>{session?.organization ?? 'Global Classroom'}</span>
            </nav>
            {hasBackup && (
              <Button variant="ghost" size="sm" onClick={handleReturnToPartner}>
                <ArrowLeft className="mr-1 h-4 w-4" />
                Partner view
              </Button>
            )}
          </div>
          <div className="mt-6 space-y-6 md:mt-0">{children}</div>
        </main>
      </div>
    </div>
  )
}
