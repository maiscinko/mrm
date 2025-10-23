// Pre-defined deliverable templates based on popular mentoring methodologies

export interface DeliverableTemplate {
  name: string
  type: "document" | "presentation" | "plan" | "assessment"
  description: string
  dueAfterDays: number
  isMandatory: boolean
}

export interface CheckpointTemplate {
  name: string
  frequencyDays: number
  description: string
}

export interface MethodologyTemplate {
  methodology: string
  description: string
  deliverables: DeliverableTemplate[]
  checkpoints: CheckpointTemplate[]
}

export const METHODOLOGY_TEMPLATES: Record<string, MethodologyTemplate> = {
  GROW: {
    methodology: "GROW",
    description: "Goal, Reality, Options, Will - Framework clássico de coaching",
    deliverables: [
      {
        name: "Definição de Objetivos (Goals)",
        type: "document",
        description: "Documento estruturado com metas SMART para o ciclo de mentoria",
        dueAfterDays: 14,
        isMandatory: true,
      },
      {
        name: "Análise de Realidade (Reality)",
        type: "assessment",
        description: "Autoavaliação do estado atual: competências, desafios, recursos",
        dueAfterDays: 21,
        isMandatory: true,
      },
      {
        name: "Plano de Opções (Options)",
        type: "plan",
        description: "Mapeamento de alternativas e caminhos possíveis para atingir objetivos",
        dueAfterDays: 45,
        isMandatory: true,
      },
      {
        name: "Plano de Ação (Will)",
        type: "plan",
        description: "Compromissos concretos: ações específicas, prazos, recursos necessários",
        dueAfterDays: 60,
        isMandatory: true,
      },
    ],
    checkpoints: [
      {
        name: "Checkpoint Trimestral",
        frequencyDays: 90,
        description: "Revisão de progresso Goals → Reality → Options → Will",
      },
    ],
  },
  SMART: {
    methodology: "SMART",
    description: "Specific, Measurable, Achievable, Relevant, Time-bound Goals",
    deliverables: [
      {
        name: "Definição de Metas SMART",
        type: "document",
        description: "Metas específicas, mensuráveis, atingíveis, relevantes e com prazo definido",
        dueAfterDays: 14,
        isMandatory: true,
      },
      {
        name: "Plano de Medição de Resultados",
        type: "plan",
        description: "KPIs e métricas para acompanhar evolução de cada meta",
        dueAfterDays: 30,
        isMandatory: true,
      },
      {
        name: "Relatório de Progresso Mensal",
        type: "document",
        description: "Update quantitativo e qualitativo do avanço em cada meta",
        dueAfterDays: 30,
        isMandatory: false,
      },
    ],
    checkpoints: [
      {
        name: "Review Mensal de Metas",
        frequencyDays: 30,
        description: "Verificação progresso metas SMART + ajustes necessários",
      },
    ],
  },
  OKR: {
    methodology: "OKR",
    description: "Objectives & Key Results - Metodologia ágil de metas",
    deliverables: [
      {
        name: "Definição de OKRs Trimestrais",
        type: "document",
        description: "Objetivos qualitativos + 3-5 Key Results mensuráveis por objetivo",
        dueAfterDays: 14,
        isMandatory: true,
      },
      {
        name: "Check-in Semanal OKRs",
        type: "assessment",
        description: "Atualização semanal progresso Key Results (0-100%)",
        dueAfterDays: 7,
        isMandatory: false,
      },
      {
        name: "Retrospectiva OKRs",
        type: "document",
        description: "Review final do trimestre: O que funcionou, o que aprendemos, próximos OKRs",
        dueAfterDays: 90,
        isMandatory: true,
      },
    ],
    checkpoints: [
      {
        name: "Review Semanal OKRs",
        frequencyDays: 7,
        description: "Check-in rápido progresso Key Results + blockers",
      },
      {
        name: "Retrospectiva Trimestral",
        frequencyDays: 90,
        description: "Review completo OKRs do trimestre + planejamento próximo ciclo",
      },
    ],
  },
  PDCA: {
    methodology: "PDCA",
    description: "Plan, Do, Check, Act - Ciclo de melhoria contínua",
    deliverables: [
      {
        name: "Plano de Desenvolvimento (Plan)",
        type: "plan",
        description: "Planejamento detalhado de ações, recursos, prazos e responsáveis",
        dueAfterDays: 21,
        isMandatory: true,
      },
      {
        name: "Relatório de Execução (Do)",
        type: "document",
        description: "Registro de ações executadas, resultados obtidos, desafios encontrados",
        dueAfterDays: 60,
        isMandatory: true,
      },
      {
        name: "Análise de Resultados (Check)",
        type: "assessment",
        description: "Comparação resultados planejados vs reais + identificação desvios",
        dueAfterDays: 75,
        isMandatory: true,
      },
      {
        name: "Plano de Ajustes (Act)",
        type: "plan",
        description: "Correções e melhorias baseadas em aprendizados do ciclo",
        dueAfterDays: 90,
        isMandatory: true,
      },
    ],
    checkpoints: [
      {
        name: "Review PDCA Ciclo Completo",
        frequencyDays: 90,
        description: "Avaliação completa Plan → Do → Check → Act + início novo ciclo",
      },
    ],
  },
  custom: {
    methodology: "custom",
    description: "Metodologia própria - Customize completamente seus entregáveis",
    deliverables: [],
    checkpoints: [],
  },
}

// Helper function to get methodology options
export const METHODOLOGY_OPTIONS = [
  {
    value: "GROW",
    label: "GROW (Goal, Reality, Options, Will)",
    description: "Framework clássico de coaching - 4 entregáveis estruturados",
  },
  {
    value: "SMART",
    label: "SMART Goals",
    description: "Metas específicas e mensuráveis - 3 entregáveis focados em resultados",
  },
  {
    value: "OKR",
    label: "OKRs (Objectives & Key Results)",
    description: "Metodologia ágil - Check-ins frequentes e ciclos trimestrais",
  },
  {
    value: "PDCA",
    label: "PDCA (Plan, Do, Check, Act)",
    description: "Melhoria contínua - 4 entregáveis ciclo completo",
  },
  {
    value: "custom",
    label: "Metodologia Própria",
    description: "Crie seus próprios entregáveis e checkpoints do zero",
  },
]
