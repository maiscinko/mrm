"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { createClient } from "@/lib/supabase/client"
import { createMenteeSchema, type CreateMenteeInput } from "@/lib/validations/mentee"
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
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { addMonths, format } from "date-fns"

interface AddMenteeDialogProps {
  children: React.ReactNode
}

export function AddMenteeDialog({ children }: AddMenteeDialogProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const { toast } = useToast()
  const supabase = createClient()

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<CreateMenteeInput>({
    resolver: zodResolver(createMenteeSchema),
    defaultValues: {
      plan_duration_months: 6,
      plan_start_date: new Date(),
    },
  })

  const onSubmit = async (data: CreateMenteeInput) => {
    setLoading(true)
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) throw new Error("Not authenticated")

      const planEndDate = addMonths(data.plan_start_date, data.plan_duration_months)

      const { error } = await supabase.from("mentees").insert({
        mentor_id: user.id,
        full_name: data.full_name,
        company: data.company,
        stated_goal: data.stated_goal,
        plan_duration_months: data.plan_duration_months,
        plan_start_date: format(data.plan_start_date, "yyyy-MM-dd"),
        plan_end_date: format(planEndDate, "yyyy-MM-dd"),
        status: "active",
      })

      if (error) throw error

      toast({
        title: "Success",
        description: "Mentee added successfully",
      })

      reset()
      setOpen(false)
      router.refresh()
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to add mentee",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Add New Mentee</DialogTitle>
          <DialogDescription>Create a new mentee profile to start tracking their progress.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="full_name">Full Name *</Label>
            <Input id="full_name" {...register("full_name")} placeholder="John Doe" />
            {errors.full_name && <p className="text-sm text-destructive">{errors.full_name.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="company">Company</Label>
            <Input id="company" {...register("company")} placeholder="Acme Inc." />
          </div>

          <div className="space-y-2">
            <Label htmlFor="stated_goal">Goal *</Label>
            <Textarea
              id="stated_goal"
              {...register("stated_goal")}
              placeholder="What does the mentee want to achieve?"
              rows={3}
            />
            {errors.stated_goal && <p className="text-sm text-destructive">{errors.stated_goal.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="plan_duration_months">Duration (months) *</Label>
              <Input
                id="plan_duration_months"
                type="number"
                {...register("plan_duration_months", { valueAsNumber: true })}
                min={1}
                max={24}
              />
              {errors.plan_duration_months && (
                <p className="text-sm text-destructive">{errors.plan_duration_months.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="plan_start_date">Start Date *</Label>
              <Input
                id="plan_start_date"
                type="date"
                {...register("plan_start_date", { valueAsDate: true })}
                defaultValue={format(new Date(), "yyyy-MM-dd")}
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Adding..." : "Add Mentee"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
