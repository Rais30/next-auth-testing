'use client'

import { useEffect, useState, useCallback } from 'react'

interface UseRecaptchaReturn {
  isLoaded: boolean
  isReady: boolean
  executeRecaptcha: (action: string) => Promise<string>
  resetRecaptcha: () => void
  error: string | null
}

export function useRecaptcha(siteKey?: string): UseRecaptchaReturn {
  const [isLoaded, setIsLoaded] = useState(false)
  const [isReady, setIsReady] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const siteKeyFinal = siteKey || process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY

  useEffect(() => {
    if (!siteKeyFinal) {
      setError('reCAPTCHA site key tidak tersedia')
      return
    }

    // Check if grecaptcha already exists
    if (typeof window !== 'undefined' && (window as any).grecaptcha) {
      setIsLoaded(true)
      try {
        (window as any).grecaptcha.ready(() => {
          setIsReady(true)
        })
      } catch {
        setIsReady(true)
      }
      return
    }

    // Load reCAPTCHA script
    const script = document.createElement('script')
    script.src = `https://www.google.com/recaptcha/api.js?render=${siteKeyFinal}`
    script.async = true
    script.defer = true

    script.onload = () => {
      setIsLoaded(true)
      const checkReady = () => {
        if ((window as any).grecaptcha) {
          try {
            (window as any).grecaptcha.ready(() => {
              setIsReady(true)
            })
          } catch {
            if ((window as any).grecaptcha.execute) {
              setIsReady(true)
            } else {
              setTimeout(checkReady, 100)
            }
          }
        } else {
          setTimeout(checkReady, 100)
        }
      }
      checkReady()
    }

    script.onerror = () => {
      setError('Gagal memuat reCAPTCHA')
      setIsLoaded(false)
    }

    document.head.appendChild(script)

    return () => {
      // Cleanup script
      if (document.head.contains(script)) {
        document.head.removeChild(script)
      }
    }
  }, [siteKeyFinal])

  const executeRecaptcha = useCallback(async (action: string): Promise<string> => {
    if (!siteKeyFinal) {
      throw new Error('reCAPTCHA belum siap')
    }

    const grecaptcha = (window as any).grecaptcha
    if (!grecaptcha) {
      throw new Error('reCAPTCHA belum siap')
    }

    try {
      // Ensure grecaptcha.ready before execute
      await new Promise<void>((resolve) => {
        try {
          grecaptcha.ready(() => resolve())
        } catch {
          resolve()
        }
      })

      const token = await grecaptcha.execute(siteKeyFinal, { action })
      console.log('reCAPTCHA token:', token)
      return token
    } catch (err) {
      console.error('reCAPTCHA execution error:', err)
      throw new Error('Gagal mengeksekusi reCAPTCHA')
    }
  }, [siteKeyFinal])

  const resetRecaptcha = useCallback(() => {
    if (isReady && (window as any).grecaptcha) {
      try {
        (window as any).grecaptcha.reset()
      } catch (err) {
        console.error('reCAPTCHA reset error:', err)
      }
    }
  }, [isReady])

  return {
    isLoaded,
    isReady,
    executeRecaptcha,
    resetRecaptcha,
    error
  }
}
