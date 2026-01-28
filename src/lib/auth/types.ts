/**
 * Authentication Types
 */

export interface LoginResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
}

export interface UserProfile {
  id: number;
  name: string;
  email: string;
  email_verified_at: string | null;
  dob: string | null;
  role: string;
  created_at: string;
  updated_at: string;
}

export interface ApiResponse<T> {
  message: string;
  status_code: number;
  data?: T;
}

export interface ProfileResponse {
  user: UserProfile;
}
