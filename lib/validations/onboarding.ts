import { z } from "zod"

// Step 1: Mentor Profile
export const mentorProfileSchema = z.object({
  fullName: z
    .string()
    .min(3, "Nome deve ter pelo menos 3 caracteres")
    .max(100, "Nome deve ter no máximo 100 caracteres"),
  bio: z.string().max(1000, "Bio deve ter no máximo 1000 caracteres").optional(),
  yearsExperience: z
    .number()
    .int("Anos de experiência deve ser um número inteiro")
    .min(0, "Anos de experiência deve ser maior ou igual a 0")
    .max(50, "Anos de experiência deve ser menor que 50"),
  specialties: z.array(z.string()).default([]),
  mentoringStyle: z
    .enum(["diretivo", "coaching", "hibrido", "facilitador"], {
      errorMap: () => ({ message: "Selecione um estilo de mentoria válido" }),
    })
    .optional(),
  isMlsMember: z.boolean().default(false),
  mlsCode: z.string().max(50, "Código MLS deve ter no máximo 50 caracteres").optional(),
})

// Step 2: Mentoring Program
export const mentoringProgramSchema = z.object({
  programName: z
    .string()
    .min(3, "Nome do programa deve ter pelo menos 3 caracteres")
    .max(200, "Nome do programa deve ter no máximo 200 caracteres"),
  billingModel: z.enum(["mensal", "trimestral", "semestral", "anual", "pacote"], {
    errorMap: () => ({ message: "Selecione um modelo de cobrança válido" }),
  }),
  billingAmount: z
    .number()
    .min(0, "Valor deve ser maior ou igual a 0")
    .max(1000000, "Valor deve ser menor que R$ 1.000.000"),
  cycleDurationMonths: z
    .number()
    .int("Duração deve ser um número inteiro")
    .min(1, "Duração mínima é 1 mês")
    .max(60, "Duração máxima é 60 meses"),
})

// Step 3: Sessions Structure
export const sessionsSchema = z.object({
  individualFrequency: z.enum(["semanal", "quinzenal", "mensal", "flexivel"], {
    errorMap: () => ({ message: "Selecione uma frequência válida" }),
  }),
  individualDuration: z
    .number()
    .int("Duração deve ser um número inteiro")
    .min(15, "Duração mínima é 15 minutos")
    .max(300, "Duração máxima é 300 minutos (5 horas)"),
  individualFormat: z.enum(["online", "presencial", "hibrido"], {
    errorMap: () => ({ message: "Selecione um formato válido" }),
  }),
  groupFrequency: z.enum(["nenhuma", "mensal", "bimestral", "trimestral"], {
    errorMap: () => ({ message: "Selecione uma frequência válida" }),
  }),
  groupDuration: z
    .number()
    .int("Duração deve ser um número inteiro")
    .min(0, "Duração deve ser maior ou igual a 0")
    .max(480, "Duração máxima é 480 minutos (8 horas)")
    .optional(),
  groupFormat: z.enum(["online", "presencial", "hibrido"]).optional(),
})

// Step 4: Framework and Deliverables
export const deliverableItemSchema = z.object({
  name: z
    .string()
    .min(3, "Nome do entregável deve ter pelo menos 3 caracteres")
    .max(200, "Nome deve ter no máximo 200 caracteres"),
  type: z.enum(["document", "presentation", "plan", "assessment"], {
    errorMap: () => ({ message: "Selecione um tipo válido" }),
  }),
  description: z.string().max(500, "Descrição deve ter no máximo 500 caracteres").optional(),
  dueAfterDays: z
    .number()
    .int("Prazo deve ser um número inteiro")
    .min(1, "Prazo mínimo é 1 dia")
    .max(365, "Prazo máximo é 365 dias"),
  isMandatory: z.boolean().default(true),
})

export const checkpointItemSchema = z.object({
  name: z
    .string()
    .min(3, "Nome do checkpoint deve ter pelo menos 3 caracteres")
    .max(200, "Nome deve ter no máximo 200 caracteres"),
  frequencyDays: z
    .number()
    .int("Frequência deve ser um número inteiro")
    .min(7, "Frequência mínima é 7 dias")
    .max(365, "Frequência máxima é 365 dias"),
  description: z.string().max(500, "Descrição deve ter no máximo 500 caracteres").optional(),
})

export const deliverablesSchema = z.object({
  methodology: z.enum(["GROW", "SMART", "OKR", "PDCA", "custom"], {
    errorMap: () => ({ message: "Selecione uma metodologia válida" }),
  }),
  deliverables: z.array(deliverableItemSchema).default([]),
  checkpoints: z.array(checkpointItemSchema).default([]),
})

// Complete onboarding data schema
export const onboardingSchema = z.object({
  profile: mentorProfileSchema,
  program: mentoringProgramSchema,
  sessions: sessionsSchema,
  deliverables: deliverablesSchema,
})

// Type exports
export type MentorProfile = z.infer<typeof mentorProfileSchema>
export type MentoringProgram = z.infer<typeof mentoringProgramSchema>
export type Sessions = z.infer<typeof sessionsSchema>
export type DeliverableItem = z.infer<typeof deliverableItemSchema>
export type CheckpointItem = z.infer<typeof checkpointItemSchema>
export type Deliverables = z.infer<typeof deliverablesSchema>
export type OnboardingData = z.infer<typeof onboardingSchema>
