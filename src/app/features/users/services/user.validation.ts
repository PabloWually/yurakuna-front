import { z } from 'zod';

/**
 * Create user validation schema
 */
export const CreateUserSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
  name: z.string().min(1, 'El nombre es requerido'),
  role: z.enum(['admin', 'client', 'user'], {
    errorMap: () => ({ message: 'Rol inválido' }),
  }),
});

/**
 * Update user validation schema (password is optional for updates)
 */
export const UpdateUserSchema = z.object({
  email: z.string().email('Email inválido').optional(),
  password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres').optional(),
  name: z.string().min(1, 'El nombre es requerido').optional(),
  role: z
    .enum(['admin', 'client', 'user'], {
      errorMap: () => ({ message: 'Rol inválido' }),
    })
    .optional(),
});

export type CreateUserInput = z.infer<typeof CreateUserSchema>;
export type UpdateUserInput = z.infer<typeof UpdateUserSchema>;
