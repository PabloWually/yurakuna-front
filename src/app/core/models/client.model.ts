/**
 * Client-related interfaces
 */

// Client interface
export interface Client {
  id: string;
  userId?: string;
  name: string;
  email: string;
  phone?: string;
  address?: string;
  createdAt: string;
  updatedAt: string;
}

// Create client request
export interface CreateClientRequest {
  userId?: string;
  name: string;
  email: string;
  phone?: string;
  address?: string;
}

// Update client request
export interface UpdateClientRequest {
  name?: string;
  email?: string;
  phone?: string;
  address?: string;
}
