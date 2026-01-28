/**
 * Server-side Authentication Functions
 * For use in Server Components and API Routes only
 */

import { cookies } from 'next/headers';
import { UserProfile } from './types';
import { apiGetProfile } from './api';

const TOKEN_COOKIE_NAME = 'auth_token';
const MAX_AGE = 7200; // 2 hours in seconds

/**
 * Get token from HTTP-only cookie (server-side)
 */
export async function getServerToken(): Promise<string | null> {
  const cookieStore = await cookies();
  return cookieStore.get(TOKEN_COOKIE_NAME)?.value || null;
}

/**
 * Set token in HTTP-only cookie (server-side)
 */
export async function setServerToken(token: string): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(TOKEN_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: MAX_AGE,
    path: '/',
  });
}

/**
 * Clear token from HTTP-only cookie (server-side)
 */
export async function clearServerToken(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(TOKEN_COOKIE_NAME);
}

/**
 * Get current user from server-side cookie
 */
export async function getServerUser(): Promise<UserProfile | null> {
  const token = await getServerToken();
  if (!token) return null;

  try {
    const user = await apiGetProfile(token);
    return user;
  } catch {
    await clearServerToken();
    return null;
  }
}

/**
 * Check if user is authenticated (server-side)
 */
export async function isServerAuthenticated(): Promise<boolean> {
  const token = await getServerToken();
  if (!token) return false;

  try {
    await apiGetProfile(token);
    return true;
  } catch {
    return false;
  }
}
