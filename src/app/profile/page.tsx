'use client'
import { signOut } from 'next-auth/react'
import { useAuth } from '@/hooks/use-auth'
import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { 
  User, 
  MapPin, 
  Calendar, 
  Globe, 
  Users, 
  LogOut,
  ArrowLeft,
  Save,
  X,
  Mail,
  Edit2
} from 'lucide-react'

export default function ProfilePage() {
  const { session, status, isAuthenticated, isLoading: authLoading } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [editData, setEditData] = useState({
    name: '',
    bio: '',
    location: '',
    website: ''
  })
  const [profileData, setProfileData] = useState(null)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    if (status === 'loading') return
    if (!isAuthenticated) return
    
    fetchProfile()
  }, [session, status, isAuthenticated])

  const fetchProfile = async () => {
    try {
      const response = await fetch('/api/profile')
      if (response.ok) {
        const data = await response.json()
        setProfileData(data.user)
        setEditData({
          name: data.user.name || '',
          bio: data.user.bio || '',
          location: data.user.location || '',
          website: data.user.website || ''
        })
      } else {
        setError('Gagal memuat data profile')
      }
    } catch (err) {
      console.error('Fetch profile error:', err)
      setError('Terjadi kesalahan')
    }
  }

  const handleEdit = () => {
    setIsEditing(true)
    setError('')
    setSuccess('')
  }

  const handleCancel = () => {
    setIsEditing(false)
    if (profileData) {
      setEditData({
        name: profileData.name || '',
        bio: profileData.bio || '',
        location: profileData.location || '',
        website: profileData.website || ''
      })
    }
  }

  const handleSave = async () => {
    setIsLoading(true)
    setError('')
    setSuccess('')

    try {
      const response = await fetch('/api/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(editData)
      })

      if (response.ok) {
        const data = await response.json()
        setProfileData(data.user)
        setIsEditing(false)
        setSuccess('Profile berhasil diperbarui!')
        setTimeout(() => setSuccess(''), 3000)
      } else {
        setError('Gagal memperbarui profile')
      }
    } catch (err) {
      console.error('Save profile error:', err)
      setError('Terjadi kesalahan')
    } finally {
      setIsLoading(false)
    }
  }

  const handleLogout = async () => {
    setIsLoading(true)
    try {
      await signOut({ redirect: false })
      window.location.href = '/'
    } catch (err) {
      console.error('Logout error:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleBackToHome = () => {
    window.location.href = '/'
  }

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="text-center space-y-4 pt-6">
            <User className="mx-auto h-12 w-12 text-gray-400" />
            <div>
              <h3 className="text-lg font-semibold">Belum Login</h3>
              <p className="text-gray-600">Silakan login terlebih dahulu untuk melihat profile</p>
            </div>
            <Button onClick={handleBackToHome} className="w-full">
              Kembali ke Login
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button 
              variant="ghost" 
              size="sm"
              onClick={handleBackToHome}
              className="flex items-center space-x-2"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Kembali</span>
            </Button>
            <h1 className="text-xl font-bold text-gray-800">Profile</h1>
          </div>
          <Button 
            variant="outline" 
            size="sm"
            onClick={handleLogout}
            className="flex items-center space-x-2"
            disabled={isLoading}
          >
            {isLoading ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600"></div>
            ) : (
              <LogOut className="h-4 w-4" />
            )}
            <span>Keluar</span>
          </Button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Profile Card */}
          <div>
            <Card className="overflow-hidden">
              <div className="h-32 bg-gradient-to-r from-blue-600 to-indigo-600"></div>
              <CardContent className="relative pt-16 pb-6">
                <div className="absolute -top-12 left-6">
                  <Avatar className="w-24 h-24 border-4 border-white shadow-lg">
                    <AvatarImage src={session.user.avatar} alt={session.user.name} />
                    <AvatarFallback className="text-2xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
                      {session.user.name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                </div>
                
                <div className="mt-8 text-center">
                  <h2 className="text-2xl font-bold text-gray-800">{session.user.name}</h2>
                  <p className="text-gray-600">@{session.user.username}</p>
                  <p className="text-gray-700 mt-3 text-sm">{session.user.bio || 'Tidak ada bio'}</p>
                </div>

                <div className="mt-6 space-y-3">
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <MapPin className="h-4 w-4" />
                    <span>{session.user.location || 'Tidak ada lokasi'}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <Globe className="h-4 w-4" />
                    <a href={session.user.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                      {session.user.website ? session.user.website.replace('https://', '') : 'Tidak ada website'}
                    </a>
                  </div>
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <Calendar className="h-4 w-4" />
                    <span>Bergabung {new Date(session.user.joinedAt).toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <Mail className="h-4 w-4" />
                    <span>{session.user.email}</span>
                  </div>
                </div>

                <Separator className="my-6" />

                <div className="flex justify-around text-center">
                  <div>
                    <div className="text-2xl font-bold text-gray-800">{session.user.posts}</div>
                    <div className="text-sm text-gray-600">Posts</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-gray-800">{session.user.followers.toLocaleString()}</div>
                    <div className="text-sm text-gray-600">Followers</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-gray-800">{session.user.following.toLocaleString()}</div>
                    <div className="text-sm text-gray-600">Following</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Edit Profile Form */}
          <div>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Edit Profile</CardTitle>
                {!isEditing && (
                  <Button onClick={handleEdit} size="sm" className="flex items-center space-x-2">
                    <Edit2 className="h-4 w-4" />
                    <span>Edit</span>
                  </Button>
                )}
              </CardHeader>
              <CardContent>
                {success && (
                  <Alert className="border-green-200 bg-green-50 mb-4">
                    <AlertDescription className="text-green-700">
                      {success}
                    </AlertDescription>
                  </Alert>
                )}
                
                {error && (
                  <Alert className="border-red-200 bg-red-50 mb-4">
                    <AlertDescription className="text-red-700">
                      {error}
                    </AlertDescription>
                  </Alert>
                )}

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="edit-name">Nama Lengkap</Label>
                    <Input
                      id="edit-name"
                      value={editData.name}
                      onChange={(e) => setEditData({...editData, name: e.target.value})}
                      disabled={!isEditing}
                      placeholder="Nama lengkap"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="edit-bio">Bio</Label>
                    <Textarea
                      id="edit-bio"
                      value={editData.bio}
                      onChange={(e) => setEditData({...editData, bio: e.target.value})}
                      disabled={!isEditing}
                      placeholder="Tentang Anda"
                      rows={3}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="edit-location">Lokasi</Label>
                    <Input
                      id="edit-location"
                      value={editData.location}
                      onChange={(e) => setEditData({...editData, location: e.target.value})}
                      disabled={!isEditing}
                      placeholder="Lokasi Anda"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="edit-website">Website</Label>
                    <Input
                      id="edit-website"
                      value={editData.website}
                      onChange={(e) => setEditData({...editData, website: e.target.value})}
                      disabled={!isEditing}
                      placeholder="https://website.com"
                    />
                  </div>

                  {isEditing && (
                    <div className="flex space-x-2">
                      <Button 
                        onClick={handleSave} 
                        className="flex-1 flex items-center space-x-2"
                        disabled={isLoading}
                      >
                        {isLoading ? (
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        ) : (
                          <Save className="h-4 w-4" />
                        )}
                        <span>Simpan</span>
                      </Button>
                      <Button 
                        onClick={handleCancel} 
                        variant="outline" 
                        className="flex items-center space-x-2"
                        disabled={isLoading}
                      >
                        <X className="h-4 w-4" />
                        <span>Batal</span>
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
