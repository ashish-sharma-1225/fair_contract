import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  rememberMe: z.boolean(),
});



export type LoginFormData = z.infer<typeof loginSchema>;

export const registerSchema = z
  .object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    email: z.string().email('Please enter a valid email address'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    confirmPassword: z.string(),
  })
  .refine(data => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

export type RegisterFormData = z.infer<typeof registerSchema>;

export const policyFormSchema = z.object({
  name: z.string().min(3, 'Policy name must be at least 3 characters'),
  category: z.enum(['payment', 'renewal', 'liability', 'jurisdiction', 'other']),
  rule_text: z.string().min(10, 'Rule description must be at least 10 characters explaining what to flag'),
  severity: z.enum(['high', 'medium', 'low']),
  max_payment_days: z.number().min(1).max(365).optional(),
  min_cancellation_notice_days: z.number().min(1).max(365).optional(),
  liability_cap_percent: z.number().min(0).max(1000).optional(),
  preferred_jurisdiction: z.string().optional(),
  is_enabled: z.boolean(),
});



export type PolicyFormData = z.infer<typeof policyFormSchema>;

export const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10MB

export function validatePdfFile(file: File): { valid: boolean; error?: string } {
  if (!file) {
    return { valid: false, error: 'No file provided' };
  }
  if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
    return { valid: false, error: 'Only PDF documents are supported' };
  }
  if (file.size > MAX_FILE_SIZE_BYTES) {
    return { valid: false, error: 'File size exceeds the 10 MB limit' };
  }
  return { valid: true };
}
