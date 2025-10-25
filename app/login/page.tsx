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
import { authLogger } from "@/lib/logger"

// ⚓ ANCHOR: AUTH_MODE_TYPES
// REASON: Support both OAuth (Google/LinkedIn) and Email/Password auth
// PATTERN: Toggle between 'oauth', 'email', 'signup', and 'forgot-password' modes with separate UI
// UX: Users can choose preferred auth method (OAuth for convenience, email for control)
type AuthMode = 'oauth' | 'email' | 'signup' | 'forgot-password'

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
  const [resetEmailSent, setResetEmailSent] = useState(false)
  const supabase = createClient()

  // ⚓ ANCHOR: PASSWORD_VALIDATION_RULES
  // REASON: Real-time validation feedback improves UX and reduces errors
  // PATTERN: Check each requirement individually, show green checkmarks
  // UX: User sees requirements before submitting, knows exactly what's wrong
  // BEST PRACTICE: 2025 auth UX - show requirements always, not in tooltip
  // SECURITY: Min 11 chars recommended (NIST 2024), uppercase, lowercase, number, special char
  const passwordRequirements = {
    minLength: password.length >= 11,
    hasUppercase: /[A-Z]/.test(password),
    hasLowercase: /[a-z]/.test(password),
    hasNumber: /[0-9]/.test(password),
    hasSpecial: /[!@#$%^&*(),.?":{}|<>]/.test(password),
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
    authLogger.info('Email login initiated', { email })
    setLoading(true)

    // Validation
    if (!email || !password) {
      authLogger.warn('Login validation failed: missing credentials')
      toast({
        title: "Missing Information",
        description: "Please enter both email and password",
        variant: "destructive"
      })
      setLoading(false)
      return
    }

    try {
      authLogger.debug('Calling Supabase signInWithPassword')
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      authLogger.debug('Supabase response received', { hasError: !!error, hasUser: !!data.user })

      if (error) {
        authLogger.error('Login failed', {
          message: error.message,
          status: error.status,
          email
        })

        // ⚓ ANCHOR: LOGIN_ERROR_MESSAGES
        // REASON: Clear, human-friendly error messages improve UX
        // PATTERN: Map Supabase errors to user-friendly messages
        // UX: Don't blame user, be specific about what went wrong
        // BEST PRACTICE: "Invalid credentials" vs "You entered wrong password"
        // COMPREHENSIVE: Cover ALL possible auth errors
        let friendlyTitle = "Unable to Sign In"
        let friendlyMessage = error.message

        if (error.message.includes('Invalid login credentials')) {
          friendlyTitle = "Incorrect Email or Password"
          friendlyMessage = "The email or password you entered is incorrect. Please check and try again, or use 'Forgot your password?' to reset it."
        } else if (error.message.includes('Email not confirmed')) {
          friendlyTitle = "Email Not Confirmed"
          friendlyMessage = "Please confirm your email address before logging in. Check your inbox for the confirmation link."
        } else if (error.message.includes('User not found')) {
          friendlyTitle = "Account Not Found"
          friendlyMessage = "We couldn't find an account with this email. Please check the email or sign up for a new account."
        } else if (error.message.includes('Too many requests')) {
          friendlyTitle = "Too Many Attempts"
          friendlyMessage = "You've made too many login attempts. Please wait a few minutes and try again."
        } else if (error.message.includes('Network')) {
          friendlyTitle = "Connection Error"
          friendlyMessage = "We're having trouble connecting. Please check your internet connection and try again."
        }

        authLogger.error('Showing login error to user', { title: friendlyTitle, message: friendlyMessage })
        toast({
          title: friendlyTitle,
          description: friendlyMessage,
          variant: "destructive",
          duration: 10000, // 10 seconds for errors
        })
        setLoading(false)
        return
      }

      authLogger.info('Login successful', { email: data.user?.email })
      toast({
        title: "Welcome Back!",
        description: `Signed in as ${data.user?.email}`,
      })

      // Redirect to dashboard
      router.push('/dashboard')
    } catch (error) {
      authLogger.error('Unexpected login error', { error })
      toast({
        title: "Something Went Wrong",
        description: "We're having trouble signing you in. Please try again.",
        variant: "destructive"
      })
      setLoading(false)
    }
  }

  // ⚓ ANCHOR: FORGOT_PASSWORD_FLOW
  // REASON: Allow users to reset password if forgotten
  // PATTERN: Supabase resetPasswordForEmail sends magic link to email
  // UX: Clear instructions, email sent confirmation, link to login
  // SECURITY: Reset link expires after 1 hour, one-time use only
  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    // Validation
    if (!email) {
      toast({
        title: "Email Required",
        description: "Please enter your email address",
        variant: "destructive"
      })
      setLoading(false)
      return
    }

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      })

      if (error) {
        console.error('[Forgot Password Error]:', error)
        toast({
          title: "Unable to Send Reset Email",
          description: error.message,
          variant: "destructive"
        })
        setLoading(false)
        return
      }

      console.log('[Forgot Password] Reset email sent to:', email)
      setResetEmailSent(true)
      toast({
        title: "Reset Email Sent! 📧",
        description: `Check your inbox at ${email}. Click the link to reset your password.`,
        duration: 15000,
      })
      setLoading(false)
    } catch (error) {
      console.error('[Forgot Password Error]:', error)
      toast({
        title: "Something Went Wrong",
        description: "We couldn't send the reset email. Please try again.",
        variant: "destructive"
      })
      setLoading(false)
    }
  }

  const handleEmailSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    console.log('[Signup] Button clicked, starting signup process...')
    console.log('[Signup] Email:', email)
    console.log('[Signup] Password length:', password.length)
    console.log('[Signup] Is password valid?', isPasswordValid)
    console.log('[Signup] Passwords match?', password === confirmPassword)
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
      console.log('[Email Signup] Confirmation sent?', data.user?.email_confirmed_at === null)

      // ⚓ ANCHOR: EMAIL_CONFIRMATION_UX
      // REASON: Supabase hosted requires email confirmation by default
      // PATTERN: Check if user needs to confirm email before login
      // UX: Clear message about next steps (check email vs immediate login)
      // IMPROVEMENT: Don't switch modes, keep form visible, show clear instructions
      if (data.user?.email_confirmed_at === null) {
        // Email confirmation required
        toast({
          title: "✅ Account Created! Check Your Email 📧",
          description: `We sent a confirmation link to ${data.user?.email}. Please check your inbox and click the link to activate your account, then come back here to sign in.`,
          duration: 15000, // 15 seconds - enough time to read
        })
        console.log('[Email Signup] User needs to confirm email before login')

        // Keep signup form visible with instructions
        // User will manually switch to login after confirming
      } else {
        // Email confirmation not required (disabled in Supabase)
        toast({
          title: "Account Created! 🎉",
          description: `Welcome! You can now sign in with ${data.user?.email}`,
        })
        console.log('[Email Signup] Email confirmation not required, can login immediately')

        // Switch to login mode after successful signup
        setAuthMode('email')
        setPassword('')
        setConfirmPassword('')
      }

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

              <div className="text-center text-sm space-y-2">
                <button
                  type="button"
                  onClick={() => setAuthMode('forgot-password')}
                  className="text-primary hover:underline block w-full"
                  disabled={loading}
                >
                  Forgot your password?
                </button>
                <button
                  type="button"
                  onClick={() => setAuthMode('signup')}
                  className="text-primary hover:underline block w-full"
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

          {/* Forgot Password Mode */}
          {authMode === 'forgot-password' && (
            <form onSubmit={handleForgotPassword} className="space-y-4">
              {!resetEmailSent ? (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="reset-email">Email</Label>
                    <Input
                      id="reset-email"
                      type="email"
                      placeholder="mentor@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      disabled={loading}
                      autoComplete="email"
                    />
                    <p className="text-xs text-muted-foreground">
                      Enter your email and we'll send you a link to reset your password
                    </p>
                  </div>
                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? (
                      <span className="flex items-center gap-2">
                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-background border-t-transparent" />
                        Sending reset link...
                      </span>
                    ) : (
                      'Send Reset Link'
                    )}
                  </Button>
                </>
              ) : (
                <div className="space-y-4 text-center">
                  <div className="rounded-lg border border-green-200 bg-green-50 dark:bg-green-950 dark:border-green-800 p-4">
                    <p className="text-sm text-green-800 dark:text-green-200">
                      ✅ Reset email sent to <strong>{email}</strong>
                    </p>
                    <p className="text-xs text-green-700 dark:text-green-300 mt-2">
                      Check your inbox and click the link to reset your password. The link expires in 1 hour.
                    </p>
                  </div>
                  <Button
                    type="button"
                    onClick={() => {
                      setAuthMode('email')
                      setResetEmailSent(false)
                    }}
                    variant="outline"
                    className="w-full"
                  >
                    ← Back to Sign In
                  </Button>
                </div>
              )}

              {!resetEmailSent && (
                <Button
                  type="button"
                  onClick={() => setAuthMode('email')}
                  variant="ghost"
                  className="w-full"
                  disabled={loading}
                >
                  ← Back to Sign In
                </Button>
              )}
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
                        <span>At least 11 characters (recommended)</span>
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
                      <div className={`flex items-center gap-2 ${passwordRequirements.hasSpecial ? 'text-green-600' : 'text-muted-foreground'}`}>
                        <span>{passwordRequirements.hasSpecial ? '✓' : '○'}</span>
                        <span>One special character (!@#$%^&*...)</span>
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
