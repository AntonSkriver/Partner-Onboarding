'use client'

import { useEffect } from 'react'
import { useRouter } from '@/i18n/navigation'

/** Redirect legacy /partner/login to the unified /login page. */
export default function PartnerLoginRedirect() {
  const router = useRouter()
  useEffect(() => {
    router.replace('/login')
  }, [router])
  return null
}
