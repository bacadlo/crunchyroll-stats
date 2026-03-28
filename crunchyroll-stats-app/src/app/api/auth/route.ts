import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { validateCsrfToken } from '@/lib/csrf';
import { validateCredentials, InvalidCredentialsError } from '@/lib/crunchyroll/rust-api-client';

const loginSchema = z.object({
  email: z.string().min(1, 'Email is required').email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
  rememberMe: z.boolean().optional().default(false),
});

export async function POST(request: NextRequest) {
  try {
    const csrfToken = request.headers.get('X-CSRF-Token');
    if (!validateCsrfToken(csrfToken)) {
      return NextResponse.json(
        { success: false, error: 'Invalid or missing CSRF token' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const result = loginSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error.issues[0]?.message ?? 'Invalid request' },
        { status: 400 }
      );
    }

    const { email, password, rememberMe } = result.data;

    await validateCredentials(email, password);

    const maxAge = rememberMe ? 60 * 60 * 24 * 30 : 60 * 60;
    const expiresAt = Date.now() + maxAge * 1000;

    const response = NextResponse.json({
      success: true,
      message: 'Authentication successful',
      email,
    });

    // Store credentials in session for Rust API calls.
    response.cookies.set(
      'cr_session',
      JSON.stringify({
        email,
        password,
        authenticated: true,
        expires_at: expiresAt,
      }),
      {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge,
        path: '/',
      }
    );

    return response;
  } catch (error) {
    if (error instanceof InvalidCredentialsError) {
      return NextResponse.json(
        { success: false, error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    console.error('Authentication error:', error);

    return NextResponse.json(
      { success: false, error: 'Authentication service unavailable' },
      { status: 503 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  const csrfToken = request.headers.get('X-CSRF-Token');
  if (!validateCsrfToken(csrfToken)) {
    return NextResponse.json(
      { success: false, error: 'Invalid or missing CSRF token' },
      { status: 403 }
    );
  }

  const response = NextResponse.json({
    success: true,
    message: 'Logged out successfully',
  });

  response.cookies.set('cr_session', '', {
    httpOnly: true,
    secure: true,
    sameSite: 'lax',
    path: '/',
    maxAge: 0,
  });
  return response;
}