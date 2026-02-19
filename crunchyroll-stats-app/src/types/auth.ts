export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  error?: string;
}

export interface AccountOwner {
  accountId: string;
  email: string;
  createdAt: string;
  premium: boolean;
}

export interface Profile {
  profileId: string;
  username: string;
  profileName: string;
  avatar: string;
  maturityRating: string;
  isPrimary: boolean;
}
