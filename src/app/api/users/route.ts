import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { validateRecaptcha } from '@/lib/recaptcha-service'
import { registerSchema } from '@/lib/validations/auth'
import bcrypt from 'bcryptjs'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validasi input dengan Zod
    const validatedData = registerSchema.parse(body)

    // Validasi reCAPTCHA v3
    const token = (body as any)?.captcha as string | undefined
    if (!token) {
      return NextResponse.json({ message: 'reCAPTCHA token tidak tersedia' }, { status: 400 })
    }
    const recaptcha = await validateRecaptcha(token, 'register', parseFloat(process.env.RECAPTCHA_MIN_SCORE || '0.5'))
    if (!recaptcha.isValid) {
      const skipDev = process.env.NODE_ENV !== 'production' && !!process.env.RECAPTCHA_SKIP_ACTION_CHECK
      if (!skipDev) {
        return NextResponse.json({ message: recaptcha.error || 'Captcha tidak valid' }, { status: 400 })
      }
    }
    
    // Cek apakah email sudah terdaftar
    const existingUserByEmail = await db.user.findUnique({
      where: { email: validatedData.email }
    })
    if (existingUserByEmail) {
      return NextResponse.json(
        { message: 'Email sudah terdaftar' },
        { status: 400 }
      )
    }
    
    // Cek apakah username sudah terdaftar
    const existingUserByUsername = await db.user.findUnique({
      where: { username: validatedData.username }
    })
    if (existingUserByUsername) {
      return NextResponse.json(
        { message: 'Username sudah digunakan' },
        { status: 400 }
      )
    }
    
    // Hash password
    const hashedPassword = await bcrypt.hash(validatedData.password, 12)
    
    // Buat user baru
    const newUser = await db.user.create({
      data: {
        email: validatedData.email,
        username: validatedData.username,
        password: hashedPassword,
        name: validatedData.name,
        bio: validatedData.bio || '',
        location: validatedData.location || '',
        website: validatedData.website || '',
        avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(validatedData.name)}&background=random`,
      }
    })
    
    // Remove password dari response
    const { password, ...userWithoutPassword } = newUser
    
    return NextResponse.json({
      message: 'Registrasi berhasil',
      user: userWithoutPassword
    })
    
  } catch (error) {
    console.error('Registration error:', error)
    
    if (error instanceof Error && error.name === 'ZodError') {
      // Handle Zod validation errors
      return NextResponse.json(
        { 
          message: 'Validasi gagal',
          errors: error.message 
        },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { message: 'Terjadi kesalahan server' },
      { status: 500 }
    )
  }
}

export async function GET() {
  try {
    const users = await db.user.findMany({
      select: {
        id: true,
        email: true,
        username: true,
        name: true,
        bio: true,
        location: true,
        website: true,
        avatar: true,
        joinedAt: true,
        followers: true,
        following: true,
        posts: true,
        isActive: true,
        emailVerified: true,
        createdAt: true,
        updatedAt: true
      }
    })
    
    return NextResponse.json({
      message: 'Users retrieved successfully',
      users: users
    })
  } catch (error) {
    console.error('Get users error:', error)
    return NextResponse.json(
      { message: 'Terjadi kesalahan server' },
      { status: 500 }
    )
  }
}
