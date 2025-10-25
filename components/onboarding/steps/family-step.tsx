"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2, ChevronLeft } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { createClient } from "@/lib/supabase/client"

interface FamilyStepProps {
  menteeId: string
  data: any
  onDataChange: (data: any) => void
  onNext: () => void
  onBack: () => void
}

export function FamilyStep({ menteeId, data, onDataChange, onNext, onBack }: FamilyStepProps) {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState(data || {})
  const { toast } = useToast()
  const supabase = createClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const existing = await supabase.from("mentees").select("personal_info").eq("id", menteeId).single()
      
      const { error } = await supabase
        .from("mentees")
        .update({
          personal_info: {
            ...(existing.data?.personal_info || {}),
            family: formData,
          },
        })
        .eq("id", menteeId)

      if (error) throw error

      onDataChange(formData)
      toast({ title: "Progress saved!" })
      onNext()
    } catch (error) {
      toast({ title: "Error saving", variant: "destructive", duration: 10000 })
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <h3 className="text-sm font-semibold">Spouse Information (if applicable)</h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Spouse Name</Label>
            <Input value={formData.spouse_name || ""} onChange={(e) => setFormData({ ...formData, spouse_name: e.target.value })} />
          </div>
          <div className="space-y-2">
            <Label>Spouse Birth Date</Label>
            <Input type="date" value={formData.spouse_birth || ""} onChange={(e) => setFormData({ ...formData, spouse_birth: e.target.value })} />
          </div>
        </div>
      </div>

      <div className="space-y-4 border-t pt-4">
        <h3 className="text-sm font-semibold">Children (comma-separated names)</h3>
        <div className="space-y-2">
          <Label>Children Names</Label>
          <Input value={formData.children || ""} onChange={(e) => setFormData({ ...formData, children: e.target.value })} placeholder="João, Maria, Pedro" />
        </div>
      </div>

      <div className="space-y-4 border-t pt-4">
        <h3 className="text-sm font-semibold">Emergency Contact</h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Contact Name *</Label>
            <Input required value={formData.emergency_name || ""} onChange={(e) => setFormData({ ...formData, emergency_name: e.target.value })} />
          </div>
          <div className="space-y-2">
            <Label>Contact Phone *</Label>
            <Input required value={formData.emergency_phone || ""} onChange={(e) => setFormData({ ...formData, emergency_phone: e.target.value })} />
          </div>
        </div>
      </div>

      <div className="flex justify-between border-t pt-6">
        <Button type="button" variant="outline" onClick={onBack}>
          <ChevronLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        <Button type="submit" disabled={loading}>
          {loading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Saving...</> : "Save & Continue"}
        </Button>
      </div>
    </form>
  )
}
