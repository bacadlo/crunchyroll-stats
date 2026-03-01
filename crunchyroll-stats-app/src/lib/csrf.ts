import { randomUUID } from 'crypto';

const csrfTokens = new Map<string, number>();

const CSRF_TTL_MS = 60 * 60 * 1000; // 1 hour

export function generateCsrfToken(): string {
  const token = randomUUID();
  csrfTokens.set(token, Date.now() + CSRF_TTL_MS);
  return token;
}

export function validateCsrfToken(token: string | null): boolean {
  if (!token) return false;
  const expiresAt = csrfTokens.get(token);
  if (!expiresAt) return false;
  if (Date.now() > expiresAt) {
    csrfTokens.delete(token);
    return false;
  }
  csrfTokens.delete(token); // single-use
  return true;
}

// Periodic cleanup of expired tokens
setInterval(() => {
  const now = Date.now();
  for (const [token, expiresAt] of csrfTokens) {
    if (now > expiresAt) csrfTokens.delete(token);
  }
}, 5 * 60 * 1000);
