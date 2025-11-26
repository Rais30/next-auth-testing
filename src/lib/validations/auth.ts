import { z } from 'zod'

export const registerSchema = z.object({
  name: z
    .string()
    .min(2, 'Nama minimal 2 karakter')
    .max(50, 'Nama maksimal 50 karakter'),
  
  username: z
    .string()
    .min(3, 'Username minimal 3 karakter')
    .max(20, 'Username maksimal 20 karakter')
    .regex(/^[a-zA-Z0-9_]+$/, 'Username hanya boleh huruf, angka, dan underscore'),
  
  email: z
    .string()
    .min(1, 'Email wajib diisi')
    .email('Format email tidak valid'),
  
  password: z
    .string()
    .min(8, 'Password minimal 8 karakter')
    .max(128, 'Password maksimal 128 karakter'),
  
  confirmPassword: z
    .string()
    .min(1, 'Konfirmasi password wajib diisi'),
  
  bio: z
    .string()
    .max(200, 'Bio maksimal 200 karakter')
    .optional(),
  
  location: z
    .string()
    .max(100, 'Lokasi maksimal 100 karakter')
    .optional(),
  
  website: z
    .string()
    .url('Format website tidak valid')
    .optional()
    .or(z.literal('')),
  
  captcha: z
    .string()
    .min(1, 'Captcha wajib diisi')
    .optional()
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Password dan konfirmasi password tidak cocok',
  path: ['confirmPassword']
})

export type RegisterFormData = z.infer<typeof registerSchema>

export const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'Email wajib diisi')
    .email('Format email tidak valid'),
  
  password: z
    .string()
    .min(1, 'Password wajib diisi')
})

export type LoginFormData = z.infer<typeof loginSchema>