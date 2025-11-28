'use client'

import { useEffect, useState, useCallback, useRef } from 'react'

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
  const widgetIdRef = useRef<number | null>(null)
  const pendingResolverRef = useRef<((token: string) => void) | null>(null)

  const siteKeyFinal = siteKey || process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY

  useEffect(() => {
    if (!siteKeyFinal) {
      setError('reCAPTCHA site key tidak tersedia')
      return
    }

    const grecaptcha = (typeof window !== 'undefined' ? (window as any).grecaptcha : undefined)

    const ensureContainer = () => {
      let container = document.getElementById('recaptcha-invisible-container') as HTMLDivElement | null
      if (!container) {
        container = document.createElement('div')
        container.id = 'recaptcha-invisible-container'
        container.style.display = 'none'
        document.body.appendChild(container)
      }
      return container
    }

    const renderWidget = () => {
      const container = ensureContainer()
      try {
        widgetIdRef.current = (window as any).grecaptcha.render(container, {
          sitekey: siteKeyFinal,
          size: 'invisible',
          badge: 'bottomright',
          callback: (token: string) => {
            const resolver = pendingResolverRef.current
            if (resolver) {
              resolver(token)
              pendingResolverRef.current = null
            }
          }
        })
        setIsReady(true)
      } catch (e) {
        setTimeout(renderWidget, 100)
      }
    }

    if (grecaptcha) {
      setIsLoaded(true)
      try {
        grecaptcha.ready(() => renderWidget())
      } catch {
        renderWidget()
      }
      return
    }

    const script = document.createElement('script')
    script.src = `https://www.google.com/recaptcha/api.js?render=explicit`
    script.async = true
    script.defer = true

    script.onload = () => {
      setIsLoaded(true)
      const g = (window as any).grecaptcha
      const onReady = () => {
        renderWidget()
      }
      try {
        g.ready(onReady)
      } catch {
        onReady()
      }
    }

    script.onerror = () => {
      setError('Gagal memuat reCAPTCHA')
      setIsLoaded(false)
    }

    document.head.appendChild(script)

    return () => {
      if (document.head.contains(script)) {
        document.head.removeChild(script)
      }
      const container = document.getElementById('recaptcha-invisible-container')
      if (container && container.parentNode) {
        container.parentNode.removeChild(container)
      }
    }
  }, [siteKeyFinal])

  const executeRecaptcha = useCallback(async (_action: string): Promise<string> => {
    if (!siteKeyFinal) {
      throw new Error('reCAPTCHA belum siap')
    }

    const grecaptcha = (window as any).grecaptcha
    if (!grecaptcha) {
      throw new Error('reCAPTCHA belum siap')
    }

    try {
      await new Promise<void>((resolve) => {
        try {
          grecaptcha.ready(() => resolve())
        } catch {
          resolve()
        }
      })

      if (widgetIdRef.current == null) {
        throw new Error('reCAPTCHA belum siap')
      }

      const token = await new Promise<string>((resolve, reject) => {
        pendingResolverRef.current = resolve
        try {
          grecaptcha.execute(widgetIdRef.current as number)
        } catch (e) {
          pendingResolverRef.current = null
          reject(e)
        }
      })
      return token
    } catch (err) {
      console.error('reCAPTCHA execution error:', err)
      throw new Error('Gagal mengeksekusi reCAPTCHA')
    }
  }, [siteKeyFinal])

  const resetRecaptcha = useCallback(() => {
    if (isReady && (window as any).grecaptcha) {
      try {
        if (widgetIdRef.current != null) {
          (window as any).grecaptcha.reset(widgetIdRef.current as number)
        }
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
