import { auth } from "@/lib/auth"
import { NextResponse } from "next/server"

export default auth((req) => {
  const { pathname } = req.nextUrl
  
  // Jika user belum login dan mencoba mengakses profile, redirect ke login
  if (!req.auth && pathname.startsWith("/profile")) {
    const url = new URL("/", req.url)
    return NextResponse.redirect(url)
  }
  
  // Jika user sudah login dan mencoba mengakses login atau register, redirect ke profile
  if (req.auth && (pathname === "/" || pathname === "/register")) {
    const url = new URL("/profile", req.url)
    return NextResponse.redirect(url)
  }

  return NextResponse.next()
})

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
}