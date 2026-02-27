'use client'

import { useEffect } from 'react'
import { useRouter } from '@/i18n/navigation'

/** Redirect legacy /sign-in to the unified /login page. */
export default function SignInRedirect() {
  const router = useRouter()
  useEffect(() => {
    router.replace('/login')
  }, [router])
  return null
}
