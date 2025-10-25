"use client"

import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"

// ⚓ ANCHOR: RESET_PASSWORD_PAGE
// REASON: Handle password reset after user clicks email link
// PATTERN: Supabase session with recovery token → update password
// UX: Simple form with password requirements, success redirect to login
// SECURITY: Token auto-validated by Supabase, one-time use, expires 1 hour

export default function ResetPasswordPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [passwordFocused, setPasswordFocused] = useState(false)
  const supabase = createClient()

  // Password validation (same as signup)
  const passwordRequirements = {
    minLength: password.length >= 11,
    hasUppercase: /[A-Z]/.test(password),
    hasLowercase: /[a-z]/.test(password),
    hasNumber: /[0-9]/.test(password),
    hasSpecial: /[!@#$%^&*(),.?":{}|<>]/.test(password),
  }

  const isPasswordValid = Object.values(passwordRequirements).every(Boolean)

  useEffect(() => {
    // Check if user has valid recovery session
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        toast({
          title: "Invalid or Expired Link",
          description: "The password reset link is invalid or has expired. Please request a new one.",
          variant: "destructive"
        })
        router.push('/login')
      }
    }
    checkSession()
  }, [supabase, router, toast])

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    // Validation
    if (!password || !confirmPassword) {
      toast({
        title: "Missing Information",
        description: "Please fill in both password fields",
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
      const { error } = await supabase.auth.updateUser({
        password: password
      })

      if (error) {
        console.error('[Reset Password Error]:', error)
        toast({
          title: "Unable to Reset Password",
          description: error.message,
          variant: "destructive"
        })
        setLoading(false)
        return
      }

      console.log('[Reset Password] Password updated successfully')
      toast({
        title: "Password Reset Successful! 🎉",
        description: "Your password has been updated. You can now sign in with your new password.",
      })

      // Redirect to login after 2 seconds
      setTimeout(() => {
        router.push('/login')
      }, 2000)
    } catch (error) {
      console.error('[Reset Password Error]:', error)
      toast({
        title: "Something Went Wrong",
        description: "We couldn't reset your password. Please try again.",
        variant: "destructive"
      })
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold">Reset Password</CardTitle>
          <CardDescription className="text-lg">Enter your new password</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleResetPassword} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="new-password">New Password</Label>
              <div className="relative">
                <Input
                  id="new-password"
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

              {/* Password Requirements */}
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
              <Label htmlFor="confirm-new-password">Confirm New Password</Label>
              <div className="relative">
                <Input
                  id="confirm-new-password"
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
                  Resetting password...
                </span>
              ) : (
                'Reset Password'
              )}
            </Button>

            <div className="text-center text-sm">
              <button
                type="button"
                onClick={() => router.push('/login')}
                className="text-primary hover:underline"
                disabled={loading}
              >
                ← Back to Sign In
              </button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
