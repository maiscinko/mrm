"use client"

import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useTranslations } from "next-intl"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"

// ⚓ ANCHOR: AUTH_MODE_TYPES
// REASON: Support both OAuth (Google/LinkedIn) and Email/Password auth
// PATTERN: Toggle between 'oauth' and 'email' modes with separate UI
// UX: Users can choose preferred auth method (OAuth for convenience, email for control)
type AuthMode = 'oauth' | 'email' | 'signup'

export default function LoginPage() {
  const t = useTranslations("auth")
  const router = useRouter()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [redirectUrl, setRedirectUrl] = useState("")
  const [authMode, setAuthMode] = useState<AuthMode>('oauth')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [passwordFocused, setPasswordFocused] = useState(false)
  const supabase = createClient()

  // ⚓ ANCHOR: PASSWORD_VALIDATION_RULES
  // REASON: Real-time validation feedback improves UX and reduces errors
  // PATTERN: Check each requirement individually, show green checkmarks
  // UX: User sees requirements before submitting, knows exactly what's wrong
  // BEST PRACTICE: 2025 auth UX - show requirements always, not in tooltip
  const passwordRequirements = {
    minLength: password.length >= 6,
    hasUppercase: /[A-Z]/.test(password),
    hasLowercase: /[a-z]/.test(password),
    hasNumber: /[0-9]/.test(password),
  }

  const isPasswordValid = Object.values(passwordRequirements).every(Boolean)

  useEffect(() => {
    // Set redirect URL on client side to ensure we use the correct origin
    const origin = typeof window !== 'undefined' ? window.location.origin : 'https://mrm.a25.com.br'
    setRedirectUrl(`${origin}/api/auth/callback`)
  }, [])

  const handleGoogleLogin = async () => {
    setLoading(true)

    try {
      // Call server-side API route to initiate OAuth (CORRECT WAY)
      const response = await fetch('/api/auth/signin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ provider: 'google' })
      })

      const { url, error } = await response.json()

      if (error) {
        console.error('[OAuth Error]:', error)
        setLoading(false)
        return
      }

      // Redirect to OAuth provider URL
      window.location.href = url
    } catch (error) {
      console.error('[OAuth Error]:', error)
      setLoading(false)
    }
  }

  const handleLinkedInLogin = async () => {
    setLoading(true)

    try {
      // Call server-side API route to initiate OAuth (CORRECT WAY)
      const response = await fetch('/api/auth/signin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ provider: 'linkedin_oidc' })
      })

      const { url, error } = await response.json()

      if (error) {
        console.error('[OAuth Error]:', error)
        setLoading(false)
        return
      }

      // Redirect to OAuth provider URL
      window.location.href = url
    } catch (error) {
      console.error('[OAuth Error]:', error)
      setLoading(false)
    }
  }

  // ⚓ ANCHOR: EMAIL_PASSWORD_AUTH
  // REASON: Support email/password auth for testing and users who prefer not using OAuth
  // PATTERN: Direct Supabase client-side auth (secure - uses RLS policies)
  // SECURITY: Password min 6 chars (Supabase default), validation before submit
  // UX: Clear error messages, loading states, toast feedback
  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    // Validation
    if (!email || !password) {
      toast({
        title: "Missing Information",
        description: "Please enter both email and password",
        variant: "destructive"
      })
      setLoading(false)
      return
    }

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        console.error('[Email Login Error]:', error)

        // ⚓ ANCHOR: LOGIN_ERROR_MESSAGES
        // REASON: Clear, human-friendly error messages improve UX
        // PATTERN: Map Supabase errors to user-friendly messages
        // UX: Don't blame user, be specific about what went wrong
        // BEST PRACTICE: "Invalid credentials" vs "You entered wrong password"
        let friendlyMessage = error.message

        if (error.message.includes('Invalid login credentials')) {
          friendlyMessage = "We couldn't find an account with that email and password combination. Please check your credentials and try again."
        } else if (error.message.includes('Email not confirmed')) {
          friendlyMessage = "Please confirm your email address before logging in. Check your inbox for the confirmation link."
        }

        toast({
          title: "Unable to Sign In",
          description: friendlyMessage,
          variant: "destructive"
        })
        setLoading(false)
        return
      }

      console.log('[Email Login] Success:', data.user?.email)
      toast({
        title: "Welcome Back!",
        description: `Signed in as ${data.user?.email}`,
      })

      // Redirect to dashboard
      router.push('/dashboard')
    } catch (error) {
      console.error('[Email Login Error]:', error)
      toast({
        title: "Something Went Wrong",
        description: "We're having trouble signing you in. Please try again.",
        variant: "destructive"
      })
      setLoading(false)
    }
  }

  const handleEmailSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    // Validation
    if (!email || !password || !confirmPassword) {
      toast({
        title: "Missing Information",
        description: "Please fill in all fields",
        variant: "destructive"
      })
      setLoading(false)
      return
    }

    if (password !== confirmPassword) {
      toast({
        title: "Passwords Don't Match",
        description: "Please make sure both passwords are identical",
        variant: "destructive"
      })
      setLoading(false)
      return
    }

    if (!isPasswordValid) {
      toast({
        title: "Password Requirements Not Met",
        description: "Please ensure your password meets all requirements shown below",
        variant: "destructive"
      })
      setLoading(false)
      return
    }

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          // Redirect after email confirmation (if enabled in Supabase)
          emailRedirectTo: `${window.location.origin}/dashboard`
        }
      })

      if (error) {
        console.error('[Email Signup Error]:', error)

        // ⚓ ANCHOR: SIGNUP_ERROR_MESSAGES
        // REASON: User-friendly signup error messages
        // PATTERN: Map common Supabase errors to clear instructions
        // UX: Help user fix the issue, don't just say "error"
        let friendlyMessage = error.message

        if (error.message.includes('already registered')) {
          friendlyMessage = "An account with this email already exists. Try signing in instead, or use a different email address."
        } else if (error.message.includes('invalid email')) {
          friendlyMessage = "Please enter a valid email address."
        }

        toast({
          title: "Unable to Create Account",
          description: friendlyMessage,
          variant: "destructive"
        })
        setLoading(false)
        return
      }

      console.log('[Email Signup] Success:', data.user?.email)
      toast({
        title: "Account Created! 🎉",
        description: `Welcome! You can now sign in with ${data.user?.email}`,
      })

      // Switch to login mode after successful signup
      setAuthMode('email')
      setPassword('')
      setConfirmPassword('')
      setLoading(false)
    } catch (error) {
      console.error('[Email Signup Error]:', error)
      toast({
        title: "Something Went Wrong",
        description: "We couldn't create your account. Please try again.",
        variant: "destructive"
      })
      setLoading(false)
    }
  }

  // ⚓ ANCHOR: LOGIN_UI_MODES
  // REASON: Support multiple auth methods with clean UX
  // PATTERN: Conditional rendering based on authMode state
  // UX: Toggle between OAuth/Email, clear mode switching buttons
  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold text-balance">{t("welcome")}</CardTitle>
          <CardDescription className="text-lg text-balance">{t("tagline")}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* OAuth Mode - Default */}
          {authMode === 'oauth' && (
            <>
              <Button onClick={handleGoogleLogin} disabled={loading} className="w-full" size="lg">
                {t("signInWithGoogle")}
              </Button>
              <Button
                onClick={handleLinkedInLogin}
                disabled={loading}
                className="w-full bg-transparent"
                variant="outline"
                size="lg"
              >
                {t("signInWithLinkedIn")}
              </Button>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">Or</span>
                </div>
              </div>

              <Button
                onClick={() => setAuthMode('email')}
                variant="ghost"
                className="w-full"
                disabled={loading}
              >
                Sign in with Email
              </Button>
            </>
          )}

          {/* Email Login Mode */}
          {authMode === 'email' && (
            <form onSubmit={handleEmailLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="mentor@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={loading}
                  autoComplete="email"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    disabled={loading}
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground hover:text-foreground"
                    disabled={loading}
                  >
                    {showPassword ? 'Hide' : 'Show'}
                  </button>
                </div>
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? (
                  <span className="flex items-center gap-2">
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-background border-t-transparent" />
                    Signing in...
                  </span>
                ) : (
                  'Sign In'
                )}
              </Button>

              <div className="text-center text-sm">
                <button
                  type="button"
                  onClick={() => setAuthMode('signup')}
                  className="text-primary hover:underline"
                  disabled={loading}
                >
                  Don't have an account? Sign up
                </button>
              </div>

              <Button
                type="button"
                onClick={() => setAuthMode('oauth')}
                variant="ghost"
                className="w-full"
                disabled={loading}
              >
                ← Back to OAuth
              </Button>
            </form>
          )}

          {/* Email Signup Mode */}
          {authMode === 'signup' && (
            <form onSubmit={handleEmailSignup} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="signup-email">Email</Label>
                <Input
                  id="signup-email"
                  type="email"
                  placeholder="mentor@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={loading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="signup-password">Password</Label>
                <div className="relative">
                  <Input
                    id="signup-password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onFocus={() => setPasswordFocused(true)}
                    required
                    disabled={loading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground hover:text-foreground"
                    disabled={loading}
                  >
                    {showPassword ? 'Hide' : 'Show'}
                  </button>
                </div>

                {/* ⚓ ANCHOR: PASSWORD_REQUIREMENTS_UI */}
                {/* REASON: Real-time visual feedback on password requirements */}
                {/* PATTERN: Show always (not in tooltip), green checkmarks for met requirements */}
                {/* UX: User knows exactly what's needed before submitting */}
                {/* BEST PRACTICE: 2025 auth UX - visible requirements, real-time validation */}
                {(passwordFocused || password.length > 0) && (
                  <div className="mt-2 space-y-1 text-xs">
                    <p className="font-medium text-muted-foreground">Password must contain:</p>
                    <div className="space-y-0.5">
                      <div className={`flex items-center gap-2 ${passwordRequirements.minLength ? 'text-green-600' : 'text-muted-foreground'}`}>
                        <span>{passwordRequirements.minLength ? '✓' : '○'}</span>
                        <span>At least 6 characters</span>
                      </div>
                      <div className={`flex items-center gap-2 ${passwordRequirements.hasUppercase ? 'text-green-600' : 'text-muted-foreground'}`}>
                        <span>{passwordRequirements.hasUppercase ? '✓' : '○'}</span>
                        <span>One uppercase letter (A-Z)</span>
                      </div>
                      <div className={`flex items-center gap-2 ${passwordRequirements.hasLowercase ? 'text-green-600' : 'text-muted-foreground'}`}>
                        <span>{passwordRequirements.hasLowercase ? '✓' : '○'}</span>
                        <span>One lowercase letter (a-z)</span>
                      </div>
                      <div className={`flex items-center gap-2 ${passwordRequirements.hasNumber ? 'text-green-600' : 'text-muted-foreground'}`}>
                        <span>{passwordRequirements.hasNumber ? '✓' : '○'}</span>
                        <span>One number (0-9)</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirm-password">Confirm Password</Label>
                <div className="relative">
                  <Input
                    id="confirm-password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    disabled={loading}
                  />
                  {confirmPassword && (
                    <div className={`absolute right-3 top-1/2 -translate-y-1/2 text-sm ${password === confirmPassword ? 'text-green-600' : 'text-red-600'}`}>
                      {password === confirmPassword ? '✓' : '✗'}
                    </div>
                  )}
                </div>
              </div>
              <Button
                type="submit"
                className="w-full"
                disabled={loading || !isPasswordValid || password !== confirmPassword}
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-background border-t-transparent" />
                    Creating account...
                  </span>
                ) : (
                  'Create Account'
                )}
              </Button>

              <div className="text-center text-sm">
                <button
                  type="button"
                  onClick={() => setAuthMode('email')}
                  className="text-primary hover:underline"
                  disabled={loading}
                >
                  Already have an account? Sign in
                </button>
              </div>

              <Button
                type="button"
                onClick={() => setAuthMode('oauth')}
                variant="ghost"
                className="w-full"
                disabled={loading}
              >
                ← Back to OAuth
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
