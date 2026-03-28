import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';

vi.mock('@/lib/csrf', () => ({
  generateCsrfToken: vi.fn(() => 'mock-csrf-token-uuid'),
  validateCsrfToken: vi.fn(),
}));

import { GET } from '@/app/api/csrf/route';
import { generateCsrfToken } from '@/lib/csrf';

beforeEach(() => {
  vi.clearAllMocks();
});

describe('GET /api/csrf', () => {
  it('returns a csrfToken string', async () => {
    const request = new NextRequest('http://localhost/api/csrf');
    const response = await GET(request);
    const body = await response.json() as { csrfToken: string };

    expect(response.status).toBe(200);
    expect(body.csrfToken).toBe('mock-csrf-token-uuid');
    expect(generateCsrfToken).toHaveBeenCalledOnce();
  });
});
