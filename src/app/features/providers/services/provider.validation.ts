import { z } from 'zod';

export const CreateProviderSchema = z.object({
  name: z.string().min(1, 'El nombre es requerido'),
  email: z.string().email('Email inválido'),
  phone: z.string().optional(),
  address: z.string().optional(),
});

export const UpdateProviderSchema = z.object({
  name: z.string().min(1, 'El nombre es requerido').optional(),
  phone: z.string().optional(),
  isActive: z.boolean().optional(),
});

export type CreateProviderFormData = z.infer<typeof CreateProviderSchema>;
export type UpdateProviderFormData = z.infer<typeof UpdateProviderSchema>;
