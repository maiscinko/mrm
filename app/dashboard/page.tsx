import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { AddMenteeDialog } from "@/components/add-mentee-dialog"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { getTranslations } from "next-intl/server"
import { DashboardContent } from "@/components/dashboard-content"

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: { page?: string; search?: string; show_all?: string; sort?: string; status?: string }
}) {
  const supabase = await createClient()
  const t = await getTranslations("dashboard")

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  // Check if mentor has completed onboarding
  const { data: profile } = await supabase
    .from("mentor_profiles")
    .select("id")
    .eq("user_id", user.id)
    .single()

  if (!profile) {
    // First time user, redirect to onboarding
    redirect("/onboarding")
  }

  const page = Number(searchParams.page) || 1
  const search = searchParams.search || ""
  const showAll = searchParams.show_all === "true"
  const sort = searchParams.sort || "plan_end_date"
  const statusFilter = searchParams.status || "all"
  const itemsPerPage = 20

  let query = supabase.from("mentees").select(
    `
      *,
      deliverables(id, status)
    `,
    { count: "exact" },
  )

  // Apply search filter
  if (search) {
    query = query.ilike("full_name", `%${search}%`)
  }

  // Apply status filter
  if (statusFilter !== "all") {
    query = query.eq("status", statusFilter)
  }

  // Apply sorting
  const sortColumn = sort === "name" ? "full_name" : sort === "recent" ? "updated_at" : "plan_end_date"
  const ascending = sort === "name"
  query = query.order(sortColumn, { ascending })

  // Apply pagination (unless show_all is true)
  if (!showAll) {
    const start = (page - 1) * itemsPerPage
    const end = start + itemsPerPage - 1
    query = query.range(start, end)
  }

  const { data: mentees, count } = await query

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">{t("title")}</h1>
            <p className="text-muted-foreground">
              {t("welcome")}, {user.email}
            </p>
          </div>
          <AddMenteeDialog>
            <Button size="lg">
              <Plus className="mr-2 h-5 w-5" />
              {t("addMentee")}
            </Button>
          </AddMenteeDialog>
        </div>

        <DashboardContent
          mentees={mentees || []}
          totalCount={count || 0}
          currentPage={page}
          itemsPerPage={itemsPerPage}
          showAll={showAll}
          search={search}
          sort={sort}
          statusFilter={statusFilter}
        />
      </div>
    </div>
  )
}
