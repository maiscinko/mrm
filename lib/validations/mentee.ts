import { z } from "zod"

// ⚓ ANCHOR: MENTEE VALIDATION SCHEMA
// REASON: v0.5 complete mentee onboarding - mentor creates mentee with contract + generates onboarding link
// PATTERN: Zod validation for contract fields (duration, value, payment model, entry fee)
export const createMenteeSchema = z.object({
  full_name: z.string().min(1, "Name is required"),
  email: z.string().email("Valid email is required"),
  whatsapp: z.string().min(10, "WhatsApp number is required (format: +5511999999999)"),
  contract_duration_months: z.number().min(1, "Duration must be at least 1 month").max(48, "Max 48 months"),
  contract_start_date: z.string().min(1, "Start date is required"),
  contract_value_total: z.number().min(0, "Total value must be positive").optional(),
  payment_model: z.enum(["monthly", "quarterly", "upfront", "custom"]).default("monthly"),
  payment_amount_monthly: z.number().min(0, "Monthly payment must be positive").optional(),
  entry_payment_amount: z.number().min(0, "Entry payment must be positive").optional(),
  entry_payment_received: z.boolean().default(false),
})

export const updateMenteeSchema = createMenteeSchema.partial()

export type CreateMenteeInput = z.infer<typeof createMenteeSchema>
export type UpdateMenteeInput = z.infer<typeof updateMenteeSchema>
