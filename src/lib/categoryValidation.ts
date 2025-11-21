import { z } from 'zod';

export const categoryFormSchema = z.object({
  name: z.string()
    .min(1, 'Name is required')
    .max(50, 'Name must be 50 characters or less')
    .trim(),
  bg_color: z.string()
    .min(1, 'You must select a color'),
  text_color: z.string()
    .min(1, 'You must select a color'),
  border_color: z.string()
    .min(1, 'You must select a color'),
});

export type CategoryFormData = z.infer<typeof categoryFormSchema>;
