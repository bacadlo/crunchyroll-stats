import axios from 'axios';
import { CrunchyrollAuthResponse } from './types';

// Try different client credentials
const AUTH_URL = 'https://www.crunchyroll.com/auth/v1/token';

// These are extracted from the Crunchyroll website
const CLIENT_ID = 'cr_web';
const CLIENT_SECRET = ''; // Empty for web client

interface AuthenticationParams {
  email: string;
  password: string;
}

export class CrunchyrollAuth {
  private accessToken: string | null = null;
  private refreshToken: string | null = null;
  private expiresAt: number = 0;

  async authenticate({ email, password }: AuthenticationParams): Promise<CrunchyrollAuthResponse> {
    try {
      const formData = new URLSearchParams();
      formData.append('username', email);
      formData.append('password', password);
      formData.append('grant_type', 'password');
      formData.append('scope', 'offline_access');

      console.log('Attempting authentication with Crunchyroll API...');

      // Try without Authorization header first (some endpoints don't need it)
      try {
        const response = await axios.post<CrunchyrollAuthResponse>(
          AUTH_URL,
          formData.toString(),
          {
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded',
              'User-Agent': 'Crunchyroll/3.46.1 Android/13 okhttp/4.12.0',
            },
          }
        );

        this.accessToken = response.data.access_token;
        this.refreshToken = response.data.refresh_token;
        this.expiresAt = Date.now() + response.data.expires_in * 1000;

        console.log('Authentication successful!');
        return response.data;
      } catch (firstError) {
        console.log('First attempt failed, trying with Basic auth...');
        
        // If that fails, try with Basic Authorization
        const response = await axios.post<CrunchyrollAuthResponse>(
          AUTH_URL,
          formData.toString(),
          {
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded',
              'Authorization': `Basic ${Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString('base64')}`,
              'User-Agent': 'Crunchyroll/3.46.1 Android/13 okhttp/4.12.0',
            },
          }
        );

        this.accessToken = response.data.access_token;
        this.refreshToken = response.data.refresh_token;
        this.expiresAt = Date.now() + response.data.expires_in * 1000;

        console.log('Authentication successful!');
        return response.data;
      }
    } catch (error) {
      console.error('Authentication error details:', error);

      if (axios.isAxiosError(error)) {
        const errorData = error.response?.data;
        const errorMessage = errorData?.error || errorData?.message || error.message;
        
        console.error('Full error response:', {
          status: error.response?.status,
          data: errorData,
          headers: error.response?.headers
        });

        // Provide more specific error messages
        if (errorMessage === 'invalid_grant') {
          throw new Error('Invalid email or password. Please check your Crunchyroll credentials.');
        } else if (errorMessage === 'invalid_client') {
          throw new Error('Crunchyroll API client authentication failed. The API may have changed.');
        } else {
          throw new Error(`Authentication failed: ${errorMessage}`);
        }
      }
      throw error;
    }
  }

  getAccessToken(): string | null {
    return this.accessToken;
  }

  isTokenExpired(): boolean {
    return Date.now() >= this.expiresAt - 60000;
  }

  async ensureValidToken(): Promise<string> {
    if (!this.accessToken || this.isTokenExpired()) {
      throw new Error('No valid authentication token available');
    }
    return this.accessToken;
  }
}

export const crunchyrollAuth = new CrunchyrollAuth();