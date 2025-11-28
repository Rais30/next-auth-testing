import { NextResponse } from 'next/server'
import { validateRecaptcha } from '@/lib/recaptcha-service'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const token = body?.token
    const action = body?.action || 'login'
  const minScore = undefined

    if (!token) {
      return NextResponse.json({ success: false, message: 'reCAPTCHA token is missing' }, { status: 400 })
    }

    const result = await validateRecaptcha(token, action)

    if (result.isValid) {
      return NextResponse.json({ success: true, message: 'reCAPTCHA verified', score: result.score ?? null })
    }

    return NextResponse.json(
      { success: false, message: result.error || 'reCAPTCHA verification failed', score: result.score ?? null },
      { status: 400 }
    )
  } catch (error) {
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 })
  }
}
