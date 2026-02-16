import {
  BarChart3,
  BookOpen,
  Building2,
  Layers,
  Mail,
  Users,
  type LucideIcon,
} from 'lucide-react'

export type DashboardCardId =
  | 'overview'
  | 'programs'
  | 'resources'
  | 'analytics'
  | 'network'
  | 'contact'

export type ProfileDashboardCard = {
  id: DashboardCardId
  title: string
  description: string
  href: string
  ctaLabel: string
  icon: LucideIcon
}

type DashboardCardTemplate = {
  id: DashboardCardId
  title: string
  description: string
  path: string
  ctaLabel: string
  icon: LucideIcon
}

type DashboardCardOverride = Partial<Pick<ProfileDashboardCard, 'description' | 'ctaLabel'>>

type DashboardCardOverrides = Partial<Record<DashboardCardId, DashboardCardOverride>>

const DASHBOARD_CARD_TEMPLATES: DashboardCardTemplate[] = [
  {
    id: 'overview',
    title: 'Overview',
    description: 'View your organization profile and key information.',
    path: 'overview',
    ctaLabel: 'View',
    icon: Building2,
  },
  {
    id: 'programs',
    title: 'My Programs',
    description: 'Create and manage your global education programs.',
    path: 'programs',
    ctaLabel: 'Go to programs',
    icon: Layers,
  },
  {
    id: 'resources',
    title: 'Resources',
    description: 'Manage educational resources and teaching materials.',
    path: 'resources',
    ctaLabel: 'Explore',
    icon: BookOpen,
  },
  {
    id: 'analytics',
    title: 'Analytics',
    description: 'Track your program performance and global reach.',
    path: 'analytics',
    ctaLabel: 'View metrics',
    icon: BarChart3,
  },
  {
    id: 'network',
    title: 'Network',
    description: 'Manage coordinators and educational institutions.',
    path: 'network',
    ctaLabel: 'Manage',
    icon: Users,
  },
  {
    id: 'contact',
    title: 'Contact Information',
    description: 'View and update your contact details.',
    path: 'overview',
    ctaLabel: 'View',
    icon: Mail,
  },
]

export function buildProfileDashboardCards(
  basePath: '/parent/profile' | '/partner/profile',
  overrides: DashboardCardOverrides = {},
): ProfileDashboardCard[] {
  return DASHBOARD_CARD_TEMPLATES.map((template) => {
    const override = overrides[template.id]
    return {
      id: template.id,
      title: template.title,
      description: override?.description ?? template.description,
      href: `${basePath}/${template.path}`,
      ctaLabel: override?.ctaLabel ?? template.ctaLabel,
      icon: template.icon,
    }
  })
}
