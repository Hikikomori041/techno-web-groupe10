import {AuthCheckResponse, User} from '@/lib/api/definitions'


const apiUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3000'


// Server-side function to get current user
export async function getCurrentUser(): Promise<User | null> {
    try {
        const response = await fetch(`${apiUrl}/api/auth/profile`, {
            method: 'GET',
            credentials: 'include',
        })

        if (!response.ok) return null

        return await response.json()
    } catch (error) {
        console.error('Get current user error:', error)
        return null
    }
}

// Check authentication status
export async function checkAuth(): Promise<AuthCheckResponse | null> {
    try {
        const response = await fetch(`${apiUrl}/api/auth/check`, {
            method: 'GET',
            credentials: 'include',
        })

        if (!response.ok) return null

        return await response.json()
    } catch (error) {
        console.error('Check auth error:', error)
        return null
    }
}

// Check if user has admin role
export async function isAdmin(): Promise<boolean> {
    const user = await getCurrentUser()
    return user?.roles.includes("admin") || false;
}

// Require authentication (throws redirect)
export async function requireAuth() {
    const user = await getCurrentUser()
    if (!user) {
        throw new Error('Unauthorized')
    }
    return user
}

// Require admin role (throws redirect)
export async function requireAdmin() {
    const user = await requireAuth()
    if (!user.roles.includes("admin")) {
        throw new Error('Forbidden')
    }
    return user
}