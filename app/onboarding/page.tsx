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

  return <OnboardingWizard />
}
