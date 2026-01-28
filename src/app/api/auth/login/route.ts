import { NextRequest, NextResponse } from 'next/server';
import { apiLogin, apiGetProfile } from '@/lib/auth/api';
import { setServerToken } from '@/lib/auth/server';

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    // Login to CodingThailand API
    const loginResponse = await apiLogin(email, password);

    // Get user profile
    const user = await apiGetProfile(loginResponse.access_token);

    // Set token in HTTP-only cookie
    await setServerToken(loginResponse.access_token);

    // Return user data
    return NextResponse.json({
      user,
      token: loginResponse.access_token,
      expires_in: loginResponse.expires_in,
    });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Login failed' },
      { status: 401 }
    );
  }
}
