'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname, useRouter } from 'next/navigation'
import {
  Home,
  Layers,
  BookOpen,
  BarChart3,
  Users,
  LogOut,
  Building2,
  Edit,
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import {
  getCurrentSession,
  clearSession,
  type UserSession,
} from '@/lib/auth/session'

interface PartnerShellProps {
  children: React.ReactNode
}

const navItems = [
  { href: '/partner/profile/dashboard', label: 'Home', icon: Home },
  { href: '/partner/profile/overview', label: 'Overview', icon: Building2 },
  { href: '/partner/profile/programs', label: 'Programs', icon: Layers },
  { href: '/partner/profile/resources', label: 'Resources', icon: BookOpen },
  { href: '/partner/profile/analytics', label: 'Analytics', icon: BarChart3 },
  { href: '/partner/profile/network', label: 'Network', icon: Users },
]

export function PartnerShell({ children }: PartnerShellProps) {
  const router = useRouter()
  const pathname = usePathname()
  const [session, setSession] = useState<UserSession | null>(null)

  useEffect(() => {
    setSession(getCurrentSession())
  }, [])

  const initials = useMemo(() => {
    if (!session?.organization) return 'P'
    const segments = session.organization.split(' ').filter(Boolean)
    if (segments.length === 0) return 'P'
    if (segments.length === 1) return segments[0].charAt(0).toUpperCase()
    return `${segments[0].charAt(0)}${segments[segments.length - 1].charAt(0)}`.toUpperCase()
  }, [session?.organization])

  const handleLogout = () => {
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
              <span className="text-lg font-semibold text-gray-900">Class2Class Partner</span>
            </Link>
            <Badge variant="secondary" className="bg-purple-100 text-purple-700">
              Partner Profile
            </Badge>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden text-right md:block">
              <p className="text-sm font-medium text-gray-900">{session?.organization ?? 'Partner'}</p>
              <p className="text-xs text-gray-500">{session?.name ?? 'Admin'}</p>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-purple-600 text-sm font-semibold text-white">
              {initials}
            </div>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" onClick={handleLogout}>
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
                pathname === item.href ||
                pathname.startsWith(`${item.href}/`) ||
                (item.label === 'Programs' && pathname.startsWith('/partner/programs'))

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
          </nav>
        </aside>

        <main className="flex-1">
          <div className="flex items-center justify-between rounded-lg border border-gray-200 bg-white px-4 py-3 shadow-sm md:hidden">
            <nav className="flex items-center gap-2 text-sm text-gray-600">
              <Building2 className="h-4 w-4 text-purple-500" />
              <span>{session?.organization ?? 'Partner'}</span>
            </nav>
          </div>
          <div className="mt-6 space-y-6 md:mt-0">{children}</div>
        </main>
      </div>
    </div>
  )
}
