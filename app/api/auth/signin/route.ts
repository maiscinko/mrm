import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import type { Database } from '@/lib/supabase/database.types'

export async function POST(request: Request) {
  const { provider } = await request.json()

  console.log('[Auth SignIn] Initiating OAuth for provider:', provider)

  const cookieStore = cookies()
  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          cookieStore.set({ name, value, ...options })
        },
        remove(name: string, options: CookieOptions) {
          cookieStore.set({ name, value: '', ...options })
        },
      },
    }
  )

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider,
    options: {
      redirectTo: `${process.env.NEXT_PUBLIC_APP_URL || 'https://mrm.a25.com.br'}/api/auth/callback`,
      queryParams: provider === 'google' ? {
        access_type: 'offline',
        prompt: 'consent',
      } : undefined
    },
  })

  if (error) {
    console.error('[Auth SignIn] Error:', error)
    return NextResponse.json({ error: error.message }, { status: 400 })
  }

  console.log('[Auth SignIn] OAuth URL generated:', data.url)

  // Return the OAuth URL for client-side redirect
  return NextResponse.json({ url: data.url })
}
