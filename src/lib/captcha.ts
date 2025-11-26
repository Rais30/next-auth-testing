import { useState, useEffect } from 'react'

export function generateCaptcha(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  let captcha = ''
  
  // Gunakan crypto.getRandomValues jika tersedia untuk keamanan yang lebih baik
  if (typeof window !== 'undefined' && window.crypto && window.crypto.getRandomValues) {
    const randomBytes = new Uint8Array(6)
    window.crypto.getRandomValues(randomBytes)
    for (let i = 0; i < 6; i++) {
      captcha += chars.charAt(randomBytes[i] % chars.length)
    }
  } else {
    // Fallback untuk environment yang tidak support crypto
    for (let i = 0; i < 6; i++) {
      captcha += chars.charAt(Math.floor(Math.random() * chars.length))
    }
  }
  
  return captcha
}

export function useCaptcha() {
  const [captcha, setCaptcha] = useState('')
  const [captchaInput, setCaptchaInput] = useState('')
  const [isVerified, setIsVerified] = useState(false)

  const refreshCaptcha = () => {
    setCaptcha(generateCaptcha())
    setCaptchaInput('')
    setIsVerified(false)
  }

  const verifyCaptcha = () => {
    const isValid = captchaInput.toUpperCase() === captcha.toUpperCase()
    setIsVerified(isValid)
    return isValid
  }

  useEffect(() => {
    refreshCaptcha()
  }, [])

  return {
    captcha,
    captchaInput,
    setCaptchaInput,
    isVerified,
    refreshCaptcha,
    verifyCaptcha
  }
}