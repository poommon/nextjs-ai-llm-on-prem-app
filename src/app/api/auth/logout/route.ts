import { NextResponse } from 'next/server';
import { clearServerToken } from '@/lib/auth/server';

export async function POST() {
  try {
    // Clear token from HTTP-only cookie
    await clearServerToken();
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Logout error:', error);
    return NextResponse.json(
      { error: 'Logout failed' },
      { status: 500 }
    );
  }
}
