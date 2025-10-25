import { createClient } from "@/lib/supabase/server"
import { redirect, notFound } from "next/navigation"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { SummaryTab } from "@/components/mentee-detail/summary-tab"
import { SessionsTab } from "@/components/mentee-detail/sessions-tab"
import { DeliverablesTab } from "@/components/mentee-detail/deliverables-tab"
import { ProgressTab } from "@/components/mentee-detail/progress-tab"
import { RenewalTab } from "@/components/mentee-detail/renewal-tab"
import { ChatAISidebar } from "@/components/chat-ai-sidebar"
import { differenceInDays } from "date-fns"

export default async function MenteeDetailPage({ params }: { params: { id: string } }) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  // Fetch mentee with all related data (v0.5 schema compatibility)
  const { data: mentee, error } = await supabase
    .from("mentees")
    .select(
      `
      *,
      sessions(*),
      deliverables(*),
      progress_tracking(*),
      ai_insights(*),
      mentee_companies(*)
    `,
    )
    .eq("id", params.id)
    .single()

  if (error || !mentee) {
    notFound()
  }

  // v0.5 compatibility: contract_end_date (not plan_end_date)
  const daysRemaining = differenceInDays(new Date(mentee.contract_end_date || mentee.created_at), new Date())
  const totalDeliverables = mentee.deliverables?.length || 0
  const completedDeliverables = mentee.deliverables?.filter((d: any) => d.status === "completed").length || 0
  const progressPercentage = totalDeliverables > 0 ? Math.round((completedDeliverables / totalDeliverables) * 100) : 0

  // Extract primary company info from mentee_companies
  const primaryCompany = mentee.mentee_companies?.[0]
  const company = primaryCompany?.company_legal_name || null
  const role = primaryCompany?.mentee_role || null

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8 flex items-start justify-between gap-4">
          <div className="flex items-center gap-4">
            <Avatar className="h-20 w-20">
              <AvatarImage src={undefined} alt={mentee.full_name} />
              <AvatarFallback className="bg-primary text-primary-foreground text-2xl">
                {getInitials(mentee.full_name)}
              </AvatarFallback>
            </Avatar>
            <div>
              <h1 className="text-3xl font-bold">{mentee.full_name}</h1>
              {company && <p className="text-muted-foreground">{company}</p>}
              {role && <p className="text-sm text-muted-foreground">{role}</p>}
              <div className="mt-2 flex items-center gap-3">
                <Badge variant={daysRemaining <= 30 ? "default" : "outline"}>{daysRemaining} days remaining</Badge>
                <span className="text-sm text-muted-foreground">{progressPercentage}% complete</span>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="summary" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="summary">Summary</TabsTrigger>
            <TabsTrigger value="sessions">Sessions</TabsTrigger>
            <TabsTrigger value="deliverables">Deliverables</TabsTrigger>
            <TabsTrigger value="progress">Progress</TabsTrigger>
            <TabsTrigger value="renewal">Renewal</TabsTrigger>
          </TabsList>

          <TabsContent value="summary">
            <SummaryTab mentee={mentee} progressPercentage={progressPercentage} daysRemaining={daysRemaining} />
          </TabsContent>

          <TabsContent value="sessions">
            <SessionsTab menteeId={mentee.id} sessions={mentee.sessions || []} />
          </TabsContent>

          <TabsContent value="deliverables">
            <DeliverablesTab menteeId={mentee.id} deliverables={mentee.deliverables || []} />
          </TabsContent>

          <TabsContent value="progress">
            <ProgressTab mentee={mentee} />
          </TabsContent>

          <TabsContent value="renewal">
            <RenewalTab mentee={mentee} daysRemaining={daysRemaining} />
          </TabsContent>
        </Tabs>
      </div>

      {/* Chat AI Sidebar */}
      <ChatAISidebar menteeId={mentee.id} menteeName={mentee.full_name} />
    </div>
  )
}
