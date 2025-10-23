const requiredEnvVars = ["NEXT_PUBLIC_SUPABASE_URL", "NEXT_PUBLIC_SUPABASE_ANON_KEY"] as const

const serverOnlyEnvVars = ["OPENAI_API_KEY"] as const // ANTHROPIC_API_KEY é opcional (MVP usa só OpenAI)

// Validate client-side env vars immediately
requiredEnvVars.forEach((envVar) => {
  if (!process.env[envVar]) {
    throw new Error(`Missing required environment variable: ${envVar}`)
  }
})

// Validate server-side env vars (only in API routes)
export function validateServerEnv() {
  if (typeof window !== "undefined") return // Skip on client

  serverOnlyEnvVars.forEach((envVar) => {
    if (!process.env[envVar]) {
      throw new Error(`Missing required server environment variable: ${envVar}`)
    }
  })
}

export const config = {
  supabase: {
    url: process.env.NEXT_PUBLIC_SUPABASE_URL!,
    anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  },
  openai: {
    apiKey: process.env.OPENAI_API_KEY!,
  },
  anthropic: {
    apiKey: process.env.ANTHROPIC_API_KEY || '', // Optional - MVP usa só OpenAI
  },
} as const
