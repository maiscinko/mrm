"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { ChevronLeft, ChevronRight, Check } from "lucide-react"
import { useRouter } from "next/navigation"
import { OnboardingProgress } from "@/components/onboarding-progress"

type OnboardingData = {
  profile: {
    fullName: string
    bio: string
    yearsExperience: number
    specialties: string[]
    mentoringStyle: string
    isMlsMember: boolean
    mlsCode: string
  }
  program: {
    programName: string
    billingModel: string
    billingAmount: number
    cycleDurationMonths: number
  }
  sessions: {
    individualFrequency: string
    individualDuration: number
    individualFormat: string
    groupFrequency: string
    groupDuration: number
    groupFormat: string
  }
  deliverables: {
    methodology: string
    deliverables: Array<{
      name: string
      type: string
      description: string
      dueAfterDays: number
      isMandatory: boolean
    }>
    checkpoints: Array<{
      name: string
      frequencyDays: number
      description: string
    }>
  }
}

export function OnboardingWizard() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [data, setData] = useState<OnboardingData>({
    profile: {
      fullName: "",
      bio: "",
      yearsExperience: 0,
      specialties: [],
      mentoringStyle: "",
      isMlsMember: false,
      mlsCode: "",
    },
    program: {
      programName: "Programa Principal",
      billingModel: "mensal",
      billingAmount: 0,
      cycleDurationMonths: 12,
    },
    sessions: {
      individualFrequency: "quinzenal",
      individualDuration: 60,
      individualFormat: "online",
      groupFrequency: "mensal",
      groupDuration: 90,
      groupFormat: "presencial",
    },
    deliverables: {
      methodology: "GROW",
      deliverables: [],
      checkpoints: [],
    },
  })

  const updateProfile = (field: string, value: any) => {
    setData((prev) => ({
      ...prev,
      profile: { ...prev.profile, [field]: value },
    }))
  }

  const updateProgram = (field: string, value: any) => {
    setData((prev) => ({
      ...prev,
      program: { ...prev.program, [field]: value },
    }))
  }

  const updateSessions = (field: string, value: any) => {
    setData((prev) => ({
      ...prev,
      sessions: { ...prev.sessions, [field]: value },
    }))
  }

  const updateDeliverables = (field: string, value: any) => {
    setData((prev) => ({
      ...prev,
      deliverables: { ...prev.deliverables, [field]: value },
    }))
  }

  const addDeliverable = () => {
    setData((prev) => ({
      ...prev,
      deliverables: {
        ...prev.deliverables,
        deliverables: [
          ...prev.deliverables.deliverables,
          {
            name: "",
            type: "document",
            description: "",
            dueAfterDays: 30,
            isMandatory: true,
          },
        ],
      },
    }))
  }

  const removeDeliverable = (index: number) => {
    setData((prev) => ({
      ...prev,
      deliverables: {
        ...prev.deliverables,
        deliverables: prev.deliverables.deliverables.filter((_, i) => i !== index),
      },
    }))
  }

  const updateDeliverableField = (index: number, field: string, value: any) => {
    setData((prev) => ({
      ...prev,
      deliverables: {
        ...prev.deliverables,
        deliverables: prev.deliverables.deliverables.map((d, i) =>
          i === index ? { ...d, [field]: value } : d
        ),
      },
    }))
  }

  const addCheckpoint = () => {
    setData((prev) => ({
      ...prev,
      deliverables: {
        ...prev.deliverables,
        checkpoints: [
          ...prev.deliverables.checkpoints,
          {
            name: "",
            frequencyDays: 30,
            description: "",
          },
        ],
      },
    }))
  }

  const removeCheckpoint = (index: number) => {
    setData((prev) => ({
      ...prev,
      deliverables: {
        ...prev.deliverables,
        checkpoints: prev.deliverables.checkpoints.filter((_, i) => i !== index),
      },
    }))
  }

  const updateCheckpointField = (index: number, field: string, value: any) => {
    setData((prev) => ({
      ...prev,
      deliverables: {
        ...prev.deliverables,
        checkpoints: prev.deliverables.checkpoints.map((c, i) =>
          i === index ? { ...c, [field]: value } : c
        ),
      },
    }))
  }

  const handleSubmit = async () => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch("/api/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || "Falha ao salvar onboarding")
      }

      console.log("[Onboarding] Success:", result)
      router.push("/dashboard")
      router.refresh()
    } catch (err) {
      console.error("[Onboarding] Error:", err)
      setError(err instanceof Error ? err.message : "Erro desconhecido")
      setLoading(false)
    }
  }

  const progress = (step / 4) * 100

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-3xl">
        <CardHeader>
          <CardTitle className="text-2xl">Configuração Inicial da Mentoria</CardTitle>
          <CardDescription>
            Complete as etapas abaixo para estruturar sua mentoria
          </CardDescription>
        </CardHeader>

        <CardContent>
          {error && (
            <div className="mb-4 p-4 bg-destructive/10 border border-destructive rounded-md">
              <p className="text-sm text-destructive">{error}</p>
            </div>
          )}

          {/* STEP 1: Perfil do Mentor */}
          {step === 1 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Seu Perfil de Mentor</h3>

              <div className="space-y-2">
                <Label htmlFor="fullName">Nome Completo *</Label>
                <Input
                  id="fullName"
                  value={data.profile.fullName}
                  onChange={(e) => updateProfile("fullName", e.target.value)}
                  placeholder="João Silva"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="bio">Bio / Sobre Você</Label>
                <Textarea
                  id="bio"
                  value={data.profile.bio}
                  onChange={(e) => updateProfile("bio", e.target.value)}
                  placeholder="Conte um pouco sobre sua trajetória e experiência..."
                  rows={4}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="yearsExperience">Anos de Experiência</Label>
                <Input
                  id="yearsExperience"
                  type="number"
                  value={data.profile.yearsExperience}
                  onChange={(e) => updateProfile("yearsExperience", parseInt(e.target.value) || 0)}
                  placeholder="10"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="mentoringStyle">Estilo de Mentoria</Label>
                <Select
                  value={data.profile.mentoringStyle}
                  onValueChange={(value) => updateProfile("mentoringStyle", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione seu estilo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="diretivo">Diretivo (mais orientação)</SelectItem>
                    <SelectItem value="coaching">Coaching (perguntas provocativas)</SelectItem>
                    <SelectItem value="hibrido">Híbrido (equilibrado)</SelectItem>
                    <SelectItem value="facilitador">Facilitador (mentorado lidera)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="isMlsMember"
                  checked={data.profile.isMlsMember}
                  onCheckedChange={(checked) => updateProfile("isMlsMember", checked)}
                />
                <Label htmlFor="isMlsMember" className="cursor-pointer">
                  Sou membro MLS (Mentoring Lab School)
                </Label>
              </div>

              {data.profile.isMlsMember && (
                <div className="space-y-2">
                  <Label htmlFor="mlsCode">Código MLS</Label>
                  <Input
                    id="mlsCode"
                    value={data.profile.mlsCode}
                    onChange={(e) => updateProfile("mlsCode", e.target.value)}
                    placeholder="MLS-12345"
                  />
                </div>
              )}
            </div>
          )}

          {/* STEP 2: Configuração do Programa */}
          {step === 2 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Configuração do Programa</h3>

              <div className="space-y-2">
                <Label htmlFor="programName">Nome do Programa *</Label>
                <Input
                  id="programName"
                  value={data.program.programName}
                  onChange={(e) => updateProgram("programName", e.target.value)}
                  placeholder="Programa de Mentoria Executiva"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="billingModel">Modelo de Cobrança</Label>
                <Select
                  value={data.program.billingModel}
                  onValueChange={(value) => updateProgram("billingModel", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o modelo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="mensal">Mensal</SelectItem>
                    <SelectItem value="trimestral">Trimestral</SelectItem>
                    <SelectItem value="semestral">Semestral</SelectItem>
                    <SelectItem value="anual">Anual</SelectItem>
                    <SelectItem value="pacote">Pacote Fechado</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="billingAmount">Valor (R$)</Label>
                <Input
                  id="billingAmount"
                  type="number"
                  value={data.program.billingAmount}
                  onChange={(e) => updateProgram("billingAmount", parseFloat(e.target.value) || 0)}
                  placeholder="5000"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="cycleDurationMonths">Duração do Ciclo (meses)</Label>
                <Input
                  id="cycleDurationMonths"
                  type="number"
                  value={data.program.cycleDurationMonths}
                  onChange={(e) =>
                    updateProgram("cycleDurationMonths", parseInt(e.target.value) || 12)
                  }
                  placeholder="12"
                />
              </div>
            </div>
          )}

          {/* STEP 3: Estrutura de Sessões */}
          {step === 3 && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold">Estrutura de Sessões</h3>

              <div className="border rounded-lg p-4 space-y-4">
                <h4 className="font-medium">Sessões Individuais</h4>

                <div className="space-y-2">
                  <Label htmlFor="individualFrequency">Frequência</Label>
                  <Select
                    value={data.sessions.individualFrequency}
                    onValueChange={(value) => updateSessions("individualFrequency", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="semanal">Semanal</SelectItem>
                      <SelectItem value="quinzenal">Quinzenal</SelectItem>
                      <SelectItem value="mensal">Mensal</SelectItem>
                      <SelectItem value="flexivel">Flexível</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="individualDuration">Duração (minutos)</Label>
                  <Input
                    id="individualDuration"
                    type="number"
                    value={data.sessions.individualDuration}
                    onChange={(e) =>
                      updateSessions("individualDuration", parseInt(e.target.value) || 60)
                    }
                    placeholder="60"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="individualFormat">Formato</Label>
                  <Select
                    value={data.sessions.individualFormat}
                    onValueChange={(value) => updateSessions("individualFormat", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="online">Online</SelectItem>
                      <SelectItem value="presencial">Presencial</SelectItem>
                      <SelectItem value="hibrido">Híbrido</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="border rounded-lg p-4 space-y-4">
                <h4 className="font-medium">Sessões em Grupo (Opcional)</h4>

                <div className="space-y-2">
                  <Label htmlFor="groupFrequency">Frequência</Label>
                  <Select
                    value={data.sessions.groupFrequency}
                    onValueChange={(value) => updateSessions("groupFrequency", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="nenhuma">Nenhuma</SelectItem>
                      <SelectItem value="mensal">Mensal</SelectItem>
                      <SelectItem value="bimestral">Bimestral</SelectItem>
                      <SelectItem value="trimestral">Trimestral</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {data.sessions.groupFrequency !== "nenhuma" && (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="groupDuration">Duração (minutos)</Label>
                      <Input
                        id="groupDuration"
                        type="number"
                        value={data.sessions.groupDuration}
                        onChange={(e) =>
                          updateSessions("groupDuration", parseInt(e.target.value) || 90)
                        }
                        placeholder="90"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="groupFormat">Formato</Label>
                      <Select
                        value={data.sessions.groupFormat}
                        onValueChange={(value) => updateSessions("groupFormat", value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="online">Online</SelectItem>
                          <SelectItem value="presencial">Presencial</SelectItem>
                          <SelectItem value="hibrido">Híbrido</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </>
                )}
              </div>
            </div>
          )}

          {/* STEP 4: Framework e Entregáveis */}
          {step === 4 && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold">Framework e Entregáveis</h3>

              <div className="space-y-2">
                <Label htmlFor="methodology">Metodologia / Framework</Label>
                <Select
                  value={data.deliverables.methodology}
                  onValueChange={(value) => updateDeliverables("methodology", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="GROW">GROW (Goal, Reality, Options, Will)</SelectItem>
                    <SelectItem value="SMART">SMART Goals</SelectItem>
                    <SelectItem value="OKR">OKRs (Objectives & Key Results)</SelectItem>
                    <SelectItem value="PDCA">PDCA (Plan, Do, Check, Act)</SelectItem>
                    <SelectItem value="custom">Metodologia Própria</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label>Entregáveis do Programa (Opcional)</Label>
                  <Button type="button" variant="outline" size="sm" onClick={addDeliverable}>
                    + Adicionar
                  </Button>
                </div>

                {data.deliverables.deliverables.map((deliverable, index) => (
                  <div key={index} className="border rounded-lg p-4 space-y-3">
                    <div className="flex justify-between items-center">
                      <h5 className="font-medium">Entregável {index + 1}</h5>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeDeliverable(index)}
                      >
                        Remover
                      </Button>
                    </div>

                    <Input
                      placeholder="Nome do entregável"
                      value={deliverable.name}
                      onChange={(e) => updateDeliverableField(index, "name", e.target.value)}
                    />

                    <Select
                      value={deliverable.type}
                      onValueChange={(value) => updateDeliverableField(index, "type", value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Tipo" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="document">Documento</SelectItem>
                        <SelectItem value="presentation">Apresentação</SelectItem>
                        <SelectItem value="plan">Plano de Ação</SelectItem>
                        <SelectItem value="assessment">Autoavaliação</SelectItem>
                      </SelectContent>
                    </Select>

                    <Textarea
                      placeholder="Descrição"
                      value={deliverable.description}
                      onChange={(e) => updateDeliverableField(index, "description", e.target.value)}
                      rows={2}
                    />

                    <Input
                      type="number"
                      placeholder="Prazo (dias após início)"
                      value={deliverable.dueAfterDays}
                      onChange={(e) =>
                        updateDeliverableField(index, "dueAfterDays", parseInt(e.target.value) || 30)
                      }
                    />

                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id={`mandatory-${index}`}
                        checked={deliverable.isMandatory}
                        onCheckedChange={(checked) =>
                          updateDeliverableField(index, "isMandatory", checked)
                        }
                      />
                      <Label htmlFor={`mandatory-${index}`} className="cursor-pointer">
                        Obrigatório
                      </Label>
                    </div>
                  </div>
                ))}
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label>Checkpoints de Avaliação (Opcional)</Label>
                  <Button type="button" variant="outline" size="sm" onClick={addCheckpoint}>
                    + Adicionar
                  </Button>
                </div>

                {data.deliverables.checkpoints.map((checkpoint, index) => (
                  <div key={index} className="border rounded-lg p-4 space-y-3">
                    <div className="flex justify-between items-center">
                      <h5 className="font-medium">Checkpoint {index + 1}</h5>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeCheckpoint(index)}
                      >
                        Remover
                      </Button>
                    </div>

                    <Input
                      placeholder="Nome do checkpoint"
                      value={checkpoint.name}
                      onChange={(e) => updateCheckpointField(index, "name", e.target.value)}
                    />

                    <Input
                      type="number"
                      placeholder="Frequência (dias)"
                      value={checkpoint.frequencyDays}
                      onChange={(e) =>
                        updateCheckpointField(index, "frequencyDays", parseInt(e.target.value) || 30)
                      }
                    />

                    <Textarea
                      placeholder="Descrição"
                      value={checkpoint.description}
                      onChange={(e) => updateCheckpointField(index, "description", e.target.value)}
                      rows={2}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Animated Progress Navigation */}
          <div className="mt-8">
            <OnboardingProgress
              currentStep={step}
              totalSteps={4}
              onBack={() => setStep((prev) => Math.max(1, prev - 1))}
              onContinue={() => setStep((prev) => Math.min(4, prev + 1))}
              onFinish={handleSubmit}
              loading={loading}
              isFirstStep={step === 1}
              isFinalStep={step === 4}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
