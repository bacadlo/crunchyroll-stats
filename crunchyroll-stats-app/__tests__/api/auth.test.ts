import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';

vi.mock('@/lib/csrf', () => ({
  generateCsrfToken: vi.fn(),
  validateCsrfToken: vi.fn(),
}));

vi.mock('@/lib/crunchyroll/rust-api-client', () => ({
  validateCredentials: vi.fn(),
  InvalidCredentialsError: class InvalidCredentialsError extends Error {
    constructor() {
      super('Invalid email or password');
      this.name = 'InvalidCredentialsError';
    }
  },
}));

import { POST, DELETE } from '@/app/api/auth/route';
import { validateCsrfToken } from '@/lib/csrf';
import { validateCredentials, InvalidCredentialsError } from '@/lib/crunchyroll/rust-api-client';

const mockValidateCsrf = vi.mocked(validateCsrfToken);
const mockValidateCredentials = vi.mocked(validateCredentials);

function makePostRequest(body: unknown, csrfToken?: string): NextRequest {
  return new NextRequest('http://localhost/api/auth', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(csrfToken ? { 'X-CSRF-Token': csrfToken } : {}),
    },
    body: JSON.stringify(body),
  });
}

function makeDeleteRequest(csrfToken?: string): NextRequest {
  return new NextRequest('http://localhost/api/auth', {
    method: 'DELETE',
    headers: {
      ...(csrfToken ? { 'X-CSRF-Token': csrfToken } : {}),
    },
  });
}

beforeEach(() => {
  vi.clearAllMocks();
  // Default: credentials are valid
  mockValidateCredentials.mockResolvedValue(undefined);
});

// ---------------------------------------------------------------------------
// POST /api/auth — CSRF validation
// ---------------------------------------------------------------------------

describe('POST /api/auth — CSRF validation', () => {
  it('returns 403 when X-CSRF-Token header is absent', async () => {
    mockValidateCsrf.mockReturnValue(false);
    const response = await POST(makePostRequest({ email: 'a@b.com', password: 'pass' }));
    const body = await response.json() as { success: boolean; error: string };

    expect(response.status).toBe(403);
    expect(body.success).toBe(false);
    expect(body.error).toMatch(/csrf/i);
  });

  it('returns 403 when CSRF token is invalid', async () => {
    mockValidateCsrf.mockReturnValue(false);
    const response = await POST(makePostRequest({ email: 'a@b.com', password: 'pass' }, 'bad-token'));
    const body = await response.json() as { success: boolean; error: string };

    expect(response.status).toBe(403);
    expect(body.success).toBe(false);
  });

  it('does not call validateCredentials when CSRF fails', async () => {
    mockValidateCsrf.mockReturnValue(false);
    await POST(makePostRequest({ email: 'a@b.com', password: 'pass' }, 'bad-token'));

    expect(mockValidateCredentials).not.toHaveBeenCalled();
  });
});

// ---------------------------------------------------------------------------
// POST /api/auth — input validation
// ---------------------------------------------------------------------------

describe('POST /api/auth — input validation', () => {
  beforeEach(() => {
    mockValidateCsrf.mockReturnValue(true);
  });

  it('returns 400 when email is missing', async () => {
    const response = await POST(makePostRequest({ password: 'pass' }, 'valid-token'));
    const body = await response.json() as { success: boolean; error: string };

    expect(response.status).toBe(400);
    expect(body.success).toBe(false);
    expect(body.error).toBeTruthy();
  });

  it('returns 400 when password is missing', async () => {
    const response = await POST(makePostRequest({ email: 'a@b.com' }, 'valid-token'));
    const body = await response.json() as { success: boolean; error: string };

    expect(response.status).toBe(400);
    expect(body.success).toBe(false);
  });

  it('returns 400 when email format is invalid', async () => {
    const response = await POST(makePostRequest({ email: 'not-an-email', password: 'pass' }, 'valid-token'));
    const body = await response.json() as { success: boolean; error: string };

    expect(response.status).toBe(400);
    expect(body.success).toBe(false);
    expect(body.error).toMatch(/email/i);
  });

  it('returns 400 when body is an empty object', async () => {
    const response = await POST(makePostRequest({}, 'valid-token'));

    expect(response.status).toBe(400);
  });

  it('does not call validateCredentials when input is invalid', async () => {
    await POST(makePostRequest({ email: 'not-an-email', password: 'pass' }, 'valid-token'));

    expect(mockValidateCredentials).not.toHaveBeenCalled();
  });
});

// ---------------------------------------------------------------------------
// POST /api/auth — credential validation
// ---------------------------------------------------------------------------

describe('POST /api/auth — credential validation', () => {
  beforeEach(() => {
    mockValidateCsrf.mockReturnValue(true);
  });

  it('returns 401 when credentials are invalid', async () => {
    mockValidateCredentials.mockRejectedValue(new InvalidCredentialsError());

    const response = await POST(
      makePostRequest({ email: 'user@example.com', password: 'wrongpass' }, 'valid-token')
    );
    const body = await response.json() as { success: boolean; error: string };

    expect(response.status).toBe(401);
    expect(body.success).toBe(false);
    expect(body.error).toMatch(/invalid email or password/i);
  });

  it('does not set cr_session cookie when credentials are invalid', async () => {
    mockValidateCredentials.mockRejectedValue(new InvalidCredentialsError());

    const response = await POST(
      makePostRequest({ email: 'user@example.com', password: 'wrongpass' }, 'valid-token')
    );

    expect(response.cookies.get('cr_session')).toBeUndefined();
  });

  it('returns 503 when the authentication service is unavailable', async () => {
    mockValidateCredentials.mockRejectedValue(new Error('Authentication service unavailable'));

    const response = await POST(
      makePostRequest({ email: 'user@example.com', password: 'secret' }, 'valid-token')
    );
    const body = await response.json() as { success: boolean; error: string };

    expect(response.status).toBe(503);
    expect(body.success).toBe(false);
  });

  it('calls validateCredentials with the parsed email and password', async () => {
    const response = await POST(
      makePostRequest({ email: 'user@example.com', password: 'secret' }, 'valid-token')
    );

    expect(response.status).toBe(200);
    expect(mockValidateCredentials).toHaveBeenCalledWith('user@example.com', 'secret');
  });
});

// ---------------------------------------------------------------------------
// POST /api/auth — successful login
// ---------------------------------------------------------------------------

describe('POST /api/auth — successful login', () => {
  beforeEach(() => {
    mockValidateCsrf.mockReturnValue(true);
  });

  it('returns 200 and sets cr_session cookie', async () => {
    const response = await POST(
      makePostRequest({ email: 'user@example.com', password: 'secret' }, 'valid-token')
    );
    const body = await response.json() as { success: boolean; email: string };

    expect(response.status).toBe(200);
    expect(body.success).toBe(true);
    expect(body.email).toBe('user@example.com');

    const cookie = response.cookies.get('cr_session');
    expect(cookie).toBeDefined();
    expect(cookie?.httpOnly).toBe(true);

    const session = JSON.parse(cookie!.value) as {
      email: string;
      password: string;
      authenticated: boolean;
      expires_at: number;
    };
    expect(session.email).toBe('user@example.com');
    expect(session.authenticated).toBe(true);
    expect(session.expires_at).toBeGreaterThan(Date.now());
  });

  it('sets 1-hour maxAge when rememberMe is false', async () => {
    const before = Date.now();
    const response = await POST(
      makePostRequest({ email: 'user@example.com', password: 'secret', rememberMe: false }, 'valid-token')
    );

    const cookie = response.cookies.get('cr_session');
    const session = JSON.parse(cookie!.value) as { expires_at: number };
    const expectedMax = before + 60 * 60 * 1000;

    // expires_at should be ~1 hour from now (within a 5-second window)
    expect(session.expires_at).toBeGreaterThanOrEqual(expectedMax - 5000);
    expect(session.expires_at).toBeLessThanOrEqual(expectedMax + 5000);
  });

  it('sets 30-day maxAge when rememberMe is true', async () => {
    const before = Date.now();
    const response = await POST(
      makePostRequest({ email: 'user@example.com', password: 'secret', rememberMe: true }, 'valid-token')
    );

    const cookie = response.cookies.get('cr_session');
    const session = JSON.parse(cookie!.value) as { expires_at: number };
    const expectedMax = before + 60 * 60 * 24 * 30 * 1000;

    expect(session.expires_at).toBeGreaterThanOrEqual(expectedMax - 5000);
    expect(session.expires_at).toBeLessThanOrEqual(expectedMax + 5000);
  });

  it('defaults rememberMe to false when omitted', async () => {
    const before = Date.now();
    const response = await POST(
      makePostRequest({ email: 'user@example.com', password: 'secret' }, 'valid-token')
    );

    const cookie = response.cookies.get('cr_session');
    const session = JSON.parse(cookie!.value) as { expires_at: number };
    const oneHour = 60 * 60 * 1000;
    const thirtyDays = 60 * 60 * 24 * 30 * 1000;

    expect(session.expires_at).toBeLessThan(before + thirtyDays);
    expect(session.expires_at).toBeGreaterThan(before + oneHour - 5000);
  });
});

// ---------------------------------------------------------------------------
// POST /api/auth — malformed request
// ---------------------------------------------------------------------------

describe('POST /api/auth — malformed request', () => {
  beforeEach(() => {
    mockValidateCsrf.mockReturnValue(true);
  });

  it('returns 503 when body is not valid JSON', async () => {
    const request = new NextRequest('http://localhost/api/auth', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRF-Token': 'valid-token',
      },
      body: 'not json{{{',
    });
    const response = await POST(request);

    expect(response.status).toBe(503);
  });
});

// ---------------------------------------------------------------------------
// DELETE /api/auth
// ---------------------------------------------------------------------------

describe('DELETE /api/auth — CSRF validation', () => {
  it('returns 403 when CSRF token is absent', async () => {
    mockValidateCsrf.mockReturnValue(false);
    const response = await DELETE(makeDeleteRequest());
    const body = await response.json() as { success: boolean };

    expect(response.status).toBe(403);
    expect(body.success).toBe(false);
  });

  it('returns 403 when CSRF token is invalid', async () => {
    mockValidateCsrf.mockReturnValue(false);
    const response = await DELETE(makeDeleteRequest('bad-token'));

    expect(response.status).toBe(403);
  });
});

describe('DELETE /api/auth — successful logout', () => {
  it('returns 200 and clears cr_session cookie', async () => {
    mockValidateCsrf.mockReturnValue(true);
    const response = await DELETE(makeDeleteRequest('valid-token'));
    const body = await response.json() as { success: boolean; message: string };

    expect(response.status).toBe(200);
    expect(body.success).toBe(true);

    const cookie = response.cookies.get('cr_session');
    expect(cookie).toBeDefined();
    expect(cookie?.value).toBe('');
    expect(cookie?.maxAge).toBe(0);
  });
});
