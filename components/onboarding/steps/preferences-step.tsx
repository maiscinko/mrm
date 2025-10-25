"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Loader2, ChevronLeft } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { createClient } from "@/lib/supabase/client"

interface PreferencesStepProps {
  menteeId: string
  data: any
  onDataChange: (data: any) => void
  onNext: () => void
  onBack: () => void
}

export function PreferencesStep({ menteeId, data, onDataChange, onNext, onBack }: PreferencesStepProps) {
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
            preferences: formData,
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
      <div className="grid grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label>Shirt Size</Label>
          <Input value={formData.shirt_size || ""} onChange={(e) => setFormData({ ...formData, shirt_size: e.target.value })} placeholder="M, L, XL" />
        </div>
        <div className="space-y-2">
          <Label>Pants Size</Label>
          <Input value={formData.pants_size || ""} onChange={(e) => setFormData({ ...formData, pants_size: e.target.value })} placeholder="40, 42" />
        </div>
        <div className="space-y-2">
          <Label>Shoe Size</Label>
          <Input value={formData.shoe_size || ""} onChange={(e) => setFormData({ ...formData, shoe_size: e.target.value })} placeholder="40, 41" />
        </div>
      </div>

      <div className="space-y-2">
        <Label>Favorite Colors</Label>
        <Input value={formData.favorite_colors || ""} onChange={(e) => setFormData({ ...formData, favorite_colors: e.target.value })} placeholder="Blue, Green" />
      </div>

      <div className="space-y-2">
        <Label>Hobbies & Interests</Label>
        <Textarea value={formData.hobbies || ""} onChange={(e) => setFormData({ ...formData, hobbies: e.target.value })} placeholder="Reading, sports, music..." rows={3} />
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
