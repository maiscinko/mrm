import { createServerClient, type CookieOptions } from "@supabase/ssr"
import { NextResponse, type NextRequest } from "next/server"
// import createMiddleware from "next-intl/middleware" // Disabled - pages not in [locale] structure

// const intlMiddleware = createMiddleware({
//   locales: ["en", "pt-br"],
//   defaultLocale: "en",
//   localePrefix: "never",
// })

export async function middleware(request: NextRequest) {
  // Fix for proxy/Traefik: use X-Forwarded headers for correct URL
  const protocol = request.headers.get('x-forwarded-proto') || 'https'
  const host = request.headers.get('x-forwarded-host') || request.headers.get('host') || 'mrm.a25.com.br'

  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          request.cookies.set({
            name,
            value,
            ...options,
          })
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          response.cookies.set({
            name,
            value,
            ...options,
          })
        },
        remove(name: string, options: CookieOptions) {
          request.cookies.set({
            name,
            value: "",
            ...options,
          })
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          response.cookies.set({
            name,
            value: "",
            ...options,
          })
        },
      },
    },
  )

  // Skip auth check for callback route (let it process the OAuth code first)
  if (request.nextUrl.pathname === '/api/auth/callback') {
    console.log('[Middleware] Skipping auth check for callback route')
    return response
  }

  try {
    // IMPORTANT: Use getUser() instead of getSession() for security
    // getUser() validates the token with Supabase server
    const {
      data: { user },
      error: userError
    } = await supabase.auth.getUser()

    console.log('[Middleware] Auth check:', {
      path: request.nextUrl.pathname,
      hasUser: !!user,
      userEmail: user?.email,
      error: userError?.message
    })

    const protectedPaths = ["/dashboard", "/mentee", "/profile", "/settings"]
    const isProtectedPath = protectedPaths.some((path) => request.nextUrl.pathname.startsWith(path))

    if (isProtectedPath && !user) {
      console.log('[Middleware] Protected path without user - redirecting to login')
      const redirectUrl = new URL("/login", request.url)
      redirectUrl.searchParams.set("redirectTo", request.nextUrl.pathname)
      return NextResponse.redirect(redirectUrl)
    }

    if (request.nextUrl.pathname === "/login" && user) {
      console.log('[Middleware] Login page with user - redirecting to dashboard')
      const redirectTo = request.nextUrl.searchParams.get("redirectTo")
      const destination = redirectTo && redirectTo.startsWith("/") ? redirectTo : "/dashboard"
      return NextResponse.redirect(new URL(destination, request.url))
    }
  } catch (error) {
    console.error("[Middleware] Middleware error:", error)
    // On error, allow request to continue (fail open for better UX)
    // Protected routes will still be caught by page-level auth checks
  }

  // IMPORTANT: Return response with updated cookies
  return response
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
}
