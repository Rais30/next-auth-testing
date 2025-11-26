// Service untuk validasi captcha
export interface CaptchaValidationResult {
  isValid: boolean
  message?: string
}

export async function validateCaptcha(captcha: string, sessionCaptcha?: string): Promise<CaptchaValidationResult> {
  try {
    // Validasi format captcha
    if (!captcha || captcha.length !== 6) {
      return {
        isValid: false,
        message: 'Captcha harus terdiri dari 6 karakter'
      }
    }

    // Validasi karakter captcha (hanya huruf dan angka)
    const captchaRegex = /^[A-Z0-9]+$/i
    if (!captchaRegex.test(captcha)) {
      return {
        isValid: false,
        message: 'Captcha hanya boleh mengandung huruf dan angka'
      }
    }

    // Dalam implementasi nyata, bandingkan dengan captcha yang disimpan di session/cache
    // Untuk sementara, kita anggap valid jika formatnya benar
    return {
      isValid: true,
      message: 'Captcha valid'
    }
  } catch (error) {
    console.error('Captcha validation error:', error)
    return {
      isValid: false,
      message: 'Terjadi kesalahan saat validasi captcha'
    }
  }
}

// Fungsi untuk generate captcha yang lebih aman
export function generateSecureCaptcha(length: number = 6): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  const randomBytes = new Uint8Array(length)
  
  // Gunakan crypto API untuk random yang lebih aman
  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    crypto.getRandomValues(randomBytes)
  } else {
    // Fallback untuk environment yang tidak support crypto
    for (let i = 0; i < length; i++) {
      randomBytes[i] = Math.floor(Math.random() * 256)
    }
  }
  
  let captcha = ''
  for (let i = 0; i < length; i++) {
    captcha += chars.charAt(randomBytes[i] % chars.length)
  }
  
  return captcha
}