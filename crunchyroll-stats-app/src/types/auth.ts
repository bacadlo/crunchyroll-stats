export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  error?: string;
}

export interface Profile {
  profileName: string;
  avatar: string;
}
