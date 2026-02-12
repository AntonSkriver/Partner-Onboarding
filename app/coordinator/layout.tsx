import type { ReactNode } from 'react'
import { CoordinatorShell } from '@/components/coordinator/coordinator-shell'

export default function CoordinatorLayout({ children }: { children: ReactNode }) {
  return <CoordinatorShell>{children}</CoordinatorShell>
}
