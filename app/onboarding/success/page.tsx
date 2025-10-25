import { Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function OnboardingSuccessPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md space-y-6 text-center">
        {/* Success Icon */}
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-green-600">
          <Check className="h-12 w-12 text-white" />
        </div>

        {/* Title */}
        <div className="space-y-2">
          <h1 className="text-3xl font-bold">Onboarding Complete! 🎉</h1>
          <p className="text-muted-foreground">
            Thank you for completing your profile. Your mentor has been notified and will be in touch soon.
          </p>
        </div>

        {/* Next Steps */}
        <div className="rounded-lg border bg-card p-6 text-left">
          <h2 className="mb-3 text-sm font-semibold">What happens next?</h2>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li className="flex items-start gap-2">
              <Check className="mt-0.5 h-4 w-4 shrink-0 text-green-600" />
              <span>Your mentor will review your profile</span>
            </li>
            <li className="flex items-start gap-2">
              <Check className="mt-0.5 h-4 w-4 shrink-0 text-green-600" />
              <span>You'll receive a welcome email with next steps</span>
            </li>
            <li className="flex items-start gap-2">
              <Check className="mt-0.5 h-4 w-4 shrink-0 text-green-600" />
              <span>Your first session will be scheduled within 7 days</span>
            </li>
          </ul>
        </div>

        {/* Footer */}
        <div className="text-xs text-muted-foreground">
          <p>Check your email for login credentials and access to the mentee portal.</p>
        </div>
      </div>
    </div>
  )
}
