import NextAuth, { User } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { db } from '@/lib/db'
import bcrypt from 'bcryptjs'
import { validateRecaptcha, isRecaptchaEnabled } from '@/lib/recaptcha-service'

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
        captcha: { label: "Captcha", type: "text" }
      },
      async authorize(credentials, request): Promise<User | null> {
        try {
          if (!credentials?.captcha) {
            throw new Error('Captcha wajib diisi')
          }

          if (isRecaptchaEnabled()) {
            const minScore = parseFloat(process.env.RECAPTCHA_MIN_SCORE || '0.5')
            const recaptchaValidation = await validateRecaptcha(credentials.captcha as string, 'login', minScore)
            if (!recaptchaValidation.isValid) {
              const skipDev = process.env.NODE_ENV !== 'production' && !!process.env.RECAPTCHA_SKIP_ACTION_CHECK
              if (!skipDev) {
                throw new Error(recaptchaValidation.error || 'Captcha tidak valid')
              }
            }
          }

          // Cari user berdasarkan email
          const user = await db.user.findUnique({
            where: { email: credentials?.email as string | undefined }
          })
          
          if (!user) {
            throw new Error('Email tidak ditemukan')
          }
          
          // Verifikasi password dengan bcrypt
          if (!credentials?.password) {
            throw new Error('Password wajib diisi')
          }
          
          const isPasswordValid = await bcrypt.compare(credentials.password as string, user.password as string)
          if (!isPasswordValid) {
            throw new Error('Password salah')
          }
          
          // Return user data tanpa password
          const { password, ...userWithoutPassword } = user
          return userWithoutPassword as any
        } catch (error) {
          console.error('Auth error:', error)
          return null
        }
      }
    })
  ],
  pages: {
    signIn: "/",
    error: "/"
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.email = user.email
        token.username = user.username
        token.name = user.name
        token.avatar = user.avatar
        token.bio = user.bio
        token.location = user.location
        token.website = user.website
        token.joinedAt = user.joinedAt
        token.followers = user.followers
        token.following = user.following
        token.posts = user.posts
        token.isActive = (user as any).isActive
        token.emailVerified = (user as any).emailVerified
      }
      return token
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string
        session.user.email = token.email as string
        session.user.username = token.username as string
        session.user.name = token.name as string
        session.user.avatar = token.avatar as string
        session.user.bio = token.bio as string
        session.user.location = token.location as string
        session.user.website = token.website as string
        session.user.joinedAt = token.joinedAt as string
        session.user.followers = token.followers as number
        session.user.following = token.following as number
        session.user.posts = token.posts as number
        (session.user as any).isActive = token.isActive as boolean
        session.user.emailVerified = token.emailVerified as boolean
      }
      return session
    }
  },
  session: {
    strategy: "jwt"
  }
})
