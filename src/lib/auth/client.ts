'use client';

/**
 * Client-side Authentication Functions
 * For use in Client Components only
 */

import { UserProfile } from './types';

/**
 * Login from client-side (calls API route)
 */
export async function login(email: string, password: string): Promise<UserProfile> {
  const response = await fetch('/api/auth/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, password }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Login failed' }));
    throw new Error(error.error || 'Invalid credentials');
  }

  const data = await response.json();
  return data.user;
}

/**
 * Logout from client-side (calls API route)
 */
export async function logout(): Promise<void> {
  try {
    await fetch('/api/auth/logout', {
      method: 'POST',
    });
  } catch (error) {
    console.error('Logout API error:', error);
  }

  // Redirect to login
  if (typeof window !== 'undefined') {
    window.location.href = '/login';
  }
}
