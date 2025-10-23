"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Sparkles, AlertTriangle, CheckCircle2 } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { toast } from "sonner"
import type { Database } from "@/lib/supabase/database.types"

type Mentee = Database["public"]["Tables"]["mentees"]["Row"] & {
  deliverables?: Database["public"]["Tables"]["deliverables"]["Row"][]
  sessions?: Database["public"]["Tables"]["sessions"]["Row"][]
}

interface RenewalTabProps {
  mentee: Mentee
  daysRemaining: number
}

export function RenewalTab({ mentee, daysRemaining }: RenewalTabProps) {
  const [isGenerating, setIsGenerating] = useState(false)
  const [renewalPlan, setRenewalPlan] = useState<string | null>(null)
  const supabase = createClient()

  const generateRenewalPlan = async () => {
    setIsGenerating(true)
    try {
      const response = await fetch("/api/ai/renewal-plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ menteeId: mentee.id }),
      })

      if (!response.ok) throw new Error("Failed to generate renewal plan")

      const data = await response.json()
      setRenewalPlan(data.proposal)
      toast.success("Renewal plan generated successfully")
    } catch (error) {
      console.error("[v0] Error generating renewal plan:", error)
      toast.error("Failed to generate renewal plan")
    } finally {
      setIsGenerating(false)
    }
  }

  const getAlertVariant = () => {
    if (daysRemaining <= 7) return "destructive"
    if (daysRemaining <= 30) return "default"
    return "default"
  }

  const totalDeliverables = mentee.deliverables?.length || 0
  const completedDeliverables = mentee.deliverables?.filter((d) => d.status === "completed").length || 0
  const progressPercentage = totalDeliverables > 0 ? Math.round((completedDeliverables / totalDeliverables) * 100) : 0

  return (
    <div className="space-y-6">
      {/* Renewal Alert */}
      {daysRemaining <= 30 && (
        <Alert variant={getAlertVariant()}>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            {daysRemaining <= 7 ? (
              <strong>Urgent: Only {daysRemaining} days remaining in the current mentoring plan!</strong>
            ) : (
              <strong>Renewal approaching: {daysRemaining} days remaining in the current plan</strong>
            )}
          </AlertDescription>
        </Alert>
      )}

      {/* Current Plan Status */}
      <Card>
        <CardHeader>
          <CardTitle>Current Plan Status</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Plan Duration</p>
              <p className="text-2xl font-bold">{mentee.plan_duration_months} months</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Days Remaining</p>
              <p className="text-2xl font-bold">{daysRemaining}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Overall Progress</p>
              <p className="text-2xl font-bold">{progressPercentage}%</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Sessions Completed</p>
              <p className="text-2xl font-bold">{mentee.sessions?.length || 0}</p>
            </div>
          </div>

          <div className="pt-4 border-t">
            <p className="text-sm text-muted-foreground mb-2">Stated Goal</p>
            <p className="text-foreground">{mentee.stated_goal}</p>
          </div>

          {mentee.observed_pain && (
            <div className="pt-4 border-t">
              <p className="text-sm text-muted-foreground mb-2">Observed Pain (AI Analysis)</p>
              <p className="text-foreground">{mentee.observed_pain}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* AI Renewal Plan */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            AI-Generated Renewal Plan
          </CardTitle>
          <p className="text-sm text-muted-foreground">Let AI analyze progress and suggest a plan for the next phase</p>
        </CardHeader>
        <CardContent className="space-y-4">
          {!renewalPlan ? (
            <div className="text-center py-8">
              <Button onClick={generateRenewalPlan} disabled={isGenerating} size="lg">
                <Sparkles className="mr-2 h-4 w-4" />
                {isGenerating ? "Generating..." : "Generate Renewal Plan"}
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="prose prose-sm dark:prose-invert max-w-none">
                <div className="whitespace-pre-wrap">{renewalPlan}</div>
              </div>
              <div className="flex gap-2">
                <Button onClick={generateRenewalPlan} variant="outline" disabled={isGenerating}>
                  Regenerate
                </Button>
                <Button
                  onClick={() => {
                    navigator.clipboard.writeText(renewalPlan)
                    toast.success("Copied to clipboard")
                  }}
                >
                  Copy Proposal
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Gaps Identified */}
      <Card>
        <CardHeader>
          <CardTitle>Gaps Identified</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            {totalDeliverables > 0 && completedDeliverables < totalDeliverables && (
              <li className="flex items-start gap-2">
                <AlertTriangle className="h-5 w-5 text-yellow-500 mt-0.5" />
                <span>{totalDeliverables - completedDeliverables} deliverable(s) not yet completed</span>
              </li>
            )}
            {mentee.sessions && mentee.sessions.length < 4 && (
              <li className="flex items-start gap-2">
                <AlertTriangle className="h-5 w-5 text-yellow-500 mt-0.5" />
                <span>Limited session history - consider more frequent check-ins</span>
              </li>
            )}
            {progressPercentage === 100 && (
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5" />
                <span>All deliverables completed - ready for next phase!</span>
              </li>
            )}
          </ul>
        </CardContent>
      </Card>
    </div>
  )
}
