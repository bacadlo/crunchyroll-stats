import { cookies } from 'next/headers';

interface SessionData {
  email: string;
  password: string;
  authenticated: boolean;
  expires_at: number;
}

export async function validateSession(): Promise<SessionData> {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get('cr_session');

  if (!sessionCookie) {
    throw new SessionError('Not authenticated');
  }

  let session: SessionData;
  try {
    session = JSON.parse(sessionCookie.value);
  } catch {
    throw new SessionError('Invalid session');
  }

  if (!session.authenticated || !session.email || !session.password) {
    throw new SessionError('Invalid session');
  }

  if (Date.now() >= session.expires_at) {
    throw new SessionError('Session expired');
  }

  return session;
}

export class SessionError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'SessionError';
  }
}
