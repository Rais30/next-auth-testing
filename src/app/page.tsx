'use client'
import { useRef, useState } from 'react'
import { signIn } from 'next-auth/react'
import { useAuth } from '@/hooks/use-auth'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, User, Lock, Mail, ArrowRight, UserPlus, Shield } from 'lucide-react'
import { loginSchema, type LoginFormData } from '@/lib/validations/auth'
import ReCAPTCHA from 'react-google-recaptcha'

export default function Home() {
  const { session, status, isAuthenticated, isLoading: authLoading } = useAuth()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  
  const recaptchaRef = useRef<ReCAPTCHA>(null)
  const [captchaToken, setCaptchaToken] = useState<string | null>(null)
  
  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    mode: 'onChange'
  })

  const handleGoToRegister = () => {
    router.push('/register')
  }

  const onSubmit = async (data: LoginFormData) => {
    if (!captchaToken) {
      setError('Silakan selesaikan reCAPTCHA')
      return
    }

    setIsLoading(true)
    setError('')

    try {
      const recaptchaToken = captchaToken

      const signInResult = await signIn('credentials', {
        email: data.email,
        password: data.password,
        captcha: recaptchaToken,
        redirect: false
      })

      if (signInResult?.error) {
        const errMsg = signInResult.error
        if (errMsg.toLowerCase().includes('captcha')) {
          setError('Verifikasi keamanan gagal. Silakan coba lagi.')
        } else {
          setError(errMsg || 'Email atau password salah')
        }
      } else if (signInResult?.ok) {
        window.location.href = '/profile'
      }
    } catch (err: any) {
      if (err.message.includes('reCAPTCHA')) {
        setError('Verifikasi reCAPTCHA gagal. Silakan coba lagi.')
      } else {
        setError('Terjadi kesalahan. Silakan coba lagi.')
      }
    } finally {
      setIsLoading(false)
    }
  }

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-gray-600">
            {'Loading...'}
          </p>
        </div>
      </div>
    )
  }

  if (isAuthenticated && session) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto w-20 h-20 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full flex items-center justify-center mb-4">
              <User className="w-10 h-10 text-white" />
            </div>
            <CardTitle className="text-2xl font-bold text-gray-800">
              Selamat Datang, {session.user.name}!
            </CardTitle>
            <CardDescription>
              Login berhasil. Anda sekarang dapat mengakses profile.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button 
              onClick={() => window.location.href = '/profile'}
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 flex items-center justify-center space-x-2"
            >
              <span>Lihat Profile</span>
              <ArrowRight className="h-4 w-4" />
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="text-center space-y-4">
          <div className="mx-auto w-16 h-16 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full flex items-center justify-center">
            <User className="w-8 h-8 text-white" />
          </div>
          <div>
            <CardTitle className="text-xl font-bold text-gray-800">Masuk ke Akun</CardTitle>
            <CardDescription className="text-gray-600">
              Silakan masuk untuk melanjutkan
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                Email
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="email"
                  type="email"
                  placeholder="nama@example.com"
                  {...register('email')}
                  className={`pl-10 ${errors.email ? 'border-red-500' : ''}`}
                />
              </div>
              {errors.email && (
                <p className="text-sm text-red-600">{errors.email.message}</p>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium text-gray-700">
                Password
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  {...register('password')}
                  className={`pl-10 ${errors.password ? 'border-red-500' : ''}`}
                />
              </div>
              {errors.password && (
                <p className="text-sm text-red-600">{errors.password.message}</p>
              )}
            </div>

            {/* reCAPTCHA v2 checkbox */}
            <div className="mt-3 p-3 bg-gray-50 rounded-lg text-center">
              <div className="flex items-center justify-center space-x-2 text-sm text-gray-600 mb-2">
                <Shield className="h-4 w-4" />
                <span>Protected by reCAPTCHA</span>
              </div>
              <div className="flex justify-center">
                <ReCAPTCHA
                  ref={recaptchaRef}
                  sitekey={process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY as string}
                  onChange={(token) => setCaptchaToken(token)}
                />
              </div>
              <p className="text-xs text-gray-500 mt-2">
                <a href="https://policies.google.com/privacy" className="hover:underline">Privacy Policy</a> and 
                <a href="https://policies.google.com/terms" className="hover:underline">Terms of Service</a> apply.
              </p>
            </div>

            {error && (
              <Alert className="border-red-200 bg-red-50">
                <AlertDescription className="text-red-700">
                  {error}
                </AlertDescription>
              </Alert>
            )}

            <Button 
              type="submit" 
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-medium py-2"
              disabled={isLoading || !isValid || !captchaToken}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Masuk...
                </>
              ) : (
                'Masuk'
              )}
            </Button>
          </form>

          <div className="mt-4 text-center">
            <p className="text-sm text-gray-600">
              Belum punya akun?{' '}
              <button 
                onClick={handleGoToRegister}
                className="text-blue-600 hover:text-blue-700 font-medium flex items-center justify-center space-x-1 mx-auto"
              >
                <UserPlus className="h-4 w-4" />
                <span>Daftar sekarang</span>
              </button>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
