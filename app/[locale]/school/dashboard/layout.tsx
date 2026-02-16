import type { ReactNode } from 'react'

import { SchoolShell } from '@/components/school/school-shell'

export default function SchoolDashboardLayout({ children }: { children: ReactNode }) {
  return <SchoolShell>{children}</SchoolShell>
}
