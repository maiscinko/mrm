"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { createClient } from "@/lib/supabase/client"

const personalInfoSchema = z.object({
  email: z.string().email("Valid email is required"),
  whatsapp_country: z.string().default("+55"),
  whatsapp_number: z.string().min(10, "WhatsApp number is required (DDD + number)"),
  cpf: z.string().min(11, "CPF must have 11 digits"),
  rg: z.string().min(1, "RG is required"),
  cep: z.string().min(8, "CEP must have 8 digits"),
  street: z.string().min(1, "Street is required"),
  street_number: z.string().min(1, "Number is required"),
  complement: z.string().optional(),
  neighborhood: z.string().min(1, "Neighborhood is required"),
  city: z.string().min(1, "City is required"),
  state: z.string().min(2, "State is required").max(2),
  home_phone: z.string().optional(),
})

type PersonalInfoInput = z.infer<typeof personalInfoSchema>

interface PersonalInfoStepProps {
  menteeId: string
  data: any
  onDataChange: (data: any) => void
  onNext: () => void
}

// ⚓ ANCHOR: PERSONAL INFO STEP (Step 1/6)
// REASON: Collect basic personal info + address (ViaCEP integration)
// PATTERN: CEP auto-fill via ViaCEP API, save to personal_info JSONB
// UX: Auto-fill address on CEP blur, loading state, clear validation
export function PersonalInfoStep({ menteeId, data, onDataChange, onNext }: PersonalInfoStepProps) {
  const [loading, setLoading] = useState(false)
  const [cepLoading, setCepLoading] = useState(false)
  const { toast } = useToast()
  const supabase = createClient()

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<PersonalInfoInput>({
    resolver: zodResolver(personalInfoSchema),
    defaultValues: {
      ...data,
      whatsapp_country: "+55", // Default Brazil
    },
  })

  const cep = watch("cep")

  // ⚓ VIACEP INTEGRATION
  // REASON: Auto-fill address from CEP (Brazilian postal code API)
  // PATTERN: Fetch on blur, populate street/neighborhood/city/state
  const handleCepBlur = async () => {
    if (!cep || cep.length !== 8) return

    setCepLoading(true)
    try {
      const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`)
      const addressData = await response.json()

      if (addressData.erro) {
        toast({
          title: "CEP not found",
          description: "Please check the CEP and try again",
          variant: "destructive",
        })
        setCepLoading(false)
        return
      }

      // Auto-fill address fields
      setValue("street", addressData.logradouro || "")
      setValue("neighborhood", addressData.bairro || "")
      setValue("city", addressData.localidade || "")
      setValue("state", addressData.uf || "")

      toast({
        title: "Address loaded!",
        description: "Please fill in the number and complement",
      })
    } catch (error) {
      toast({
        title: "Error loading address",
        description: "Please fill in manually",
        variant: "destructive",
      })
    } finally {
      setCepLoading(false)
    }
  }

  // ⚓ ANCHOR: SAVE STEP 1 - REPLACE PLACEHOLDER EMAIL/WHATSAPP
  // REASON: Mentor creates with placeholders, mentee fills real email/whatsapp here
  // PATTERN: UPDATE main columns (email, whatsapp) + JSONB (personal_info)
  // UX: Mentee provides own contact info in first step
  const onSubmit = async (formData: PersonalInfoInput) => {
    setLoading(true)
    try {
      // Concatenate country code + number for whatsapp
      const fullWhatsapp = `${formData.whatsapp_country}${formData.whatsapp_number}`

      // Update mentees: replace placeholder email/whatsapp + save personal_info
      const { error } = await supabase
        .from("mentees")
        .update({
          email: formData.email, // Replace placeholder
          whatsapp: fullWhatsapp, // Replace placeholder (country + number)
          personal_info: {
            cpf: formData.cpf,
            rg: formData.rg,
            address: {
              cep: formData.cep,
              street: formData.street,
              number: formData.street_number,
              complement: formData.complement || "",
              neighborhood: formData.neighborhood,
              city: formData.city,
              state: formData.state,
            },
            phones: {
              home: formData.home_phone || "",
            },
          },
        })
        .eq("id", menteeId)

      if (error) throw error

      onDataChange(formData)
      toast({
        title: "Progress saved!",
        description: "Moving to next step",
      })
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
      {/* Contact Information */}
      <div className="space-y-4">
        <h3 className="text-sm font-semibold">Contact Information</h3>
        <p className="text-xs text-muted-foreground">
          Please provide your email and WhatsApp so your mentor can reach you.
        </p>
        <div className="space-y-2">
          <Label htmlFor="email">Email *</Label>
          <Input id="email" type="email" {...register("email")} placeholder="you@example.com" />
          {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="whatsapp_number">WhatsApp *</Label>
          <div className="flex gap-2">
            <Select
              defaultValue="+55"
              onValueChange={(value) => setValue("whatsapp_country", value)}
            >
              <SelectTrigger className="w-[120px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="+55">🇧🇷 +55</SelectItem>
                <SelectItem value="+1">🇺🇸 +1</SelectItem>
                <SelectItem value="+351">🇵🇹 +351</SelectItem>
                <SelectItem value="+34">🇪🇸 +34</SelectItem>
                <SelectItem value="+44">🇬🇧 +44</SelectItem>
              </SelectContent>
            </Select>
            <div className="flex-1 space-y-0">
              <Input
                id="whatsapp_number"
                {...register("whatsapp_number")}
                placeholder="11999999999"
                className="w-full"
              />
            </div>
          </div>
          {errors.whatsapp_number && <p className="text-sm text-destructive">{errors.whatsapp_number.message}</p>}
          <p className="text-xs text-muted-foreground">Enter DDD + number (e.g., 11999999999 for São Paulo)</p>
        </div>
      </div>

      {/* Documents */}
      <div className="space-y-4 border-t pt-4">
        <h3 className="text-sm font-semibold">Documents</h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="cpf">CPF *</Label>
            <Input id="cpf" {...register("cpf")} placeholder="12345678900" maxLength={11} />
            {errors.cpf && <p className="text-sm text-destructive">{errors.cpf.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="rg">RG *</Label>
            <Input id="rg" {...register("rg")} placeholder="123456789" />
            {errors.rg && <p className="text-sm text-destructive">{errors.rg.message}</p>}
          </div>
        </div>
      </div>

      {/* Address */}
      <div className="space-y-4 border-t pt-4">
        <h3 className="text-sm font-semibold">Address</h3>
        <div className="space-y-2">
          <Label htmlFor="cep">CEP * (will auto-fill address)</Label>
          <div className="relative">
            <Input
              id="cep"
              {...register("cep")}
              placeholder="12345678"
              maxLength={8}
              onBlur={handleCepBlur}
              disabled={cepLoading}
            />
            {cepLoading && (
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
              </div>
            )}
          </div>
          {errors.cep && <p className="text-sm text-destructive">{errors.cep.message}</p>}
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div className="col-span-2 space-y-2">
            <Label htmlFor="street">Street *</Label>
            <Input id="street" {...register("street")} placeholder="Rua das Flores" />
            {errors.street && <p className="text-sm text-destructive">{errors.street.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="street_number">Number *</Label>
            <Input id="street_number" {...register("street_number")} placeholder="123" />
            {errors.street_number && <p className="text-sm text-destructive">{errors.street_number.message}</p>}
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="complement">Complement (optional)</Label>
          <Input id="complement" {...register("complement")} placeholder="Apt 45, Block B" />
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="neighborhood">Neighborhood *</Label>
            <Input id="neighborhood" {...register("neighborhood")} placeholder="Centro" />
            {errors.neighborhood && <p className="text-sm text-destructive">{errors.neighborhood.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="city">City *</Label>
            <Input id="city" {...register("city")} placeholder="São Paulo" />
            {errors.city && <p className="text-sm text-destructive">{errors.city.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="state">State *</Label>
            <Input id="state" {...register("state")} placeholder="SP" maxLength={2} />
            {errors.state && <p className="text-sm text-destructive">{errors.state.message}</p>}
          </div>
        </div>
      </div>

      {/* Additional Phone */}
      <div className="space-y-4 border-t pt-4">
        <h3 className="text-sm font-semibold">Additional Contact (Optional)</h3>
        <div className="space-y-2">
          <Label htmlFor="home_phone">Home/Office Phone</Label>
          <Input id="home_phone" {...register("home_phone")} placeholder="+551133334444" />
          <p className="text-xs text-muted-foreground">Optional landline or office phone</p>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex justify-end border-t pt-6">
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
