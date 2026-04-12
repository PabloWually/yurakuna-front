/**
 * Provider-related interfaces
 */

export interface Provider {
  id: string;
  name: string;
  email: string;
  phone?: string;
  address?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateProviderRequest {
  name: string;
  email: string;
  phone?: string;
  address?: string;
}

export interface UpdateProviderRequest {
  name?: string;
  phone?: string;
  isActive?: boolean;
}
