import { z } from "zod"

export const createMenteeSchema = z.object({
  full_name: z.string().min(1, "Name is required"),
  company: z.string().optional(),
  role: z.string().optional(),
  stated_goal: z.string().min(10, "Goal must be at least 10 characters"),
  plan_duration_months: z.number().min(1).max(24),
  plan_start_date: z.string(),
  baseline_clarity_score: z.number().min(1).max(10).optional(),
})

export const updateMenteeSchema = createMenteeSchema.partial()

export type CreateMenteeInput = z.infer<typeof createMenteeSchema>
export type UpdateMenteeInput = z.infer<typeof updateMenteeSchema>
