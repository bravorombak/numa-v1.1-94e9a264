import { z } from "zod";

export const modelFormSchema = z.object({
  name: z.string().min(1, "Name is required"),
  provider: z.enum(["openai", "anthropic", "google", "perplexity"], {
    required_error: "Provider is required",
  }),
  provider_model: z.string().min(1, "Provider model is required"),
  status: z.enum(["active", "inactive"], {
    required_error: "Status is required",
  }),
  max_tokens: z.number().positive().optional().nullable(),
  description: z.string().optional().nullable(),
});

export type ModelFormData = z.infer<typeof modelFormSchema>;
