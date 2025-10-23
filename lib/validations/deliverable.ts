import { z } from "zod"

export const createDeliverableSchema = z.object({
  task: z.string().min(1, "Task is required"),
  responsible: z.enum(["mentor", "mentee"]),
  due_date: z.string().optional(),
  status: z.enum(["pending", "in_progress", "completed", "cancelled"]).default("pending"),
  comment: z.string().optional(),
})

export type CreateDeliverableInput = z.infer<typeof createDeliverableSchema>
