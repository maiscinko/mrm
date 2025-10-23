"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { createSessionSchema, type CreateSessionInput } from "@/lib/validations/session"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Sparkles, X } from "lucide-react"

interface SessionFormProps {
  menteeId: string
  onClose: () => void
}

export function SessionForm({ menteeId, onClose }: SessionFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [isGeneratingAI, setIsGeneratingAI] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<CreateSessionInput>({
    resolver: zodResolver(createSessionSchema),
    defaultValues: {
      session_date: new Date().toISOString().split("T")[0],
    },
  })

  const emotionTag = watch("emotion_tag")
  const resultTag = watch("result_tag")

  const onSubmit = async (data: CreateSessionInput) => {
    setIsLoading(true)
    try {
      // Insert session
      const { data: session, error } = await supabase
        .from("sessions")
        .insert({
          mentee_id: menteeId,
          ...data,
        })
        .select()
        .single()

      if (error) throw error

      toast.success("Session added successfully")

      // Generate AI summary in background
      if (session) {
        setIsGeneratingAI(true)
        try {
          const response = await fetch("/api/ai/session-summary", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ menteeId }),
          })

          if (response.ok) {
            const { summary } = await response.json()

            // Update session with AI summary
            await supabase.from("sessions").update({ ai_summary: summary }).eq("id", session.id)

            toast.success("AI summary generated")
          }
        } catch (aiError) {
          console.error("[v0] Error generating AI summary:", aiError)
          // Don't show error to user - AI summary is optional
        } finally {
          setIsGeneratingAI(false)
        }
      }

      onClose()
      router.refresh()
    } catch (error) {
      console.error("[v0] Error creating session:", error)
      toast.error("Failed to add session")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="border-primary">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Add New Session</CardTitle>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="session_date">Session Date *</Label>
              <Input id="session_date" type="date" {...register("session_date")} />
              {errors.session_date && <p className="text-sm text-destructive">{errors.session_date.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="theme">Theme</Label>
              <Input id="theme" {...register("theme")} placeholder="e.g., Strategic Planning" />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Session Notes</Label>
            <Textarea
              id="notes"
              {...register("notes")}
              placeholder="Key discussion points, insights, challenges discussed..."
              rows={6}
            />
            <p className="text-xs text-muted-foreground">
              These notes will be used by AI to generate insights and suggestions
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="next_steps">Next Steps</Label>
            <Textarea
              id="next_steps"
              {...register("next_steps")}
              placeholder="Action items, deliverables, what to focus on next..."
              rows={4}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="emotion_tag">Emotion Tag</Label>
              <Select value={emotionTag} onValueChange={(value) => setValue("emotion_tag", value as any)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select emotion..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="frustrated">Frustrated</SelectItem>
                  <SelectItem value="hopeful">Hopeful</SelectItem>
                  <SelectItem value="confused">Confused</SelectItem>
                  <SelectItem value="excited">Excited</SelectItem>
                  <SelectItem value="stuck">Stuck</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="result_tag">Result Tag</Label>
              <Select value={resultTag} onValueChange={(value) => setValue("result_tag", value as any)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select result..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="breakthrough">Breakthrough</SelectItem>
                  <SelectItem value="incremental">Incremental</SelectItem>
                  <SelectItem value="stuck">Stuck</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose} disabled={isLoading || isGeneratingAI}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading || isGeneratingAI}>
              {isLoading ? (
                "Saving..."
              ) : isGeneratingAI ? (
                <>
                  <Sparkles className="mr-2 h-4 w-4 animate-pulse" />
                  Generating AI Summary...
                </>
              ) : (
                "Save & Generate AI Insights"
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
