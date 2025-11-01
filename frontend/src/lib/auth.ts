// Helper functions for authentication

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

export interface User {
  _id: string;
  email: string;
  firstName: string;
  lastName: string;
  picture?: string;
  roles: string[];
}

export interface AuthCheckResponse {
  authenticated: boolean;
  user?: User;
}

/**
 * Check if user is authenticated by calling the backend
 * The backend will read the httpOnly cookie
 */
export async function checkAuth(): Promise<AuthCheckResponse> {
  try {
    const response = await fetch(`${API_URL}/auth/check`, {
      method: 'GET',
      credentials: 'include', // ✅ Important: include cookies
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      return { authenticated: false };
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Auth check failed:', error);
    return { authenticated: false };
  }
}

/**
 * Logout user by calling the backend
 * The backend will clear the cookies
 */
export async function logout(): Promise<void> {
  try {
    await fetch(`${API_URL}/auth/logout`, {
      method: 'POST',
      credentials: 'include', // ✅ Include cookies
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error('Logout failed:', error);
  }
  
  // ✅ PAS de localStorage - tout est géré par les cookies httpOnly
}

/**
 * Login with email and password
 */
export async function loginWithEmail(email: string, password: string) {
  const response = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    credentials: 'include', // ✅ Include cookies
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, password }),
  });

  if (!response.ok) {
    const data = await response.json();
    throw new Error(data.message || 'Login failed');
  }

  return response.json();
}

/**
 * ✅ SUPPRIMÉ - Ne jamais stocker de données utilisateur dans les cookies
 * 
 * Les données utilisateur doivent TOUJOURS être récupérées depuis le backend
 * en utilisant le JWT stocké dans le cookie httpOnly.
 * 
 * Utiliser checkAuth() à la place.
 */

