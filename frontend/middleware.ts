// middleware.ts (root of your project)
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl

    // Routes that require authentication
    const protectedRoutes = ['/profile', '/dashboard']

    // Routes that require admin role
    const adminRoutes = ['/dashboard']

    // Check if current path is protected
    const isProtectedRoute = protectedRoutes.some(route =>
        pathname.startsWith(route)
    )

    const isAdminRoute = adminRoutes.some(route =>
        pathname.startsWith(route)
    )

    // If route is protected, verify authentication
    if (isProtectedRoute) {
        try {
            // Call your backend to check authentication
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'
            const cookieHeader = request.headers.get('cookie') || ''

            const checkResponse = await fetch(`${apiUrl}/api/auth/check`, {
                method: 'GET',
                credentials: 'include',
            })

            // If response is not OK (401, 403, etc.), redirect to login
            if (!checkResponse.ok) {
                const loginUrl = new URL('/login', request.url)
                loginUrl.searchParams.set('redirect', pathname)
                return NextResponse.redirect(loginUrl)
            }

            const authData = await checkResponse.json()

            // IMPORTANT: Check if authenticated flag is true
            if (!authData.authenticated || !authData.user) {
                const loginUrl = new URL('/login', request.url)
                loginUrl.searchParams.set('redirect', pathname)
                return NextResponse.redirect(loginUrl)
            }

            // Check admin role for admin routes
            if (isAdminRoute && authData.user?.roles.includes('admin') === false) {
                return NextResponse.redirect(new URL('/unauthorized', request.url))
            }

        } catch (error) {
            console.error('❌ Auth check failed:', error)
            // On error, redirect to login
            const loginUrl = new URL('/login', request.url)
            loginUrl.searchParams.set('redirect', pathname)
            return NextResponse.redirect(loginUrl)
        }
    }

    return NextResponse.next()
}

export const config = {
    matcher: ["/dashboard/:path*", "/profile/:path*"],
}
