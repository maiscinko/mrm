"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ChevronLeft, ChevronRight, Check, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import { useRouter } from "next/navigation"

const steps = [
  { id: "identification", title: "Identificação" },
  { id: "club", title: "Seu Club MLS" },
  { id: "deliverables", title: "Entregáveis" },
  { id: "methodology", title: "Metodologia" },
]

interface FormData {
  // Step 1: Identificação
  fullName: string
  email: string
  linkedinUrl: string
  instagramUrl: string
  bio: string

  // Step 2: Club & Categoria
  clubName: string
  clubCategory: string // bronze, silver, gold, platinum, diamond
  activeMentees: number
  nicheArea: string
  mainSource: string
  otherSource: string

  // Step 3: Entregáveis
  groupMeetingFrequency: string
  groupMeetingDuration: number
  groupMeetingFormat: string
  individualFrequency: string
  individualDuration: number
  individualFormat: string
  asyncCommunication: string[]
  otherDeliverables: string[]

  // Step 4: Metodologia
  framework: string
  customFramework: string
  mentoringStyle: string
  successMetrics: string[]
}

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
}

const contentVariants = {
  hidden: { opacity: 0, x: 50 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.3 } },
  exit: { opacity: 0, x: -50, transition: { duration: 0.2 } },
}

export function OnboardingWizard() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(0)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState<FormData>({
    // Step 1
    fullName: "",
    email: "",
    linkedinUrl: "",
    instagramUrl: "",
    bio: "",

    // Step 2
    clubName: "",
    clubCategory: "",
    activeMentees: 0,
    nicheArea: "",
    mainSource: "",
    otherSource: "",

    // Step 3
    groupMeetingFrequency: "none",
    groupMeetingDuration: 90,
    groupMeetingFormat: "online",
    individualFrequency: "monthly",
    individualDuration: 60,
    individualFormat: "online",
    asyncCommunication: [],
    otherDeliverables: [],

    // Step 4
    framework: "",
    customFramework: "",
    mentoringStyle: "",
    successMetrics: [],
  })

  const updateFormData = (field: keyof FormData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const toggleArrayItem = (field: keyof FormData, item: string) => {
    setFormData((prev) => {
      const currentArray = prev[field] as string[]
      if (currentArray.includes(item)) {
        return { ...prev, [field]: currentArray.filter((i) => i !== item) }
      } else {
        return { ...prev, [field]: [...currentArray, item] }
      }
    })
  }

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep((prev) => prev + 1)
    }
  }

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1)
    }
  }

  const handleSubmit = async () => {
    setIsSubmitting(true)

    try {
      const response = await fetch("/api/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || "Erro ao salvar onboarding")
      }

      toast.success("Onboarding concluído com sucesso!")
      router.push("/dashboard")
      router.refresh()
    } catch (err) {
      console.error("[Onboarding Error]:", err)
      toast.error(err instanceof Error ? err.message : "Erro desconhecido")
      setIsSubmitting(false)
    }
  }

  const isStepValid = () => {
    switch (currentStep) {
      case 0:
        return formData.fullName.trim() !== "" && formData.email.trim() !== ""
      case 1:
        return formData.clubCategory !== "" && formData.nicheArea.trim() !== ""
      case 2:
        return formData.individualFrequency !== ""
      case 3:
        return formData.mentoringStyle !== ""
      default:
        return true
    }
  }

  return (
    <div className="w-full max-w-3xl mx-auto py-8 px-4">
      {/* Progress indicator */}
      <motion.div
        className="mb-8"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex justify-between mb-2">
          {steps.map((step, index) => (
            <motion.div
              key={index}
              className="flex flex-col items-center flex-1"
              whileHover={{ scale: 1.05 }}
            >
              <motion.div
                className={cn(
                  "w-10 h-10 rounded-full cursor-pointer transition-colors duration-300 flex items-center justify-center text-sm font-medium",
                  index < currentStep
                    ? "bg-primary text-primary-foreground"
                    : index === currentStep
                      ? "bg-primary ring-4 ring-primary/20 text-primary-foreground"
                      : "bg-muted text-muted-foreground",
                )}
                onClick={() => {
                  if (index <= currentStep) {
                    setCurrentStep(index)
                  }
                }}
                whileTap={{ scale: 0.95 }}
              >
                {index < currentStep ? <Check className="h-5 w-5" /> : index + 1}
              </motion.div>
              <motion.span
                className={cn(
                  "text-xs mt-2 text-center hidden sm:block",
                  index === currentStep
                    ? "text-primary font-medium"
                    : "text-muted-foreground",
                )}
              >
                {step.title}
              </motion.span>
            </motion.div>
          ))}
        </div>
        <div className="w-full bg-muted h-2 rounded-full overflow-hidden mt-4">
          <motion.div
            className="h-full bg-primary"
            initial={{ width: 0 }}
            animate={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
      </motion.div>

      {/* Form card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <Card className="border shadow-lg rounded-3xl overflow-hidden">
          <div>
            <AnimatePresence mode="wait">
              <motion.div
                key={currentStep}
                initial="hidden"
                animate="visible"
                exit="exit"
                variants={contentVariants}
              >
                {/* Step 1: Identificação do Mentor */}
                {currentStep === 0 && (
                  <>
                    <CardHeader>
                      <CardTitle>Identificação do Mentor</CardTitle>
                      <CardDescription>
                        Seus dados principais e redes sociais
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <motion.div variants={fadeInUp} className="space-y-2">
                        <Label htmlFor="fullName">Nome Completo *</Label>
                        <Input
                          id="fullName"
                          placeholder="João Silva"
                          value={formData.fullName}
                          onChange={(e) => updateFormData("fullName", e.target.value)}
                          className="transition-all duration-300 focus:ring-2 focus:ring-primary/20"
                        />
                      </motion.div>

                      <motion.div variants={fadeInUp} className="space-y-2">
                        <Label htmlFor="email">Email *</Label>
                        <Input
                          id="email"
                          type="email"
                          placeholder="joao@exemplo.com"
                          value={formData.email}
                          onChange={(e) => updateFormData("email", e.target.value)}
                          className="transition-all duration-300 focus:ring-2 focus:ring-primary/20"
                        />
                      </motion.div>

                      <motion.div variants={fadeInUp} className="space-y-2">
                        <Label htmlFor="linkedinUrl">LinkedIn (URL completa)</Label>
                        <Input
                          id="linkedinUrl"
                          placeholder="https://linkedin.com/in/seu-perfil"
                          value={formData.linkedinUrl}
                          onChange={(e) => updateFormData("linkedinUrl", e.target.value)}
                          className="transition-all duration-300 focus:ring-2 focus:ring-primary/20"
                        />
                        <p className="text-xs text-muted-foreground">
                          Usaremos para entender seu tom de voz e estilo
                        </p>
                      </motion.div>

                      <motion.div variants={fadeInUp} className="space-y-2">
                        <Label htmlFor="instagramUrl">Instagram (URL completa)</Label>
                        <Input
                          id="instagramUrl"
                          placeholder="https://instagram.com/seu-perfil"
                          value={formData.instagramUrl}
                          onChange={(e) => updateFormData("instagramUrl", e.target.value)}
                          className="transition-all duration-300 focus:ring-2 focus:ring-primary/20"
                        />
                      </motion.div>

                      <motion.div variants={fadeInUp} className="space-y-2">
                        <Label htmlFor="bio">Bio / Trajetória</Label>
                        <Textarea
                          id="bio"
                          placeholder="Conte um pouco sobre sua experiência como mentor..."
                          value={formData.bio}
                          onChange={(e) => updateFormData("bio", e.target.value)}
                          rows={4}
                          className="transition-all duration-300 focus:ring-2 focus:ring-primary/20"
                        />
                      </motion.div>
                    </CardContent>
                  </>
                )}

                {/* Step 2: Seu Club & Categoria MLS */}
                {currentStep === 1 && (
                  <>
                    <CardHeader>
                      <CardTitle>Seu Club & Categoria MLS</CardTitle>
                      <CardDescription>
                        Informações sobre seu club e mentorados
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <motion.div variants={fadeInUp} className="space-y-2">
                        <Label htmlFor="clubName">Nome do seu Club MLS</Label>
                        <Input
                          id="clubName"
                          placeholder="Ex: Brain, Prosperus, Mentalidade Master"
                          value={formData.clubName}
                          onChange={(e) => updateFormData("clubName", e.target.value)}
                          className="transition-all duration-300 focus:ring-2 focus:ring-primary/20"
                        />
                      </motion.div>

                      <motion.div variants={fadeInUp} className="space-y-3">
                        <Label>Categoria do Club *</Label>
                        <RadioGroup
                          value={formData.clubCategory}
                          onValueChange={(value) => updateFormData("clubCategory", value)}
                          className="space-y-2"
                        >
                          {[
                            { value: "bronze", label: "Bronze", price: "até R$100k/ano" },
                            { value: "silver", label: "Silver", price: "R$100k - R$200k/ano" },
                            { value: "gold", label: "Gold", price: "R$200k - R$300k/ano" },
                            { value: "platinum", label: "Platinum", price: "R$300k - R$400k/ano" },
                            { value: "diamond", label: "Diamond", price: "R$400k+/ano" },
                          ].map((category, index) => (
                            <motion.div
                              key={category.value}
                              className="flex items-center space-x-3 rounded-lg border p-4 cursor-pointer hover:bg-accent transition-colors"
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ opacity: 1, x: 0, transition: { delay: 0.1 * index } }}
                            >
                              <RadioGroupItem value={category.value} id={category.value} />
                              <Label htmlFor={category.value} className="cursor-pointer flex-1">
                                <div className="font-medium">{category.label}</div>
                                <div className="text-sm text-muted-foreground">{category.price}</div>
                              </Label>
                            </motion.div>
                          ))}
                        </RadioGroup>
                      </motion.div>

                      <motion.div variants={fadeInUp} className="space-y-2">
                        <Label htmlFor="activeMentees">Número de mentorados ativos atualmente</Label>
                        <Input
                          id="activeMentees"
                          type="number"
                          placeholder="Ex: 5, 10, 15"
                          value={formData.activeMentees || ""}
                          onChange={(e) => updateFormData("activeMentees", parseInt(e.target.value) || 0)}
                          className="transition-all duration-300 focus:ring-2 focus:ring-primary/20"
                        />
                      </motion.div>

                      <motion.div variants={fadeInUp} className="space-y-2">
                        <Label htmlFor="nicheArea">Nicho de atuação *</Label>
                        <Input
                          id="nicheArea"
                          placeholder="Ex: Tech CEOs, E-commerce Founders, Sales Leaders"
                          value={formData.nicheArea}
                          onChange={(e) => updateFormData("nicheArea", e.target.value)}
                          className="transition-all duration-300 focus:ring-2 focus:ring-primary/20"
                        />
                      </motion.div>

                      <motion.div variants={fadeInUp} className="space-y-3">
                        <Label>Principal fonte de entrada de mentorados</Label>
                        <RadioGroup
                          value={formData.mainSource}
                          onValueChange={(value) => updateFormData("mainSource", value)}
                          className="space-y-2"
                        >
                          {[
                            { value: "mls-referral", label: "Indicação outros mentores MLS" },
                            { value: "personal-network", label: "Network pessoal" },
                            { value: "social-media", label: "LinkedIn / Redes sociais" },
                            { value: "mls-events", label: "Eventos MLS" },
                            { value: "other", label: "Outro" },
                          ].map((source, index) => (
                            <motion.div
                              key={source.value}
                              className="flex items-center space-x-2 rounded-md border p-3 cursor-pointer hover:bg-accent transition-colors"
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0, transition: { delay: 0.05 * index } }}
                            >
                              <RadioGroupItem value={source.value} id={source.value} />
                              <Label htmlFor={source.value} className="cursor-pointer w-full">
                                {source.label}
                              </Label>
                            </motion.div>
                          ))}
                        </RadioGroup>
                      </motion.div>

                      {formData.mainSource === "other" && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          className="space-y-2"
                        >
                          <Label htmlFor="otherSource">Especifique:</Label>
                          <Input
                            id="otherSource"
                            placeholder="Descreva a fonte"
                            value={formData.otherSource}
                            onChange={(e) => updateFormData("otherSource", e.target.value)}
                            className="transition-all duration-300 focus:ring-2 focus:ring-primary/20"
                          />
                        </motion.div>
                      )}
                    </CardContent>
                  </>
                )}

                {/* Step 3: Estrutura de Entregáveis */}
                {currentStep === 2 && (
                  <>
                    <CardHeader>
                      <CardTitle>Estrutura de Entregáveis</CardTitle>
                      <CardDescription>
                        Como você estrutura sessões e encontros
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      {/* Encontros em Grupo */}
                      <div className="border rounded-lg p-4 space-y-4">
                        <h4 className="font-semibold">Encontros em Grupo</h4>

                        <motion.div variants={fadeInUp} className="space-y-2">
                          <Label>Frequência</Label>
                          <Select
                            value={formData.groupMeetingFrequency}
                            onValueChange={(value) => updateFormData("groupMeetingFrequency", value)}
                          >
                            <SelectTrigger className="transition-all duration-300 focus:ring-2 focus:ring-primary/20">
                              <SelectValue placeholder="Selecione" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="none">Não faço encontros em grupo</SelectItem>
                              <SelectItem value="monthly">Mensal</SelectItem>
                              <SelectItem value="bimonthly">Bimestral</SelectItem>
                              <SelectItem value="quarterly">Trimestral</SelectItem>
                            </SelectContent>
                          </Select>
                        </motion.div>

                        {formData.groupMeetingFrequency !== "none" && (
                          <>
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: "auto" }}
                              variants={fadeInUp}
                              className="space-y-2"
                            >
                              <Label htmlFor="groupDuration">Duração média (minutos)</Label>
                              <Input
                                id="groupDuration"
                                type="number"
                                placeholder="90"
                                value={formData.groupMeetingDuration || ""}
                                onChange={(e) =>
                                  updateFormData("groupMeetingDuration", parseInt(e.target.value) || 90)
                                }
                                className="transition-all duration-300 focus:ring-2 focus:ring-primary/20"
                              />
                            </motion.div>

                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: "auto" }}
                              variants={fadeInUp}
                              className="space-y-2"
                            >
                              <Label>Formato</Label>
                              <Select
                                value={formData.groupMeetingFormat}
                                onValueChange={(value) => updateFormData("groupMeetingFormat", value)}
                              >
                                <SelectTrigger className="transition-all duration-300 focus:ring-2 focus:ring-primary/20">
                                  <SelectValue placeholder="Selecione" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="online">Online</SelectItem>
                                  <SelectItem value="presencial">Presencial</SelectItem>
                                  <SelectItem value="hybrid">Híbrido</SelectItem>
                                </SelectContent>
                              </Select>
                            </motion.div>
                          </>
                        )}
                      </div>

                      {/* Encontros Individuais 1-on-1 */}
                      <div className="border rounded-lg p-4 space-y-4">
                        <h4 className="font-semibold">Encontros Individuais 1-on-1</h4>

                        <motion.div variants={fadeInUp} className="space-y-2">
                          <Label>Frequência *</Label>
                          <Select
                            value={formData.individualFrequency}
                            onValueChange={(value) => updateFormData("individualFrequency", value)}
                          >
                            <SelectTrigger className="transition-all duration-300 focus:ring-2 focus:ring-primary/20">
                              <SelectValue placeholder="Selecione" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="weekly">Semanal</SelectItem>
                              <SelectItem value="biweekly">Quinzenal</SelectItem>
                              <SelectItem value="monthly">Mensal</SelectItem>
                              <SelectItem value="flexible">Flexível</SelectItem>
                            </SelectContent>
                          </Select>
                        </motion.div>

                        <motion.div variants={fadeInUp} className="space-y-2">
                          <Label htmlFor="individualDuration">Duração média (minutos)</Label>
                          <Input
                            id="individualDuration"
                            type="number"
                            placeholder="60"
                            value={formData.individualDuration || ""}
                            onChange={(e) =>
                              updateFormData("individualDuration", parseInt(e.target.value) || 60)
                            }
                            className="transition-all duration-300 focus:ring-2 focus:ring-primary/20"
                          />
                        </motion.div>

                        <motion.div variants={fadeInUp} className="space-y-2">
                          <Label>Formato</Label>
                          <Select
                            value={formData.individualFormat}
                            onValueChange={(value) => updateFormData("individualFormat", value)}
                          >
                            <SelectTrigger className="transition-all duration-300 focus:ring-2 focus:ring-primary/20">
                              <SelectValue placeholder="Selecione" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="online">Online</SelectItem>
                              <SelectItem value="presencial">Presencial</SelectItem>
                              <SelectItem value="hybrid">Híbrido</SelectItem>
                            </SelectContent>
                          </Select>
                        </motion.div>
                      </div>

                      {/* Comunicação Assíncrona */}
                      <motion.div variants={fadeInUp} className="space-y-3">
                        <Label>Comunicação Assíncrona</Label>
                        <div className="grid grid-cols-1 gap-2">
                          {[
                            { value: "none", label: "Não utilizo" },
                            { value: "chat", label: "Chat/WhatsApp disponível" },
                            { value: "async-videos", label: "Vídeos assíncronos" },
                            { value: "platform", label: "Plataforma própria" },
                          ].map((item, index) => (
                            <motion.div
                              key={item.value}
                              className="flex items-center space-x-2 rounded-md border p-3 cursor-pointer hover:bg-accent transition-colors"
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0, transition: { delay: 0.05 * index } }}
                              onClick={() => toggleArrayItem("asyncCommunication", item.value)}
                            >
                              <Checkbox
                                id={`async-${item.value}`}
                                checked={formData.asyncCommunication.includes(item.value)}
                                onCheckedChange={() => toggleArrayItem("asyncCommunication", item.value)}
                              />
                              <Label htmlFor={`async-${item.value}`} className="cursor-pointer w-full">
                                {item.label}
                              </Label>
                            </motion.div>
                          ))}
                        </div>
                      </motion.div>

                      {/* Outros Entregáveis */}
                      <motion.div variants={fadeInUp} className="space-y-3">
                        <Label>Outros Entregáveis</Label>
                        <div className="grid grid-cols-1 gap-2">
                          {[
                            { value: "action-plan", label: "Plano de Ação trimestral" },
                            { value: "assessments", label: "Assessments periódicos" },
                            { value: "exclusive-content", label: "Material exclusivo (ebooks, frameworks)" },
                            { value: "community", label: "Acesso comunidade/network" },
                            { value: "exclusive-events", label: "Eventos exclusivos" },
                          ].map((item, index) => (
                            <motion.div
                              key={item.value}
                              className="flex items-center space-x-2 rounded-md border p-3 cursor-pointer hover:bg-accent transition-colors"
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0, transition: { delay: 0.05 * index } }}
                              onClick={() => toggleArrayItem("otherDeliverables", item.value)}
                            >
                              <Checkbox
                                id={`deliverable-${item.value}`}
                                checked={formData.otherDeliverables.includes(item.value)}
                                onCheckedChange={() => toggleArrayItem("otherDeliverables", item.value)}
                              />
                              <Label htmlFor={`deliverable-${item.value}`} className="cursor-pointer w-full">
                                {item.label}
                              </Label>
                            </motion.div>
                          ))}
                        </div>
                      </motion.div>
                    </CardContent>
                  </>
                )}

                {/* Step 4: Metodologia & Outcomes */}
                {currentStep === 3 && (
                  <>
                    <CardHeader>
                      <CardTitle>Metodologia & Outcomes</CardTitle>
                      <CardDescription>
                        Como você trabalha e mede sucesso
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <motion.div variants={fadeInUp} className="space-y-3">
                        <Label>Framework principal</Label>
                        <RadioGroup
                          value={formData.framework}
                          onValueChange={(value) => updateFormData("framework", value)}
                          className="space-y-2"
                        >
                          {[
                            { value: "grow", label: "GROW (Goal, Reality, Options, Will)" },
                            { value: "okr", label: "OKRs (Objectives & Key Results)" },
                            { value: "smart", label: "SMART Goals" },
                            { value: "custom", label: "Metodologia Própria" },
                          ].map((fw, index) => (
                            <motion.div
                              key={fw.value}
                              className="flex items-center space-x-2 rounded-md border p-3 cursor-pointer hover:bg-accent transition-colors"
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ opacity: 1, x: 0, transition: { delay: 0.1 * index } }}
                            >
                              <RadioGroupItem value={fw.value} id={fw.value} />
                              <Label htmlFor={fw.value} className="cursor-pointer w-full">
                                {fw.label}
                              </Label>
                            </motion.div>
                          ))}
                        </RadioGroup>
                      </motion.div>

                      {formData.framework === "custom" && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          className="space-y-2"
                        >
                          <Label htmlFor="customFramework">Descreva sua metodologia:</Label>
                          <Textarea
                            id="customFramework"
                            placeholder="Ex: Uso uma combinação de design thinking + accountability mensal..."
                            value={formData.customFramework}
                            onChange={(e) => updateFormData("customFramework", e.target.value)}
                            rows={3}
                            className="transition-all duration-300 focus:ring-2 focus:ring-primary/20"
                          />
                        </motion.div>
                      )}

                      <motion.div variants={fadeInUp} className="space-y-3">
                        <Label>Estilo de mentoria *</Label>
                        <RadioGroup
                          value={formData.mentoringStyle}
                          onValueChange={(value) => updateFormData("mentoringStyle", value)}
                          className="space-y-2"
                        >
                          {[
                            { value: "directive", label: "Diretivo (mais orientação direta)" },
                            { value: "coaching", label: "Coaching (perguntas provocativas)" },
                            { value: "facilitator", label: "Facilitador (mentorado lidera)" },
                            { value: "hybrid", label: "Híbrido (equilibrado)" },
                          ].map((style, index) => (
                            <motion.div
                              key={style.value}
                              className="flex items-center space-x-2 rounded-md border p-3 cursor-pointer hover:bg-accent transition-colors"
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0, transition: { delay: 0.05 * index } }}
                            >
                              <RadioGroupItem value={style.value} id={style.value} />
                              <Label htmlFor={style.value} className="cursor-pointer w-full">
                                {style.label}
                              </Label>
                            </motion.div>
                          ))}
                        </RadioGroup>
                      </motion.div>

                      <motion.div variants={fadeInUp} className="space-y-3">
                        <Label>Como você mede sucesso do mentorado?</Label>
                        <div className="grid grid-cols-1 gap-2">
                          {[
                            { value: "revenue-growth", label: "Crescimento de revenue" },
                            { value: "goals-achievement", label: "Atingimento de metas definidas" },
                            { value: "leadership-dev", label: "Desenvolvimento de liderança" },
                            { value: "nps", label: "NPS / Satisfação" },
                            { value: "renewal", label: "Renovação de contrato" },
                          ].map((metric, index) => (
                            <motion.div
                              key={metric.value}
                              className="flex items-center space-x-2 rounded-md border p-3 cursor-pointer hover:bg-accent transition-colors"
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0, transition: { delay: 0.05 * index } }}
                              onClick={() => toggleArrayItem("successMetrics", metric.value)}
                            >
                              <Checkbox
                                id={`metric-${metric.value}`}
                                checked={formData.successMetrics.includes(metric.value)}
                                onCheckedChange={() => toggleArrayItem("successMetrics", metric.value)}
                              />
                              <Label htmlFor={`metric-${metric.value}`} className="cursor-pointer w-full">
                                {metric.label}
                              </Label>
                            </motion.div>
                          ))}
                        </div>
                      </motion.div>
                    </CardContent>
                  </>
                )}
              </motion.div>
            </AnimatePresence>

            <CardFooter className="flex justify-between pt-6 pb-4">
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button
                  type="button"
                  variant="outline"
                  onClick={prevStep}
                  disabled={currentStep === 0}
                  className="flex items-center gap-1 transition-all duration-300 rounded-2xl"
                >
                  <ChevronLeft className="h-4 w-4" /> Voltar
                </Button>
              </motion.div>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button
                  type="button"
                  onClick={currentStep === steps.length - 1 ? handleSubmit : nextStep}
                  disabled={!isStepValid() || isSubmitting}
                  className="flex items-center gap-1 transition-all duration-300 rounded-2xl"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" /> Salvando...
                    </>
                  ) : (
                    <>
                      {currentStep === steps.length - 1 ? "Concluir" : "Próximo"}
                      {currentStep === steps.length - 1 ? (
                        <Check className="h-4 w-4" />
                      ) : (
                        <ChevronRight className="h-4 w-4" />
                      )}
                    </>
                  )}
                </Button>
              </motion.div>
            </CardFooter>
          </div>
        </Card>
      </motion.div>

      {/* Step indicator */}
      <motion.div
        className="mt-4 text-center text-sm text-muted-foreground"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.4 }}
      >
        Etapa {currentStep + 1} de {steps.length}: {steps[currentStep].title}
      </motion.div>
    </div>
  )
}
