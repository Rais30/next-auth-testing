import NextAuth from "next-auth"

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      name: string
      email: string
      username: string
      avatar: string
      bio: string
      location: string
      website: string
      joinedAt: string
      followers: number
      following: number
      posts: number
    }
  }

  interface User {
    id: string
    name: string
    email: string
    username: string
    avatar: string
    bio: string
    location: string
    website: string
    joinedAt: string
    followers: number
    following: number
    posts: number
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string
    username: string
    avatar: string
    bio: string
    location: string
    website: string
    joinedAt: string
    followers: number
    following: number
    posts: number
  }
}