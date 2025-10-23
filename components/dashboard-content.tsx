"use client"

import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { MenteeCard } from "@/components/mentee-card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import { Search, X, List, SortAsc } from "lucide-react"
import { useTranslations } from "next-intl"
import type { Database } from "@/lib/supabase/database.types"

type Mentee = Database["public"]["Tables"]["mentees"]["Row"] & {
  deliverables?: Array<{ id: string; status: string }>
}

interface DashboardContentProps {
  mentees: Mentee[]
  totalCount: number
  currentPage: number
  itemsPerPage: number
  showAll: boolean
  search: string
  sort: string
  statusFilter: string
}

export function DashboardContent({
  mentees,
  totalCount,
  currentPage,
  itemsPerPage,
  showAll,
  search: initialSearch,
  sort: initialSort,
  statusFilter: initialStatusFilter,
}: DashboardContentProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const t = useTranslations("dashboard")
  const [searchInput, setSearchInput] = useState(initialSearch)

  const totalPages = Math.ceil(totalCount / itemsPerPage)

  const updateURL = (updates: Record<string, string | undefined>) => {
    const params = new URLSearchParams(searchParams.toString())

    Object.entries(updates).forEach(([key, value]) => {
      if (value) {
        params.set(key, value)
      } else {
        params.delete(key)
      }
    })

    router.push(`/dashboard?${params.toString()}`)
  }

  const handleSearch = (value: string) => {
    setSearchInput(value)
    updateURL({ search: value || undefined, page: "1" })
  }

  const handleClearSearch = () => {
    setSearchInput("")
    updateURL({ search: undefined, page: "1" })
  }

  const handleSort = (value: string) => {
    updateURL({ sort: value, page: "1" })
  }

  const handleStatusFilter = (value: string) => {
    updateURL({ status: value === "all" ? undefined : value, page: "1" })
  }

  const handleShowAll = () => {
    updateURL({ show_all: showAll ? undefined : "true", page: undefined })
  }

  const handlePageChange = (page: number) => {
    updateURL({ page: page.toString() })
  }

  // Generate pagination items
  const getPaginationItems = () => {
    const items = []
    const maxVisible = 5

    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) {
        items.push(i)
      }
    } else {
      if (currentPage <= 3) {
        items.push(1, 2, 3, 4, "ellipsis", totalPages)
      } else if (currentPage >= totalPages - 2) {
        items.push(1, "ellipsis", totalPages - 3, totalPages - 2, totalPages - 1, totalPages)
      } else {
        items.push(1, "ellipsis", currentPage - 1, currentPage, currentPage + 1, "ellipsis", totalPages)
      }
    }

    return items
  }

  return (
    <div className="space-y-6">
      {/* Search and Filters Bar */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder={t("searchPlaceholder")}
            value={searchInput}
            onChange={(e) => handleSearch(e.target.value)}
            className="pl-9 pr-9"
          />
          {searchInput && (
            <button
              onClick={handleClearSearch}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        <div className="flex gap-2">
          <Select value={initialSort} onValueChange={handleSort}>
            <SelectTrigger className="w-[140px]">
              <SortAsc className="mr-2 h-4 w-4" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="plan_end_date">{t("sortByDate")}</SelectItem>
              <SelectItem value="name">{t("sortByName")}</SelectItem>
              <SelectItem value="recent">{t("sortByRecent")}</SelectItem>
            </SelectContent>
          </Select>

          <Select value={initialStatusFilter} onValueChange={handleStatusFilter}>
            <SelectTrigger className="w-[140px]">
              <List className="mr-2 h-4 w-4" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t("allStatus")}</SelectItem>
              <SelectItem value="active">{t("active")}</SelectItem>
              <SelectItem value="renewal_due">{t("renewalDue")}</SelectItem>
              <SelectItem value="completed">{t("completed")}</SelectItem>
            </SelectContent>
          </Select>

          <Button variant="outline" onClick={handleShowAll}>
            {showAll ? t("showPaginated") : t("showAll")}
          </Button>
        </div>
      </div>

      {/* Results Count */}
      <div className="text-sm text-muted-foreground">
        {showAll ? (
          <span>{t("showingAll", { count: totalCount })}</span>
        ) : (
          <span>
            {t("showingRange", {
              start: (currentPage - 1) * itemsPerPage + 1,
              end: Math.min(currentPage * itemsPerPage, totalCount),
              total: totalCount,
            })}
          </span>
        )}
      </div>

      {/* Mentees Grid or Empty State */}
      {mentees.length === 0 ? (
        <div className="flex min-h-[400px] items-center justify-center">
          <div className="text-center">
            <p className="mb-4 text-lg text-muted-foreground">
              {initialSearch ? t("noResults", { search: initialSearch }) : t("noMentees")}
            </p>
          </div>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {mentees.map((mentee) => (
            <MenteeCard key={mentee.id} mentee={mentee} />
          ))}
        </div>
      )}

      {/* Pagination */}
      {!showAll && totalPages > 1 && (
        <div className="flex justify-center">
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                  className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
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
                      onClick={() => handlePageChange(item as number)}
                      isActive={currentPage === item}
                      className="cursor-pointer"
                    >
                      {item}
                    </PaginationLink>
                  </PaginationItem>
                ),
              )}

              <PaginationItem>
                <PaginationNext
                  onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
                  className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}
    </div>
  )
}
