import type { ReactNode } from 'react'

import { ParentShell } from '@/components/parent/parent-shell'

export default function ParentProfileLayout({ children }: { children: ReactNode }) {
  return <ParentShell>{children}</ParentShell>
}
