export interface LoginCredentials {
    email: string;
    password: string;
  }
  
  export interface AuthResponse {
    success: boolean;
    message: string;
    error?: string;
  }
  
  export interface CrunchyrollAuthToken {
    access_token: string;
    refresh_token: string;
    expires_in: number;
    token_type: string;
    scope: string;
    country: string;
    account_id: string;
  }