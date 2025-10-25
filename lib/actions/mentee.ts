"use server"

import { createClient } from "@/lib/supabase/server"
import { addMonths, format } from "date-fns"
import type { CreateMenteeInput } from "@/lib/validations/mentee"
import { apiLogger } from "@/lib/logger"

// ⚓ ANCHOR: CREATE MENTEE WITH ONBOARDING
// REASON: v0.5 mentee onboarding - mentor creates mentee → auto-generate token + payments
// PATTERN: Server action (secure, server-side only) - generates UUID token + creates payment records
// UX: Returns onboarding link immediately after creation for mentor to share
export async function createMenteeWithOnboarding(data: CreateMenteeInput) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: "Not authenticated" }
  }

  try {
    // Calculate contract end date
    const contractStartDate = new Date(data.contract_start_date)
    const contractEndDate = addMonths(contractStartDate, data.contract_duration_months)

    // Generate onboarding token (UUID)
    const onboardingToken = crypto.randomUUID()

    // Onboarding link expires in 30 days
    const onboardingLinkExpiresAt = new Date()
    onboardingLinkExpiresAt.setDate(onboardingLinkExpiresAt.getDate() + 30)

    // ⚓ ANCHOR: INSERT MENTEE
    // STATUS: pending_onboarding (mentor created, mentee hasn't filled onboarding form yet)
    const { data: mentee, error: menteeError } = await supabase
      .from("mentees")
      .insert({
        mentor_id: user.id,
        full_name: data.full_name,
        email: data.email,
        whatsapp: data.whatsapp,
        contract_start_date: format(contractStartDate, "yyyy-MM-dd"),
        contract_end_date: format(contractEndDate, "yyyy-MM-dd"),
        contract_duration_months: data.contract_duration_months,
        contract_value_total: data.contract_value_total || null,
        payment_model: data.payment_model,
        payment_amount_monthly: data.payment_amount_monthly || null,
        onboarding_token: onboardingToken,
        onboarding_link_expires_at: onboardingLinkExpiresAt.toISOString(),
        status: "pending_onboarding",
      })
      .select("id, onboarding_token")
      .single()

    if (menteeError || !mentee) {
      apiLogger.error("Error creating mentee", {
        error: menteeError?.message,
        email: data.email,
      })
      return { error: menteeError?.message || "Failed to create mentee" }
    }

    apiLogger.info("Mentee created successfully", {
      menteeId: mentee.id,
      email: data.email,
      contractDuration: data.contract_duration_months,
    })

    // ⚓ ANCHOR: AUTO-CREATE PAYMENTS
    // REASON: Mentor defines payment model → system auto-generates payment records
    // PATTERN: Entry payment (if exists) + monthly/quarterly installments
    const payments: Array<{
      mentee_id: string
      payment_type: string
      payment_amount: number
      payment_due_date: string
      payment_paid: boolean
      payment_paid_date: string | null
    }> = []

    // Entry payment (if exists)
    if (data.entry_payment_amount && data.entry_payment_amount > 0) {
      payments.push({
        mentee_id: mentee.id,
        payment_type: "entry",
        payment_amount: data.entry_payment_amount,
        payment_due_date: format(contractStartDate, "yyyy-MM-dd"),
        payment_paid: data.entry_payment_received || false,
        payment_paid_date: data.entry_payment_received ? format(new Date(), "yyyy-MM-dd") : null,
      })
    }

    // Monthly/Quarterly installments
    if (data.payment_amount_monthly && data.payment_amount_monthly > 0) {
      const installmentInterval = data.payment_model === "quarterly" ? 3 : 1 // monthly = 1, quarterly = 3
      const numberOfInstallments = Math.ceil(data.contract_duration_months / installmentInterval)

      for (let i = 0; i < numberOfInstallments; i++) {
        const dueDate = addMonths(contractStartDate, i * installmentInterval)
        payments.push({
          mentee_id: mentee.id,
          payment_type: data.payment_model === "quarterly" ? "quarterly" : "monthly",
          payment_amount: data.payment_amount_monthly,
          payment_due_date: format(dueDate, "yyyy-MM-dd"),
          payment_paid: false,
          payment_paid_date: null,
        })
      }
    }

    // Insert payments if any
    if (payments.length > 0) {
      const { error: paymentsError } = await supabase.from("mentee_payments").insert(payments)

      if (paymentsError) {
        apiLogger.error("Error creating payments (mentee created successfully)", {
          menteeId: mentee.id,
          error: paymentsError.message,
          paymentsCount: payments.length,
        })
        // Don't fail the whole operation - mentee is already created
        // Mentor can manually add payments later
      } else {
        apiLogger.info("Payments created successfully", {
          menteeId: mentee.id,
          paymentsCount: payments.length,
        })
      }
    }

    // Return success with onboarding token
    return {
      success: true,
      menteeId: mentee.id,
      onboardingToken: mentee.onboarding_token,
      onboardingLink: `${process.env.NEXT_PUBLIC_APP_URL || "https://mrm.a25.com.br"}/onboarding/${mentee.onboarding_token}`,
    }
  } catch (error) {
    apiLogger.error("Unexpected error creating mentee", {
      error: error instanceof Error ? error.message : String(error),
      email: data.email,
    })
    return { error: "An unexpected error occurred" }
  }
}
