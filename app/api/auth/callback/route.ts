import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import type { Database } from '@/lib/supabase/database.types'

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const next = requestUrl.searchParams.get('next') || '/dashboard'

  // Fix for proxy: use X-Forwarded headers
  const forwardedProto = request.headers.get('x-forwarded-proto') || 'https'
  const forwardedHost = request.headers.get('x-forwarded-host') || request.headers.get('host') || 'mrm.a25.com.br'
  const origin = `${forwardedProto}://${forwardedHost}`

  console.log('[Auth Callback] Processing OAuth callback')
  console.log('[Auth Callback] Code:', code ? 'present' : 'missing')
  console.log('[Auth Callback] Request URL:', requestUrl.toString())
  console.log('[Auth Callback] Forwarded Proto:', forwardedProto)
  console.log('[Auth Callback] Forwarded Host:', forwardedHost)
  console.log('[Auth Callback] Origin:', origin)

  if (code) {
    try {
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

      const { error } = await supabase.auth.exchangeCodeForSession(code)

      if (error) {
        console.error('[Auth Callback] Error exchanging code for session:', error)
        // Redirect to login with error message
        const errorUrl = new URL('/login', requestUrl.origin)
        errorUrl.searchParams.set('error', 'auth_failed')
        return NextResponse.redirect(errorUrl)
      }

      console.log('[Auth Callback] Session established successfully')
    } catch (error) {
      console.error('[Auth Callback] Unexpected error:', error)
      const errorUrl = new URL('/login', requestUrl.origin)
      errorUrl.searchParams.set('error', 'unexpected_error')
      return NextResponse.redirect(errorUrl)
    }
  } else {
    console.warn('[Auth Callback] No code provided in callback')
    const errorUrl = new URL('/login', requestUrl.origin)
    errorUrl.searchParams.set('error', 'no_code')
    return NextResponse.redirect(errorUrl)
  }

  // URL to redirect to after successful sign in
  // Use the origin from forwarded headers to ensure correct domain
  const redirectUrl = new URL(next, origin)
  console.log('[Auth Callback] Redirecting to:', redirectUrl.toString())

  return NextResponse.redirect(redirectUrl)
}