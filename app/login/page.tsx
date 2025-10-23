"use client"

import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useTranslations } from "next-intl"
import { useState, useEffect } from "react"

export default function LoginPage() {
  const t = useTranslations("auth")
  const [loading, setLoading] = useState(false)
  const [redirectUrl, setRedirectUrl] = useState("")
  const supabase = createClient()

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

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold text-balance">{t("welcome")}</CardTitle>
          <CardDescription className="text-lg text-balance">{t("tagline")}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
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
        </CardContent>
      </Card>
    </div>
  )
}
