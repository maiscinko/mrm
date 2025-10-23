"use client"

import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useRouter } from "next/navigation"
import { useTranslations } from "next-intl"
import { differenceInDays } from "date-fns"
import type { Database } from "@/lib/supabase/database.types"

type Mentee = Database["public"]["Tables"]["mentees"]["Row"] & {
  deliverables?: Array<{ id: string; status: string }>
}

interface MenteeCardProps {
  mentee: Mentee
}

export function MenteeCard({ mentee }: MenteeCardProps) {
  const router = useRouter()
  const t = useTranslations("dashboard")

  // Calculate progress percentage from deliverables
  const totalDeliverables = mentee.deliverables?.length || 0
  const completedDeliverables = mentee.deliverables?.filter((d) => d.status === "completed").length || 0
  const progressPercentage = totalDeliverables > 0 ? (completedDeliverables / totalDeliverables) * 100 : 0

  // Calculate days remaining
  const daysRemaining = differenceInDays(new Date(mentee.plan_end_date), new Date())

  // Determine status badge color
  const getStatusColor = () => {
    if (mentee.status === "completed" || mentee.status === "cancelled") return "secondary"
    if (daysRemaining <= 7) return "destructive"
    if (daysRemaining <= 30) return "default"
    return "outline"
  }

  // Get initials for avatar fallback
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  return (
    <Card
      className="cursor-pointer transition-all hover:shadow-lg hover:border-primary/50"
      onClick={() => router.push(`/mentee/${mentee.id}`)}
    >
      <CardHeader className="flex flex-row items-center gap-4 pb-3">
        <Avatar className="h-12 w-12">
          <AvatarImage src={mentee.photo_url || undefined} alt={mentee.full_name} />
          <AvatarFallback className="bg-primary text-primary-foreground">
            {getInitials(mentee.full_name)}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-lg truncate">{mentee.full_name}</h3>
          {mentee.company && <p className="text-sm text-muted-foreground truncate">{mentee.company}</p>}
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="space-y-1">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Progress</span>
            <span className="font-medium">{Math.round(progressPercentage)}%</span>
          </div>
          <Progress value={progressPercentage} className="h-2" />
        </div>

        <div className="flex items-center justify-between">
          <Badge variant={getStatusColor()}>
            {daysRemaining > 0 ? `${daysRemaining} ${t("daysRemaining")}` : t(mentee.status)}
          </Badge>
          <span className="text-xs text-muted-foreground">
            {completedDeliverables}/{totalDeliverables} deliverables
          </span>
        </div>
      </CardContent>
    </Card>
  )
}
