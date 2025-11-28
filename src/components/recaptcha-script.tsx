'use client'

import Script from 'next/script'

interface RecaptchaScriptProps {
  siteKey?: string
}

export function RecaptchaScript({ siteKey }: RecaptchaScriptProps) {
  const siteKeyFinal = siteKey || process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY

  if (!siteKeyFinal) {
    console.warn('reCAPTCHA site key tidak tersedia')
    return null
  }

  return (
    <Script
      src={`https://www.google.com/recaptcha/api.js?render=${siteKeyFinal}`}
      strategy="afterInteractive"
      onLoad={() => {
        console.log('reCAPTCHA v2 loaded')
      }}
      onError={(e) => {
        console.error('Failed to load reCAPTCHA v2:', e)
      }}
    />
  )
}