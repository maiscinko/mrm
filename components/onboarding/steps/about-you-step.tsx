"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2, ChevronLeft } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { createClient } from "@/lib/supabase/client"

const aboutYouSchema = z.object({
  birth_date: z.string().min(1, "Birth date is required"),
  marital_status: z.enum(["single", "married", "divorced", "widowed", "other"]),
  education_level: z.enum(["high_school", "bachelors", "masters", "phd", "other"]),
  current_profession: z.string().min(1, "Profession is required"),
})

type AboutYouInput = z.infer<typeof aboutYouSchema>

interface AboutYouStepProps {
  menteeId: string
  data: any
  onDataChange: (data: any) => void
  onNext: () => void
  onBack: () => void
}

export function AboutYouStep({ menteeId, data, onDataChange, onNext, onBack }: AboutYouStepProps) {
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()
  const supabase = createClient()

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<AboutYouInput>({
    resolver: zodResolver(aboutYouSchema),
    defaultValues: data,
  })

  const onSubmit = async (formData: AboutYouInput) => {
    setLoading(true)
    try {
      const { error } = await supabase
        .from("mentees")
        .update({
          personal_info: {
            ...(await supabase
              .from("mentees")
              .select("personal_info")
              .eq("id", menteeId)
              .single()
              .then((r) => r.data?.personal_info || {})),
            birth_date: formData.birth_date,
            marital_status: formData.marital_status,
            education_level: formData.education_level,
            profession: formData.current_profession,
          },
        })
        .eq("id", menteeId)

      if (error) throw error

      onDataChange(formData)
      toast({ title: "Progress saved!", description: "Moving to next step" })
      onNext()
    } catch (error) {
      toast({
        title: "Error saving data",
        description: error instanceof Error ? error.message : "Please try again",
        variant: "destructive",
        duration: 10000,
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="birth_date">Birth Date *</Label>
          <Input id="birth_date" type="date" {...register("birth_date")} />
          {errors.birth_date && <p className="text-sm text-destructive">{errors.birth_date.message}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="marital_status">Marital Status *</Label>
          <Select defaultValue={data?.marital_status} onValueChange={(value) => setValue("marital_status", value as any)}>
            <SelectTrigger id="marital_status">
              <SelectValue placeholder="Select status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="single">Single</SelectItem>
              <SelectItem value="married">Married</SelectItem>
              <SelectItem value="divorced">Divorced</SelectItem>
              <SelectItem value="widowed">Widowed</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>
          {errors.marital_status && <p className="text-sm text-destructive">{errors.marital_status.message}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="education_level">Education Level *</Label>
          <Select defaultValue={data?.education_level} onValueChange={(value) => setValue("education_level", value as any)}>
            <SelectTrigger id="education_level">
              <SelectValue placeholder="Select level" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="high_school">High School</SelectItem>
              <SelectItem value="bachelors">Bachelor's Degree</SelectItem>
              <SelectItem value="masters">Master's Degree</SelectItem>
              <SelectItem value="phd">PhD</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>
          {errors.education_level && <p className="text-sm text-destructive">{errors.education_level.message}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="current_profession">Current Profession *</Label>
          <Input id="current_profession" {...register("current_profession")} placeholder="e.g., Software Engineer" />
          {errors.current_profession && <p className="text-sm text-destructive">{errors.current_profession.message}</p>}
        </div>
      </div>

      <div className="flex justify-between border-t pt-6">
        <Button type="button" variant="outline" onClick={onBack}>
          <ChevronLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        <Button type="submit" disabled={loading}>
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            "Save & Continue"
          )}
        </Button>
      </div>
    </form>
  )
}
