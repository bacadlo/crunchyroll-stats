import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

const loginSchema = z.object({
  email: z.string().min(1, 'Email is required').email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    console.log('Login attempt for:', body.email);
    
    const result = loginSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error.issues[0]?.message ?? 'Invalid request' },
        { status: 400 }
      );
    }

    const { email, password } = result.data;

    console.log('✅ Credentials validated, storing session...');

    const response = NextResponse.json({
      success: true,
      message: 'Authentication successful',
    });

    // Store credentials in session for Rust API calls
    response.cookies.set('cr_session', JSON.stringify({
      email,
      password,
      authenticated: true,
      expires_at: Date.now() + 3600000, // 1 hour
    }), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 3600,
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('Authentication error:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Authentication failed',
      },
      { status: 401 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  const response = NextResponse.json({
    success: true,
    message: 'Logged out successfully',
  });

  response.cookies.delete('cr_session');
  return response;
}