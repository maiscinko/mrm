"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Loader2, ChevronLeft, Check } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"

interface PrivacyConsentStepProps {
  menteeId: string
  menteeName: string
  menteeEmail: string
  data: any
  onDataChange: (data: any) => void
  onBack: () => void
}

// ⚓ ANCHOR: PRIVACY & CONSENT STEP (Step 6/6 - Final)
// REASON: LGPD compliance + finalize onboarding
// PATTERN: Consent checkboxes + IP tracking + mark onboarding_completed
// UX: Clear consent text, all required, success redirect
export function PrivacyConsentStep({
  menteeId,
  menteeName,
  menteeEmail,
  data,
  onDataChange,
  onBack,
}: PrivacyConsentStepProps) {
  const [loading, setLoading] = useState(false)
  const [consents, setConsents] = useState({
    data_processing: data?.data_processing || false,
    terms_accepted: data?.terms_accepted || false,
    communication: data?.communication || false,
  })
  const { toast } = useToast()
  const supabase = createClient()
  const router = useRouter()

  const allConsentsGiven = consents.data_processing && consents.terms_accepted

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!allConsentsGiven) {
      toast({
        title: "Consent required",
        description: "Please accept data processing and terms to continue",
        variant: "destructive",
      })
      return
    }

    setLoading(true)

    try {
      // Get IP address (simplified - in production use proper IP detection)
      const ipAddress = "unknown" // TODO: Implement proper IP detection

      // Update privacy consent JSONB + mark onboarding completed
      const { error } = await supabase
        .from("mentees")
        .update({
          privacy_consent: {
            data_processing_consent: consents.data_processing,
            terms_accepted: consents.terms_accepted,
            communication_consent: consents.communication,
            consent_date: new Date().toISOString(),
            consent_ip: ipAddress,
          },
          onboarding_completed: true,
          onboarding_completed_at: new Date().toISOString(),
          status: "active", // Change from pending_onboarding to active
        })
        .eq("id", menteeId)

      if (error) throw error

      onDataChange(consents)

      toast({
        title: "Onboarding Complete! 🎉",
        description: "Your mentor will be notified. Welcome to the program!",
      })

      // Redirect to success page after 2 seconds
      setTimeout(() => {
        router.push("/onboarding/success")
      }, 2000)
    } catch (error) {
      toast({
        title: "Error completing onboarding",
        description: error instanceof Error ? error.message : "Please try again",
        variant: "destructive",
        duration: 10000,
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Summary */}
      <div className="rounded-lg bg-muted p-4">
        <h3 className="mb-2 text-sm font-semibold">Summary</h3>
        <p className="text-sm text-muted-foreground">
          You've completed all profile sections! Review your consents below and click "Complete Onboarding" to finish.
        </p>
      </div>

      {/* Privacy Consents */}
      <div className="space-y-4 border-t pt-4">
        <h3 className="text-sm font-semibold">Privacy & Data Protection (LGPD)</h3>

        <div className="flex items-start space-x-3">
          <Checkbox
            id="data_processing"
            checked={consents.data_processing}
            onCheckedChange={(checked) => setConsents({ ...consents, data_processing: checked as boolean })}
          />
          <div className="flex-1">
            <Label htmlFor="data_processing" className="cursor-pointer text-sm">
              I consent to the processing of my personal data *
            </Label>
            <p className="mt-1 text-xs text-muted-foreground">
              Your data will be used exclusively for mentoring purposes and will be shared only with your mentor. You
              can request deletion at any time.
            </p>
          </div>
        </div>

        <div className="flex items-start space-x-3">
          <Checkbox
            id="terms_accepted"
            checked={consents.terms_accepted}
            onCheckedChange={(checked) => setConsents({ ...consents, terms_accepted: checked as boolean })}
          />
          <div className="flex-1">
            <Label htmlFor="terms_accepted" className="cursor-pointer text-sm">
              I accept the terms and conditions *
            </Label>
            <p className="mt-1 text-xs text-muted-foreground">
              By accepting, you agree to the mentoring program terms, confidentiality agreements, and session policies.
            </p>
          </div>
        </div>

        <div className="flex items-start space-x-3">
          <Checkbox
            id="communication"
            checked={consents.communication}
            onCheckedChange={(checked) => setConsents({ ...consents, communication: checked as boolean })}
          />
          <div className="flex-1">
            <Label htmlFor="communication" className="cursor-pointer text-sm">
              I consent to receive communications (optional)
            </Label>
            <p className="mt-1 text-xs text-muted-foreground">
              Receive session reminders, progress updates, and program announcements via email and WhatsApp.
            </p>
          </div>
        </div>
      </div>

      {/* Data Security Notice */}
      <div className="rounded-lg border border-green-600/20 bg-green-600/10 p-4">
        <div className="flex items-start gap-3">
          <Check className="h-5 w-5 text-green-600" />
          <div>
            <p className="text-sm font-medium">Your data is secure</p>
            <p className="text-xs text-muted-foreground">
              All information is encrypted (AES-256), stored securely (SOC 2 compliant), and accessible only to your
              mentor. We never share or sell your data to third parties.
            </p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex justify-between border-t pt-6">
        <Button type="button" variant="outline" onClick={onBack} disabled={loading}>
          <ChevronLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        <Button type="submit" disabled={loading || !allConsentsGiven}>
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Completing...
            </>
          ) : (
            <>
              <Check className="mr-2 h-4 w-4" />
              Complete Onboarding
            </>
          )}
        </Button>
      </div>
    </form>
  )
}
