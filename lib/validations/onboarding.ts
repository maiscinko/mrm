import { z } from "zod"

// New onboarding schema for MLS mentors (4 steps)
export const onboardingSchema = z.object({
  // Step 1: Identificação
  fullName: z
    .string()
    .min(3, "Nome deve ter pelo menos 3 caracteres")
    .max(100, "Nome deve ter no máximo 100 caracteres"),
  email: z.string().email("Email inválido"),
  linkedinUrl: z.string().url("URL do LinkedIn inválida").optional().or(z.literal("")),
  instagramUrl: z.string().url("URL do Instagram inválida").optional().or(z.literal("")),
  bio: z.string().max(1000, "Bio deve ter no máximo 1000 caracteres").optional(),

  // Step 2: Club & Categoria MLS
  clubName: z.string().max(200, "Nome do club deve ter no máximo 200 caracteres").optional(),
  clubCategory: z.enum(["bronze", "silver", "gold", "platinum", "diamond"], {
    errorMap: () => ({ message: "Selecione uma categoria MLS válida" }),
  }),
  activeMentees: z
    .number()
    .int("Número de mentorados deve ser um número inteiro")
    .min(0, "Número de mentorados deve ser maior ou igual a 0")
    .max(1000, "Número de mentorados deve ser menor que 1000"),
  nicheArea: z.string().min(3, "Nicho de atuação deve ter pelo menos 3 caracteres"),
  mainSource: z.enum(["mls-referral", "personal-network", "social-media", "mls-events", "other"], {
    errorMap: () => ({ message: "Selecione uma fonte válida" }),
  }).optional(),
  otherSource: z.string().max(200, "Descrição deve ter no máximo 200 caracteres").optional(),

  // Step 3: Entregáveis
  groupMeetingFrequency: z.enum(["none", "monthly", "bimonthly", "quarterly"], {
    errorMap: () => ({ message: "Selecione uma frequência válida" }),
  }),
  groupMeetingDuration: z
    .number()
    .int("Duração deve ser um número inteiro")
    .min(0, "Duração deve ser maior ou igual a 0")
    .max(480, "Duração máxima é 480 minutos (8 horas)"),
  groupMeetingFormat: z.enum(["online", "presencial", "hybrid"]).optional(),
  individualFrequency: z.enum(["weekly", "biweekly", "monthly", "flexible"], {
    errorMap: () => ({ message: "Selecione uma frequência válida" }),
  }),
  individualDuration: z
    .number()
    .int("Duração deve ser um número inteiro")
    .min(15, "Duração mínima é 15 minutos")
    .max(300, "Duração máxima é 300 minutos (5 horas)"),
  individualFormat: z.enum(["online", "presencial", "hybrid"], {
    errorMap: () => ({ message: "Selecione um formato válido" }),
  }),
  asyncCommunication: z.array(z.string()).default([]),
  otherDeliverables: z.array(z.string()).default([]),

  // Step 4: Metodologia & Outcomes
  framework: z.enum(["grow", "okr", "smart", "custom"], {
    errorMap: () => ({ message: "Selecione um framework válido" }),
  }).optional(),
  customFramework: z.string().max(500, "Descrição deve ter no máximo 500 caracteres").optional(),
  mentoringStyle: z.enum(["directive", "coaching", "facilitator", "hybrid"], {
    errorMap: () => ({ message: "Selecione um estilo de mentoria válido" }),
  }),
  successMetrics: z.array(z.string()).default([]),
})

// Type export
export type OnboardingData = z.infer<typeof onboardingSchema>
