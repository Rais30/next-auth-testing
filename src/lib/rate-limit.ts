import { NextRequest, NextResponse } from 'next/server'

interface RateLimitEntry {
  count: number
  resetTime: number
}

const rateLimitMap = new Map<string, RateLimitEntry>()

const RATE_LIMIT_WINDOW = 15 * 60 * 1000 // 15 menit
const MAX_REQUESTS = 5 // maksimal 5 request per window

export function rateLimit(request: NextRequest): NextResponse | null {
  const ip = request.ip || request.headers.get('x-forwarded-for') || 'unknown'
  const key = `rate_limit_${ip}`
  
  const now = Date.now()
  const entry = rateLimitMap.get(key)
  
  if (!entry) {
    // Buat entry baru
    rateLimitMap.set(key, {
      count: 1,
      resetTime: now + RATE_LIMIT_WINDOW
    })
    return null
  }
  
  // Reset counter jika window telah berlalu
  if (now > entry.resetTime) {
    rateLimitMap.set(key, {
      count: 1,
      resetTime: now + RATE_LIMIT_WINDOW
    })
    return null
  }
  
  // Cek apakah limit terlampaui
  if (entry.count >= MAX_REQUESTS) {
    return NextResponse.json(
      { 
        message: 'Terlalu banyak percobaan. Silakan coba lagi dalam 15 menit.' 
      },
      { 
        status: 429,
        headers: {
          'Retry-After': Math.ceil((entry.resetTime - now) / 1000).toString()
        }
      }
    )
  }
  
  // Increment counter
  entry.count++
  rateLimitMap.set(key, entry)
  
  return null
}

// Bersihkan expired entries secara berkala
setInterval(() => {
  const now = Date.now()
  for (const [key, entry] of rateLimitMap.entries()) {
    if (now > entry.resetTime) {
      rateLimitMap.delete(key)
    }
  }
}, RATE_LIMIT_WINDOW)