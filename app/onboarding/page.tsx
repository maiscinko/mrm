import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { OnboardingWizard } from "@/components/onboarding-wizard"

export default async function OnboardingPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  // Check if mentor already completed onboarding
  const { data: profile } = await supabase
    .from("mentor_profiles")
    .select("id")
    .eq("user_id", user.id)
    .single()

  if (profile) {
    // Already onboarded, redirect to dashboard
    redirect("/dashboard")
  }

  // ⚓ ANCHOR: PRE_FILL_USER_EMAIL
  // REASON: Better UX - don't ask for email again if user just logged in
  // PATTERN: Pass logged user email to wizard, pre-fill form
  // UX: User can edit if they want different email (e.g., business vs personal)
  return <OnboardingWizard userEmail={user.email || ""} />
}
