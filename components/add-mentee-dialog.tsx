"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { createMenteeSchema, type CreateMenteeInput } from "@/lib/validations/mentee"
import { createMenteeWithOnboarding } from "@/lib/actions/mentee"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { format } from "date-fns"
import { OnboardingSuccessDialog } from "./onboarding-success-dialog"

interface AddMenteeDialogProps {
  children: React.ReactNode
}

// ⚓ ANCHOR: ADD MENTEE DIALOG (v0.5)
// REASON: Mentor creates mentee with contract details → generates onboarding link
// PATTERN: Multi-step form (personal → contract → payment) → server action → success dialog
// UX: Auto-calculate end date, payment installments preview, clear validation
export function AddMenteeDialog({ children }: AddMenteeDialogProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [successDialog, setSuccessDialog] = useState(false)
  const [onboardingData, setOnboardingData] = useState<{
    link: string
    name: string
    email: string
    whatsapp: string
  } | null>(null)
  const router = useRouter()
  const { toast } = useToast()

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
    setValue,
  } = useForm<CreateMenteeInput>({
    resolver: zodResolver(createMenteeSchema),
    defaultValues: {
      contract_duration_months: 6,
      contract_start_date: format(new Date(), "yyyy-MM-dd"),
      payment_model: "monthly",
      entry_payment_received: false,
    },
  })

  // Watch for payment model changes
  const paymentModel = watch("payment_model")
  const contractDuration = watch("contract_duration_months")
  const monthlyPayment = watch("payment_amount_monthly")

  const onSubmit = async (data: CreateMenteeInput) => {
    setLoading(true)
    try {
      const result = await createMenteeWithOnboarding(data)

      if (result.error) {
        toast({
          title: "Error creating mentee",
          description: result.error,
          variant: "destructive",
          duration: 10000,
        })
        setLoading(false)
        return
      }

      if (result.success && result.onboardingLink) {
        // Show success dialog with onboarding link
        setOnboardingData({
          link: result.onboardingLink,
          name: data.full_name,
          email: data.email,
          whatsapp: data.whatsapp,
        })
        setSuccessDialog(true)
        setOpen(false)
        reset()
        router.refresh()

        toast({
          title: "Mentee created successfully!",
          description: "Share the onboarding link to complete the setup",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create mentee",
        variant: "destructive",
        duration: 10000,
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>{children}</DialogTrigger>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Add New Mentee</DialogTitle>
            <DialogDescription>
              Create a mentee profile with contract details. They'll receive an onboarding link to complete their
              profile.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Personal Info Section */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold">Personal Information</h3>
              <div className="space-y-2">
                <Label htmlFor="full_name">Full Name *</Label>
                <Input id="full_name" {...register("full_name")} placeholder="João da Silva" />
                {errors.full_name && <p className="text-sm text-destructive">{errors.full_name.message}</p>}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email *</Label>
                  <Input id="email" type="email" {...register("email")} placeholder="joao@empresa.com.br" />
                  {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="whatsapp">WhatsApp *</Label>
                  <Input id="whatsapp" {...register("whatsapp")} placeholder="+5511999999999" />
                  {errors.whatsapp && <p className="text-sm text-destructive">{errors.whatsapp.message}</p>}
                </div>
              </div>
            </div>

            {/* Contract Section */}
            <div className="space-y-4 border-t pt-4">
              <h3 className="text-sm font-semibold">Contract Details</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="contract_start_date">Start Date *</Label>
                  <Input
                    id="contract_start_date"
                    type="date"
                    {...register("contract_start_date")}
                    defaultValue={format(new Date(), "yyyy-MM-dd")}
                  />
                  {errors.contract_start_date && (
                    <p className="text-sm text-destructive">{errors.contract_start_date.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="contract_duration_months">Duration (months) *</Label>
                  <Input
                    id="contract_duration_months"
                    type="number"
                    {...register("contract_duration_months", { valueAsNumber: true })}
                    min={1}
                    max={48}
                    placeholder="6"
                  />
                  {errors.contract_duration_months && (
                    <p className="text-sm text-destructive">{errors.contract_duration_months.message}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="contract_value_total">Total Contract Value (R$)</Label>
                  <Input
                    id="contract_value_total"
                    type="number"
                    step="0.01"
                    {...register("contract_value_total", { valueAsNumber: true })}
                    placeholder="5000.00"
                  />
                  {errors.contract_value_total && (
                    <p className="text-sm text-destructive">{errors.contract_value_total.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="payment_model">Payment Model</Label>
                  <Select
                    defaultValue="monthly"
                    onValueChange={(value) => setValue("payment_model", value as any)}
                  >
                    <SelectTrigger id="payment_model">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="monthly">Monthly</SelectItem>
                      <SelectItem value="quarterly">Quarterly</SelectItem>
                      <SelectItem value="upfront">Upfront</SelectItem>
                      <SelectItem value="custom">Custom</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Payment Section */}
            <div className="space-y-4 border-t pt-4">
              <h3 className="text-sm font-semibold">Payment Details</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="entry_payment_amount">Entry Payment (R$)</Label>
                  <Input
                    id="entry_payment_amount"
                    type="number"
                    step="0.01"
                    {...register("entry_payment_amount", { valueAsNumber: true })}
                    placeholder="500.00"
                  />
                  {errors.entry_payment_amount && (
                    <p className="text-sm text-destructive">{errors.entry_payment_amount.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="payment_amount_monthly">
                    {paymentModel === "quarterly" ? "Quarterly" : "Monthly"} Payment (R$)
                  </Label>
                  <Input
                    id="payment_amount_monthly"
                    type="number"
                    step="0.01"
                    {...register("payment_amount_monthly", { valueAsNumber: true })}
                    placeholder="833.33"
                  />
                  {errors.payment_amount_monthly && (
                    <p className="text-sm text-destructive">{errors.payment_amount_monthly.message}</p>
                  )}
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="entry_payment_received"
                  checked={watch("entry_payment_received")}
                  onCheckedChange={(checked) => setValue("entry_payment_received", checked as boolean)}
                />
                <Label htmlFor="entry_payment_received" className="cursor-pointer text-sm font-normal">
                  Entry payment already received
                </Label>
              </div>

              {/* Payment Preview */}
              {monthlyPayment && monthlyPayment > 0 && (
                <div className="rounded-lg bg-muted p-3 text-xs text-muted-foreground">
                  <p className="font-medium">Payment Preview:</p>
                  <p>
                    {paymentModel === "quarterly"
                      ? `${Math.ceil(contractDuration / 3)} quarterly installments`
                      : `${contractDuration} monthly installments`}{" "}
                    of R$ {monthlyPayment.toFixed(2)}
                  </p>
                </div>
              )}
            </div>

            <div className="flex justify-end gap-3 border-t pt-4">
              <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={loading}>
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? "Creating..." : "Create & Generate Link"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Success Dialog with Onboarding Link */}
      {onboardingData && (
        <OnboardingSuccessDialog
          open={successDialog}
          onOpenChange={setSuccessDialog}
          onboardingLink={onboardingData.link}
          menteeName={onboardingData.name}
          menteeEmail={onboardingData.email}
          menteeWhatsapp={onboardingData.whatsapp}
        />
      )}
    </>
  )
}
