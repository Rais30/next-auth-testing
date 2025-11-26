'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export function useAuth() {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === 'loading') return
    
    // Redirect logic based on current path
    const currentPath = window.location.pathname
    
    if (!session && currentPath.startsWith('/profile')) {
      router.push('/')
    }
    
    if (session && currentPath === '/') {
      router.push('/profile')
    }
  }, [session, status, router])

  return {
    session,
    status,
    isAuthenticated: status === 'authenticated',
    isLoading: status === 'loading',
    user: session?.user
  }
}