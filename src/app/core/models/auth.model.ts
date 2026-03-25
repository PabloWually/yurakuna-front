import { UserRole } from './common.model';

/**
 * Auth-related interfaces
 */

// Login request
export interface LoginRequest {
  email: string;
  password: string;
}

// Register request
export interface RegisterRequest {
  email: string;
  password: string;
  name: string;
  role?: UserRole;
}

// Refresh token request
export interface RefreshTokenRequest {
  refreshToken: string;
}

// Auth response
export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: User;
}

// User interface
export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  createdAt: string;
  updatedAt: string;
}

// Create user request (admin only)
export interface CreateUserRequest {
  email: string;
  password: string;
  name: string;
  role: UserRole;
}
