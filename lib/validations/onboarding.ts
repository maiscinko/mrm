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
  nicheArea: z.string().min(3, "Niche area must have at least 3 characters"),
  mainSources: z.array(z.string()).default([]),
  otherSource: z.string().max(200, "Description must be at most 200 characters").optional(),

  // Step 3: Entregáveis
  // Encontros em Grupo
  groupDeliverableName: z.string().max(200, "Nome do entregável deve ter no máximo 200 caracteres").optional(),
  groupMeetingFormat: z.enum(["online", "presencial", "hybrid"]).optional(),
  groupMeetingFrequency: z.enum(["none", "monthly", "bimonthly", "quarterly"]).optional(),
  groupMeetingDuration: z
    .number()
    .int("Duração deve ser um número inteiro")
    .min(0, "Duração deve ser maior ou igual a 0")
    .max(480, "Duração máxima é 480 minutos (8 horas)")
    .optional(),
  // Encontros Individuais 1-on-1
  individualTotalInPeriod: z
    .number()
    .int("Total de sessões deve ser um número inteiro")
    .min(1, "Deve ter pelo menos 1 sessão individual")
    .max(1000, "Número máximo é 1000 sessões"),
  individualDuration: z
    .number()
    .int("Duração deve ser um número inteiro")
    .min(15, "Duração mínima é 15 minutos")
    .max(300, "Duração máxima é 300 minutos (5 horas)"),
  individualFormat: z.enum(["online", "presencial", "hybrid"], {
    errorMap: () => ({ message: "Selecione um formato válido" }),
  }),
  // Forma de Comunicação
  communicationMethods: z.array(z.string()).default([]),
  customCommunicationMethod: z.string().max(200, "Custom communication method must be at most 200 characters").optional(),
  otherDeliverables: z.array(z.string()).default([]),
  customOtherDeliverable: z.string().max(200, "Custom deliverable must be at most 200 characters").optional(),

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
