import { z } from "zod"

export const createSessionSchema = z.object({
  session_date: z.string(),
  theme: z.string().optional(),
  notes: z.string().optional(),
  next_steps: z.string().optional(),
  emotion_tag: z.enum(["frustrated", "hopeful", "confused", "excited", "stuck"]).optional(),
  result_tag: z.enum(["breakthrough", "incremental", "stuck"]).optional(),
})

export type CreateSessionInput = z.infer<typeof createSessionSchema>
