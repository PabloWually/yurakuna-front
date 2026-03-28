import { z } from 'zod';

/**
 * Zod schemas for client validation
 * These match the API requirements from API_DOC.md
 */

// Create client schema
export const CreateClientSchema = z.object({
  userId: z.string().optional(),
  name: z.string().min(1, 'El nombre es requerido'),
  email: z.string().email('Email inválido'),
  phone: z.string().optional(),
  address: z.string().optional(),
});

// Update client schema (all fields optional)
export const UpdateClientSchema = z.object({
  name: z.string().min(1, 'El nombre es requerido').optional(),
  email: z.string().email('Email inválido').optional(),
  phone: z.string().optional(),
  address: z.string().optional(),
});

// Type inference
export type CreateClientFormData = z.infer<typeof CreateClientSchema>;
export type UpdateClientFormData = z.infer<typeof UpdateClientSchema>;
