"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Plus, Trash2 } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { createDeliverableSchema, type CreateDeliverableInput } from "@/lib/validations/deliverable"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import type { Database } from "@/lib/supabase/database.types"

type Deliverable = Database["public"]["Tables"]["deliverables"]["Row"]

interface DeliverablesTabProps {
  menteeId: string
  deliverables: Deliverable[]
}

export function DeliverablesTab({ menteeId, deliverables }: DeliverablesTabProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = useForm<CreateDeliverableInput>({
    resolver: zodResolver(createDeliverableSchema),
    defaultValues: {
      responsible: "mentee",
      status: "pending",
    },
  })

  const responsible = watch("responsible")
  const status = watch("status")

  const onSubmit = async (data: CreateDeliverableInput) => {
    setIsLoading(true)
    try {
      const { error } = await supabase.from("deliverables").insert({
        mentee_id: menteeId,
        ...data,
      })

      if (error) throw error

      toast.success("Deliverable added successfully")
      setIsOpen(false)
      reset()
      router.refresh()
    } catch (error) {
      console.error("[v0] Error creating deliverable:", error)
      toast.error("Failed to add deliverable")
    } finally {
      setIsLoading(false)
    }
  }

  const updateStatus = async (id: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from("deliverables")
        .update({
          status: newStatus,
          completed_at: newStatus === "completed" ? new Date().toISOString() : null,
        })
        .eq("id", id)

      if (error) throw error

      toast.success("Status updated")
      router.refresh()
    } catch (error) {
      console.error("[v0] Error updating deliverable:", error)
      toast.error("Failed to update status")
    }
  }

  const deleteDeliverable = async (id: string) => {
    if (!confirm("Are you sure you want to delete this deliverable?")) return

    try {
      const { error } = await supabase.from("deliverables").delete().eq("id", id)

      if (error) throw error

      toast.success("Deliverable deleted")
      router.refresh()
    } catch (error) {
      console.error("[v0] Error deleting deliverable:", error)
      toast.error("Failed to delete deliverable")
    }
  }

  const totalDeliverables = deliverables.length
  const completedDeliverables = deliverables.filter((d) => d.status === "completed").length
  const progressPercentage = totalDeliverables > 0 ? (completedDeliverables / totalDeliverables) * 100 : 0

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "default"
      case "in_progress":
        return "secondary"
      case "cancelled":
        return "destructive"
      default:
        return "outline"
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div className="space-y-1">
            <CardTitle>Deliverables</CardTitle>
            <p className="text-sm text-muted-foreground">
              {completedDeliverables} of {totalDeliverables} completed
            </p>
          </div>
          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Add Deliverable
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Deliverable</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="task">Task *</Label>
                  <Input id="task" {...register("task")} placeholder="e.g., Complete business plan" />
                  {errors.task && <p className="text-sm text-destructive">{errors.task.message}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="responsible">Responsible *</Label>
                  <Select value={responsible} onValueChange={(value) => setValue("responsible", value as any)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="mentee">Mentee</SelectItem>
                      <SelectItem value="mentor">Mentor</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="due_date">Due Date</Label>
                  <Input id="due_date" type="date" {...register("due_date")} />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <Select value={status} onValueChange={(value) => setValue("status", value as any)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="in_progress">In Progress</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="comment">Comment</Label>
                  <Textarea id="comment" {...register("comment")} placeholder="Additional notes..." rows={3} />
                </div>

                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isLoading}>
                    {isLoading ? "Adding..." : "Add Deliverable"}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <Progress value={progressPercentage} className="h-2" />
          </div>

          {deliverables.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">No deliverables yet. Add one to get started.</p>
          ) : (
            <div className="space-y-3">
              {deliverables.map((deliverable) => (
                <div
                  key={deliverable.id}
                  className="flex items-start justify-between gap-4 rounded-lg border p-4 hover:bg-accent/50 transition-colors"
                >
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium">{deliverable.task}</h4>
                      <Badge variant={getStatusColor(deliverable.status)}>{deliverable.status}</Badge>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span>Responsible: {deliverable.responsible}</span>
                      {deliverable.due_date && <span>Due: {new Date(deliverable.due_date).toLocaleDateString()}</span>}
                    </div>
                    {deliverable.comment && <p className="text-sm text-muted-foreground">{deliverable.comment}</p>}
                  </div>
                  <div className="flex items-center gap-2">
                    <Select value={deliverable.status} onValueChange={(value) => updateStatus(deliverable.id, value)}>
                      <SelectTrigger className="w-[140px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="in_progress">In Progress</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                        <SelectItem value="cancelled">Cancelled</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button variant="ghost" size="icon" onClick={() => deleteDeliverable(deliverable.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
