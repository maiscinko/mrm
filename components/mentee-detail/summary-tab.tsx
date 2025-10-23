import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import type { Database } from "@/lib/supabase/database.types"

type Mentee = Database["public"]["Tables"]["mentees"]["Row"]

interface SummaryTabProps {
  mentee: Mentee
  progressPercentage: number
  daysRemaining: number
}

export function SummaryTab({ mentee, progressPercentage, daysRemaining }: SummaryTabProps) {
  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Stated Goal</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground leading-relaxed">{mentee.stated_goal || "No goal stated yet."}</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Observed Pain (AI)</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground leading-relaxed">
            {mentee.observed_pain || "AI will analyze sessions to identify pain points."}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Progress Overview</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Overall Progress</span>
              <span className="font-medium">{progressPercentage}%</span>
            </div>
            <Progress value={progressPercentage} className="h-3" />
          </div>
          <div className="grid grid-cols-2 gap-4 pt-2">
            <div>
              <p className="text-sm text-muted-foreground">Days Remaining</p>
              <p className="text-2xl font-bold">{daysRemaining}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Baseline Clarity</p>
              <p className="text-2xl font-bold">{mentee.baseline_clarity_score || "N/A"}/10</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Plan Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div>
            <p className="text-sm text-muted-foreground">Duration</p>
            <p className="font-medium">{mentee.plan_duration_months} months</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Start Date</p>
            <p className="font-medium">{new Date(mentee.plan_start_date).toLocaleDateString()}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">End Date</p>
            <p className="font-medium">{new Date(mentee.plan_end_date).toLocaleDateString()}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Status</p>
            <p className="font-medium capitalize">{mentee.status}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
