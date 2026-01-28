/**
 * CodingThailand API Functions
 * Can be used in both client and server
 */

import { LoginResponse, UserProfile, ApiResponse, ProfileResponse } from './types';

const API_BASE_URL = 'https://api.codingthailand.com/api';

/**
 * Login with CodingThailand API
 */
export async function apiLogin(email: string, password: string): Promise<LoginResponse> {
  try {
    const response = await fetch(`${API_BASE_URL}/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();

    // Check for error response
    if (data.status_code && data.status_code !== 200) {
      throw new Error(data.message || 'Invalid credentials');
    }

    if (!response.ok) {
      throw new Error(data.message || 'Login failed');
    }

    return data as LoginResponse;
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('An unexpected error occurred');
  }
}

/**
 * Get user profile with access token
 */
export async function apiGetProfile(accessToken: string): Promise<UserProfile> {
  try {
    const response = await fetch(`${API_BASE_URL}/profile`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    });

    const data: ApiResponse<ProfileResponse> = await response.json();

    // Check for error response
    if (data.status_code !== 200) {
      throw new Error(data.message || 'Failed to fetch profile');
    }

    if (!data.data || !data.data.user) {
      throw new Error('Invalid profile response');
    }

    return data.data.user;
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('An unexpected error occurred');
  }
}
