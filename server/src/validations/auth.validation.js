import { z } from 'zod';

export const registerSchema = {
  body: z.object({
    name: z.string().min(2).max(80),
    email: z.string().email(),
    password: z.string().min(6).max(72),
    phone: z.string().optional(),
  }),
};

export const loginSchema = {
  body: z.object({
    email: z.string().email(),
    password: z.string().min(1),
  }),
};

export const forgotPasswordSchema = {
  body: z.object({
    email: z.string().email(),
  }),
};

export const verifyOtpSchema = {
  body: z.object({
    email: z.string().email(),
    code: z.string().min(4).max(10),
  }),
};

export const resetPasswordSchema = {
  body: z.object({
    email: z.string().email(),
    token: z.string().min(20),
    password: z.string().min(6).max(72),
  }),
};

export const updatePasswordSchema = {
  body: z.object({
    currentPassword: z.string().min(1).optional(),
    newPassword: z.string().min(6).max(72),
    otp: z.string().min(4).max(10),
  }),
};
