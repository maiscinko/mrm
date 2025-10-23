"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import { Plus } from "lucide-react"
import { SessionForm } from "@/components/session-form"
import { format } from "date-fns"
import { createClient } from "@/lib/supabase/client"
import type { Database } from "@/lib/supabase/database.types"

type Session = Database["public"]["Tables"]["sessions"]["Row"]

interface SessionsTabProps {
  menteeId: string
  sessions: Session[]
}

export function SessionsTab({ menteeId, sessions: initialSessions }: SessionsTabProps) {
  const [showForm, setShowForm] = useState(false)
  const [page, setPage] = useState(1)
  const [showAll, setShowAll] = useState(false)
  const [sessions, setSessions] = useState(initialSessions)
  const [totalCount, setTotalCount] = useState(initialSessions.length)
  const itemsPerPage = 20

  const supabase = createClient()

  useEffect(() => {
    const fetchSessions = async () => {
      let query = supabase
        .from("sessions")
        .select("*", { count: "exact" })
        .eq("mentee_id", menteeId)
        .order("session_date", { ascending: false })

      if (!showAll) {
        const start = (page - 1) * itemsPerPage
        const end = start + itemsPerPage - 1
        query = query.range(start, end)
      }

      const { data, count } = await query

      if (data) {
        setSessions(data)
        setTotalCount(count || 0)
      }
    }

    fetchSessions()
  }, [menteeId, page, showAll, supabase])

  const totalPages = Math.ceil(totalCount / itemsPerPage)

  const getPaginationItems = () => {
    const items = []
    const maxVisible = 5

    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) {
        items.push(i)
      }
    } else {
      if (page <= 3) {
        items.push(1, 2, 3, 4, "ellipsis", totalPages)
      } else if (page >= totalPages - 2) {
        items.push(1, "ellipsis", totalPages - 3, totalPages - 2, totalPages - 1, totalPages)
      } else {
        items.push(1, "ellipsis", page - 1, page, page + 1, "ellipsis", totalPages)
      }
    }

    return items
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h2 className="text-2xl font-bold">Sessions</h2>
          <span className="text-sm text-muted-foreground">
            {showAll
              ? `Showing all ${totalCount} sessions`
              : `Showing ${Math.min(itemsPerPage, totalCount)} of ${totalCount}`}
          </span>
        </div>
        <div className="flex gap-2">
          {totalCount > itemsPerPage && (
            <Button variant="outline" onClick={() => setShowAll(!showAll)}>
              {showAll ? "Show Paginated" : "Show All"}
            </Button>
          )}
          <Button onClick={() => setShowForm(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add Session
          </Button>
        </div>
      </div>

      {showForm && <SessionForm menteeId={menteeId} onClose={() => setShowForm(false)} />}

      {sessions.length === 0 ? (
        <Card>
          <CardContent className="flex min-h-[200px] items-center justify-center">
            <p className="text-muted-foreground">No sessions recorded yet.</p>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="space-y-4">
            {sessions.map((session) => (
              <Card key={session.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">{session.theme || "Untitled Session"}</CardTitle>
                      <p className="text-sm text-muted-foreground">
                        {format(new Date(session.session_date), "MMMM d, yyyy")}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      {session.emotion_tag && <Badge variant="outline">{session.emotion_tag}</Badge>}
                      {session.result_tag && <Badge>{session.result_tag}</Badge>}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {session.notes && (
                    <div>
                      <h4 className="mb-2 font-semibold text-sm">Notes</h4>
                      <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">{session.notes}</p>
                    </div>
                  )}
                  {session.next_steps && (
                    <div>
                      <h4 className="mb-2 font-semibold text-sm">Next Steps</h4>
                      <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">{session.next_steps}</p>
                    </div>
                  )}
                  {session.ai_summary && (
                    <div className="rounded-lg bg-primary/10 p-4">
                      <h4 className="mb-2 font-semibold text-sm">AI Summary</h4>
                      <p className="text-sm leading-relaxed">{session.ai_summary}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>

          {!showAll && totalPages > 1 && (
            <div className="flex justify-center">
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      onClick={() => setPage(Math.max(1, page - 1))}
                      className={page === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                    />
                  </PaginationItem>

                  {getPaginationItems().map((item, index) =>
                    item === "ellipsis" ? (
                      <PaginationItem key={`ellipsis-${index}`}>
                        <PaginationEllipsis />
                      </PaginationItem>
                    ) : (
                      <PaginationItem key={item}>
                        <PaginationLink
                          onClick={() => setPage(item as number)}
                          isActive={page === item}
                          className="cursor-pointer"
                        >
                          {item}
                        </PaginationLink>
                      </PaginationItem>
                    ),
                  )}

                  <PaginationItem>
                    <PaginationNext
                      onClick={() => setPage(Math.min(totalPages, page + 1))}
                      className={page === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          )}
        </>
      )}
    </div>
  )
}
