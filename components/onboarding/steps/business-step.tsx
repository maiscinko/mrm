"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Loader2, ChevronLeft, Plus, Trash2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { createClient } from "@/lib/supabase/client"

interface Company {
  legal_name: string
  segment: string
  role: string
  employees: string
  revenue: string
}

interface BusinessStepProps {
  menteeId: string
  data: any
  onDataChange: (data: any) => void
  onNext: () => void
  onBack: () => void
}

export function BusinessStep({ menteeId, data, onDataChange, onNext, onBack }: BusinessStepProps) {
  const [loading, setLoading] = useState(false)
  const [companies, setCompanies] = useState<Company[]>(data?.companies || [{ legal_name: "", segment: "", role: "", employees: "", revenue: "" }])
  const [challenges, setChallenges] = useState(data?.challenges || "")
  const [networking_goals, setNetworkingGoals] = useState(data?.networking || "")
  const { toast } = useToast()
  const supabase = createClient()

  const addCompany = () => {
    setCompanies([...companies, { legal_name: "", segment: "", role: "", employees: "", revenue: "" }])
  }

  const removeCompany = (index: number) => {
    setCompanies(companies.filter((_, i) => i !== index))
  }

  const updateCompany = (index: number, field: keyof Company, value: string) => {
    const updated = [...companies]
    updated[index][field] = value
    setCompanies(updated)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const existing = await supabase.from("mentees").select("business_goals").eq("id", menteeId).single()
      
      // Save to business_goals JSONB
      const { error: menteeError } = await supabase
        .from("mentees")
        .update({
          business_goals: {
            ...(existing.data?.business_goals || {}),
            challenges,
            networking_goals,
          },
        })
        .eq("id", menteeId)

      if (menteeError) throw menteeError

      // Save companies to mentee_companies table
      // First delete existing
      await supabase.from("mentee_companies").delete().eq("mentee_id", menteeId)

      // Then insert new
      const companiesToInsert = companies
        .filter((c) => c.legal_name && c.segment && c.role)
        .map((c, index) => ({
          mentee_id: menteeId,
          company_legal_name: c.legal_name,
          company_segment: c.segment,
          mentee_role: c.role,
          employees_count: c.employees ? parseInt(c.employees) : null,
          annual_revenue_2024: c.revenue ? parseFloat(c.revenue) : null,
          display_order: index,
        }))

      if (companiesToInsert.length > 0) {
        const { error: companyError } = await supabase.from("mentee_companies").insert(companiesToInsert)
        if (companyError) throw companyError
      }

      onDataChange({ companies, challenges, networking: networking_goals })
      toast({ title: "Progress saved!" })
      onNext()
    } catch (error) {
      toast({ title: "Error saving", description: error instanceof Error ? error.message : "Try again", variant: "destructive", duration: 10000 })
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold">Companies You Own or Lead</h3>
          <Button type="button" variant="outline" size="sm" onClick={addCompany}>
            <Plus className="mr-2 h-4 w-4" />
            Add Company
          </Button>
        </div>

        {companies.map((company, index) => (
          <div key={index} className="space-y-3 rounded-lg border p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Company {index + 1}</span>
              {companies.length > 1 && (
                <Button type="button" variant="ghost" size="sm" onClick={() => removeCompany(index)}>
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              )}
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Legal Name *</Label>
                <Input value={company.legal_name} onChange={(e) => updateCompany(index, "legal_name", e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label>Segment *</Label>
                <Input value={company.segment} onChange={(e) => updateCompany(index, "segment", e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label>Your Role *</Label>
                <Input value={company.role} onChange={(e) => updateCompany(index, "role", e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label>Employees</Label>
                <Input type="number" value={company.employees} onChange={(e) => updateCompany(index, "employees", e.target.value)} />
              </div>
              <div className="col-span-2 space-y-2">
                <Label>Annual Revenue 2024 (R$)</Label>
                <Input type="number" step="0.01" value={company.revenue} onChange={(e) => updateCompany(index, "revenue", e.target.value)} />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="space-y-4 border-t pt-4">
        <div className="space-y-2">
          <Label>Main Business Challenges</Label>
          <Textarea value={challenges} onChange={(e) => setChallenges(e.target.value)} rows={3} placeholder="What are your biggest challenges?" />
        </div>
        <div className="space-y-2">
          <Label>Networking Goals</Label>
          <Textarea value={networking_goals} onChange={(e) => setNetworkingGoals(e.target.value)} rows={3} placeholder="Who would you like to meet? What connections are you seeking?" />
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
