import { z } from 'zod';

export const aboutTabSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z
    .string()
    .max(280, 'Description must be 280 characters or less')
    .optional()
    .nullable(),
  emoji: z.string().optional().nullable(),
  image_url: z.string().url('Must be a valid URL').optional().or(z.literal('')).nullable(),
  category_id: z.string().uuid().optional().nullable(),
});

export type AboutTabFormData = z.infer<typeof aboutTabSchema>;
