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
  { id: "identification", title: "Identification" },
  { id: "club", title: "Your MLS Club" },
  { id: "deliverables", title: "Deliverables" },
  { id: "methodology", title: "Methodology" },
  { id: "documents", title: "Documents" },
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
  mainSources: string[] // Changed from mainSource to mainSources (array)
  otherSource: string

  // Step 3: Entregáveis
  // Encontros em Grupo
  groupDeliverableName: string
  groupMeetingFormat: string
  groupMeetingFrequency: string
  groupMeetingDuration: number
  // Encontros Individuais 1-on-1
  individualTotalInPeriod: number
  individualDuration: number
  individualFormat: string
  // Forma de Comunicação
  communicationMethods: string[]
  customCommunicationMethod: string
  otherDeliverables: string[]
  customOtherDeliverable: string

  // Step 4: Metodologia
  framework: string
  customFramework: string
  mentoringStyle: string
  successMetrics: string[]

  // Step 5: Documents (optional)
  profilePhoto?: File | null
  additionalDocuments?: File[]
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

// ⚓ ANCHOR: ONBOARDING_WIZARD_PROPS
// REASON: Pre-fill email from logged user for better UX
// PATTERN: Accept userEmail prop, initialize formData with it
// UX: User sees their email already filled, can edit if needed
interface OnboardingWizardProps {
  userEmail?: string
}

export function OnboardingWizard({ userEmail = "" }: OnboardingWizardProps) {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(0)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSaved, setIsSaved] = useState(false)
  const [formData, setFormData] = useState<FormData>({
    // Step 1
    fullName: "",
    email: userEmail, // Pre-filled from logged user
    linkedinUrl: "",
    instagramUrl: "",
    bio: "",

    // Step 2
    clubName: "",
    clubCategory: "",
    activeMentees: 0,
    nicheArea: "",
    mainSources: [],
    otherSource: "",

    // Step 3
    groupDeliverableName: "",
    groupMeetingFormat: "online",
    groupMeetingFrequency: "none",
    groupMeetingDuration: 90,
    individualTotalInPeriod: 0,
    individualDuration: 60,
    individualFormat: "online",
    communicationMethods: [],
    customCommunicationMethod: "",
    otherDeliverables: [],
    customOtherDeliverable: "",

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

  const normalizeLinkedInUrl = (input: string): string => {
    if (!input.trim()) return ""

    // Already a full URL
    if (input.startsWith("http://") || input.startsWith("https://")) {
      return input
    }

    // Remove @ if present
    const username = input.replace(/^@/, "")

    // Build LinkedIn URL
    return `https://linkedin.com/in/${username}`
  }

  const normalizeInstagramUrl = (input: string): string => {
    if (!input.trim()) return ""

    // Already a full URL
    if (input.startsWith("http://") || input.startsWith("https://")) {
      return input
    }

    // Remove @ if present
    const username = input.replace(/^@/, "")

    // Build Instagram URL
    return `https://instagram.com/${username}`
  }

  const saveOnboardingData = async () => {
    console.log("=== ONBOARDING SAVE STARTED ===")
    console.log("[Onboarding Save] Button clicked - starting save process")
    console.log("[Onboarding Save] Current step:", currentStep)
    console.log("[Onboarding Save] Is submitting:", isSubmitting)
    console.log("[Onboarding Save] Form data:", JSON.stringify(formData, null, 2))

    setIsSubmitting(true)

    try {
      // Normalize social media URLs before submitting
      const normalizedData = {
        ...formData,
        linkedinUrl: normalizeLinkedInUrl(formData.linkedinUrl),
        instagramUrl: normalizeInstagramUrl(formData.instagramUrl),
      }

      console.log("[Onboarding Save] Normalized data:", JSON.stringify(normalizedData, null, 2))
      console.log("[Onboarding Save] Calling API /api/onboarding...")

      const response = await fetch("/api/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(normalizedData),
      })

      console.log("[Onboarding Save] Response received - status:", response.status)

      const result = await response.json()
      console.log("[Onboarding Save] Response body:", JSON.stringify(result, null, 2))

      if (!response.ok) {
        const errorMsg = result.details || result.error || "Failed to save onboarding"
        console.error("[Onboarding Save] ❌ ERROR:", errorMsg)
        console.error("[Onboarding Save] Full response:", result)
        toast.error(`Save failed: ${errorMsg}`, { duration: 10000 })
        setIsSubmitting(false)
        throw new Error(errorMsg)
      }

      console.log("[Onboarding Save] ✅ SUCCESS - Data saved!")
      setIsSaved(true)
      toast.success("✅ Data saved successfully! Now you can upload complementary documents.", { duration: 5000 })
      setIsSubmitting(false)
      // Advance to step 5 (documents)
      console.log("[Onboarding Save] Advancing to step 5 (documents)...")
      nextStep()
      console.log("=== ONBOARDING SAVE COMPLETED ===")
    } catch (err) {
      console.error("=== ONBOARDING SAVE FAILED ===")
      console.error("[Onboarding Error]:", err)
      toast.error(err instanceof Error ? err.message : "Unknown error saving data", { duration: 10000 })
      setIsSubmitting(false)
    }
  }

  const handleFinalSubmit = () => {
    // Step 5: Upload documents (optional) and finish
    toast.success("Onboarding completed successfully!")
    router.push("/dashboard")
    router.refresh()
  }

  const getStepValidationErrors = (): string[] => {
    const errors: string[] = []

    switch (currentStep) {
      case 0:
        if (formData.fullName.trim() === "") errors.push("Full Name is required")
        if (formData.email.trim() === "") errors.push("Email is required")
        break
      case 1:
        if (formData.clubCategory === "") errors.push("MLS Category is required")
        if (formData.nicheArea.trim() === "") errors.push("Niche Area is required")
        break
      case 2:
        if (formData.individualTotalInPeriod <= 0) errors.push("Individual sessions total must be greater than 0")
        break
      case 3:
        if (formData.mentoringStyle === "") errors.push("Mentoring Style is required")
        break
      case 4:
        // Documents are optional
        break
    }

    return errors
  }

  const isStepValid = () => {
    return getStepValidationErrors().length === 0
  }

  const handleNextStep = () => {
    const errors = getStepValidationErrors()
    if (errors.length > 0) {
      toast.error(`Please fix the following errors:\n${errors.join("\n")}`)
      return
    }
    nextStep()
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
                {/* Step 1: Mentor Identification */}
                {currentStep === 0 && (
                  <>
                    <CardHeader>
                      <CardTitle>Mentor Identification</CardTitle>
                      <CardDescription>
                        Your main information and social media
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <motion.div variants={fadeInUp} className="space-y-2">
                        <Label htmlFor="fullName">Full Name *</Label>
                        <Input
                          id="fullName"
                          placeholder="John Silva"
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
                          placeholder="john@example.com"
                          value={formData.email}
                          onChange={(e) => updateFormData("email", e.target.value)}
                          className="transition-all duration-300 focus:ring-2 focus:ring-primary/20"
                        />
                        {userEmail && (
                          <p className="text-xs text-muted-foreground">
                            ✓ Using your login email. You can edit this if you prefer a different one.
                          </p>
                        )}
                      </motion.div>

                      <motion.div variants={fadeInUp} className="space-y-2">
                        <Label htmlFor="linkedinUrl">LinkedIn Profile</Label>
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-muted-foreground">linkedin.com/in/</span>
                          <Input
                            id="linkedinUrl"
                            placeholder="yourname"
                            value={formData.linkedinUrl.replace(/^https?:\/\/(www\.)?linkedin\.com\/in\//, '').replace(/^@/, '')}
                            onChange={(e) => updateFormData("linkedinUrl", e.target.value.replace(/^@/, ''))}
                            className="flex-1 transition-all duration-300 focus:ring-2 focus:ring-primary/20"
                          />
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Just your LinkedIn username (we'll build the full URL)
                        </p>
                      </motion.div>

                      <motion.div variants={fadeInUp} className="space-y-2">
                        <Label htmlFor="instagramUrl">Instagram Profile</Label>
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-muted-foreground">@</span>
                          <Input
                            id="instagramUrl"
                            placeholder="yourname"
                            value={formData.instagramUrl.replace(/^https?:\/\/(www\.)?instagram\.com\//, '').replace(/^@/, '')}
                            onChange={(e) => updateFormData("instagramUrl", e.target.value.replace(/^@/, ''))}
                            className="flex-1 transition-all duration-300 focus:ring-2 focus:ring-primary/20"
                          />
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Just your Instagram username (without @)
                        </p>
                      </motion.div>

                      <motion.div variants={fadeInUp} className="space-y-2">
                        <Label htmlFor="bio">Bio / Background</Label>
                        <Textarea
                          id="bio"
                          placeholder="Tell us about your experience as a mentor..."
                          value={formData.bio}
                          onChange={(e) => updateFormData("bio", e.target.value)}
                          rows={4}
                          className="transition-all duration-300 focus:ring-2 focus:ring-primary/20"
                        />
                      </motion.div>
                    </CardContent>
                  </>
                )}

                {/* Step 2: Your MLS Club & Category */}
                {currentStep === 1 && (
                  <>
                    <CardHeader>
                      <CardTitle>Your MLS Club & Category</CardTitle>
                      <CardDescription>
                        Information about your club and mentees
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <motion.div variants={fadeInUp} className="space-y-2">
                        <Label htmlFor="clubName">Your MLS Club Name</Label>
                        <Input
                          id="clubName"
                          placeholder="E.g.: Brain, Prosperus, Mindset Master"
                          value={formData.clubName}
                          onChange={(e) => updateFormData("clubName", e.target.value)}
                          className="transition-all duration-300 focus:ring-2 focus:ring-primary/20"
                        />
                      </motion.div>

                      <motion.div variants={fadeInUp} className="space-y-3">
                        <Label>Club Category *</Label>
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
                        <Label htmlFor="activeMentees">Number of currently active mentees</Label>
                        <Input
                          id="activeMentees"
                          type="number"
                          placeholder="E.g.: 5, 10, 15"
                          value={formData.activeMentees || ""}
                          onChange={(e) => updateFormData("activeMentees", parseInt(e.target.value) || 0)}
                          className="transition-all duration-300 focus:ring-2 focus:ring-primary/20"
                        />
                      </motion.div>

                      <motion.div variants={fadeInUp} className="space-y-2">
                        <Label htmlFor="nicheArea">Niche Area *</Label>
                        <Input
                          id="nicheArea"
                          placeholder="E.g.: Tech CEOs, E-commerce Founders, Sales Leaders"
                          value={formData.nicheArea}
                          onChange={(e) => updateFormData("nicheArea", e.target.value)}
                          className="transition-all duration-300 focus:ring-2 focus:ring-primary/20"
                        />
                      </motion.div>

                      <motion.div variants={fadeInUp} className="space-y-3">
                        <Label>Main sources of mentee inflow (select all that apply)</Label>
                        <div className="grid grid-cols-1 gap-2">
                          {[
                            { value: "mls-referral", label: "Referral from other MLS mentors" },
                            { value: "personal-network", label: "Personal network" },
                            { value: "social-media", label: "LinkedIn / Social media" },
                            { value: "mls-events", label: "MLS events" },
                            { value: "prospecting", label: "Active prospecting" },
                            { value: "ads", label: "Paid ads (Google, LinkedIn, etc.)" },
                            { value: "other-products", label: "Other products/services I offer" },
                            { value: "other", label: "Other" },
                          ].map((source, index) => (
                            <motion.div
                              key={source.value}
                              className="flex items-center space-x-2 rounded-md border p-3 cursor-pointer hover:bg-accent transition-colors"
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0, transition: { delay: 0.05 * index } }}
                              onClick={() => toggleArrayItem("mainSources", source.value)}
                            >
                              <Checkbox
                                id={`source-${source.value}`}
                                checked={formData.mainSources.includes(source.value)}
                                onCheckedChange={() => toggleArrayItem("mainSources", source.value)}
                              />
                              <Label htmlFor={`source-${source.value}`} className="cursor-pointer w-full">
                                {source.label}
                              </Label>
                            </motion.div>
                          ))}
                        </div>
                      </motion.div>

                      {formData.mainSources.includes("other") && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          className="space-y-2"
                        >
                          <Label htmlFor="otherSource">Please specify:</Label>
                          <Input
                            id="otherSource"
                            placeholder="Describe the source"
                            value={formData.otherSource}
                            onChange={(e) => updateFormData("otherSource", e.target.value)}
                            className="transition-all duration-300 focus:ring-2 focus:ring-primary/20"
                          />
                        </motion.div>
                      )}
                    </CardContent>
                  </>
                )}

                {/* Step 3: Deliverables Structure */}
                {currentStep === 2 && (
                  <>
                    <CardHeader>
                      <CardTitle>Deliverables Structure</CardTitle>
                      <CardDescription>
                        How you structure sessions and meetings
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      {/* Group Meetings */}
                      <div className="border rounded-lg p-4 space-y-4">
                        <h4 className="font-semibold">Group Meetings</h4>

                        <motion.div variants={fadeInUp} className="space-y-2">
                          <Label htmlFor="groupDeliverableName">Deliverable name</Label>
                          <Input
                            id="groupDeliverableName"
                            placeholder="E.g.: Monthly Forum, CEO Meeting, Club Session"
                            value={formData.groupDeliverableName}
                            onChange={(e) => updateFormData("groupDeliverableName", e.target.value)}
                            className="transition-all duration-300 focus:ring-2 focus:ring-primary/20"
                          />
                          <p className="text-xs text-muted-foreground">
                            Leave empty if you don't do group meetings
                          </p>
                        </motion.div>

                        {formData.groupDeliverableName.trim() !== "" && (
                          <>
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: "auto" }}
                              variants={fadeInUp}
                              className="space-y-2"
                            >
                              <Label>Format</Label>
                              <Select
                                value={formData.groupMeetingFormat}
                                onValueChange={(value) => updateFormData("groupMeetingFormat", value)}
                              >
                                <SelectTrigger className="transition-all duration-300 focus:ring-2 focus:ring-primary/20">
                                  <SelectValue placeholder="Select" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="online">Online</SelectItem>
                                  <SelectItem value="presencial">In-person</SelectItem>
                                  <SelectItem value="hybrid">Hybrid (online + in-person)</SelectItem>
                                </SelectContent>
                              </Select>
                            </motion.div>

                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: "auto" }}
                              variants={fadeInUp}
                              className="space-y-2"
                            >
                              <Label>Frequency</Label>
                              <Select
                                value={formData.groupMeetingFrequency}
                                onValueChange={(value) => updateFormData("groupMeetingFrequency", value)}
                              >
                                <SelectTrigger className="transition-all duration-300 focus:ring-2 focus:ring-primary/20">
                                  <SelectValue placeholder="Select" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="monthly">Monthly</SelectItem>
                                  <SelectItem value="bimonthly">Bimonthly</SelectItem>
                                  <SelectItem value="quarterly">Quarterly</SelectItem>
                                </SelectContent>
                              </Select>
                              <p className="text-xs text-muted-foreground">
                                Total frequency (online + in-person if hybrid)
                              </p>
                            </motion.div>

                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: "auto" }}
                              variants={fadeInUp}
                              className="space-y-2"
                            >
                              <Label htmlFor="groupDuration">Average duration (minutes)</Label>
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
                          </>
                        )}
                      </div>

                      {/* Individual 1-on-1 Meetings */}
                      <div className="border rounded-lg p-4 space-y-4">
                        <h4 className="font-semibold">Individual 1-on-1 Meetings *</h4>

                        <motion.div variants={fadeInUp} className="space-y-2">
                          <Label htmlFor="individualTotalInPeriod">
                            Total 1-on-1 sessions in contract period *
                          </Label>
                          <Input
                            id="individualTotalInPeriod"
                            type="number"
                            placeholder="E.g.: 12 (for annual contract), 24 (for biannual)"
                            value={formData.individualTotalInPeriod || ""}
                            onChange={(e) =>
                              updateFormData("individualTotalInPeriod", parseInt(e.target.value) || 0)
                            }
                            className="transition-all duration-300 focus:ring-2 focus:ring-primary/20"
                          />
                          <p className="text-xs text-muted-foreground">
                            Total number of individual sessions included in the mentoring contract
                          </p>
                        </motion.div>

                        <motion.div variants={fadeInUp} className="space-y-2">
                          <Label htmlFor="individualDuration">Average duration (minutes)</Label>
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
                          <Label>Format</Label>
                          <Select
                            value={formData.individualFormat}
                            onValueChange={(value) => updateFormData("individualFormat", value)}
                          >
                            <SelectTrigger className="transition-all duration-300 focus:ring-2 focus:ring-primary/20">
                              <SelectValue placeholder="Select" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="online">Online</SelectItem>
                              <SelectItem value="presencial">In-person</SelectItem>
                              <SelectItem value="hybrid">Hybrid</SelectItem>
                            </SelectContent>
                          </Select>
                        </motion.div>
                      </div>

                      {/* Communication Methods */}
                      <motion.div variants={fadeInUp} className="space-y-3">
                        <Label>Communication Methods</Label>
                        <div className="grid grid-cols-1 gap-2">
                          {[
                            { value: "grupo-whatsapp", label: "WhatsApp/Telegram Group" },
                            { value: "individual-whatsapp", label: "Individual WhatsApp" },
                            { value: "comunidade-facebook", label: "Facebook Community" },
                            { value: "comunidade-discord", label: "Discord Community" },
                            { value: "plataforma-propria", label: "Own Platform" },
                            { value: "other", label: "Other" },
                          ].map((item, index) => (
                            <motion.div
                              key={item.value}
                              className="flex items-center space-x-2 rounded-md border p-3 cursor-pointer hover:bg-accent transition-colors"
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0, transition: { delay: 0.05 * index } }}
                              onClick={() => toggleArrayItem("communicationMethods", item.value)}
                            >
                              <Checkbox
                                id={`comm-${item.value}`}
                                checked={formData.communicationMethods.includes(item.value)}
                                onCheckedChange={() => toggleArrayItem("communicationMethods", item.value)}
                              />
                              <Label htmlFor={`comm-${item.value}`} className="cursor-pointer w-full">
                                {item.label}
                              </Label>
                            </motion.div>
                          ))}
                        </div>
                        {formData.communicationMethods.includes("other") && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            className="space-y-2 mt-2"
                          >
                            <Input
                              placeholder="Specify your custom communication method"
                              value={formData.customCommunicationMethod}
                              onChange={(e) => updateFormData("customCommunicationMethod", e.target.value)}
                              className="transition-all duration-300 focus:ring-2 focus:ring-primary/20"
                            />
                          </motion.div>
                        )}
                      </motion.div>

                      {/* Other Deliverables */}
                      <motion.div variants={fadeInUp} className="space-y-3">
                        <Label>Other Deliverables</Label>
                        <div className="grid grid-cols-1 gap-2">
                          {[
                            { value: "action-plan", label: "Quarterly Action Plan" },
                            { value: "assessments", label: "Periodic Assessments" },
                            { value: "exclusive-content", label: "Exclusive Material (ebooks, frameworks)" },
                            { value: "community", label: "Community/Network Access" },
                            { value: "exclusive-events", label: "Exclusive Events" },
                            { value: "other", label: "Other" },
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
                        {formData.otherDeliverables.includes("other") && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            className="space-y-2 mt-2"
                          >
                            <Input
                              placeholder="Specify your custom deliverable"
                              value={formData.customOtherDeliverable}
                              onChange={(e) => updateFormData("customOtherDeliverable", e.target.value)}
                              className="transition-all duration-300 focus:ring-2 focus:ring-primary/20"
                            />
                          </motion.div>
                        )}
                      </motion.div>
                    </CardContent>
                  </>
                )}

                {/* Step 4: Methodology & Outcomes */}
                {currentStep === 3 && (
                  <>
                    <CardHeader>
                      <CardTitle>Methodology & Outcomes</CardTitle>
                      <CardDescription>
                        How you work and measure success
                      </CardDescription>
                      {/* ⚓ ANCHOR: VALIDATION_CHECKLIST */}
                      {/* REASON: Show clear visual feedback of what's required vs optional */}
                      {/* PATTERN: Real-time checklist with green checkmarks and red warnings */}
                      {/* UX: User sees exactly what's missing before clicking Save */}
                      <div className="mt-4 p-4 rounded-lg border-2 border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-950/50">
                        <p className="font-semibold text-sm mb-2">📋 Required fields for this step:</p>
                        <ul className="space-y-1 text-sm">
                          <li className={cn(
                            "flex items-center gap-2",
                            formData.mentoringStyle !== "" ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"
                          )}>
                            {formData.mentoringStyle !== "" ? "✓" : "⚠️"}
                            <span className={formData.mentoringStyle === "" ? "font-semibold" : ""}>
                              Mentoring Style {formData.mentoringStyle === "" && "(Please select below)"}
                            </span>
                          </li>
                          <li className="flex items-center gap-2 text-muted-foreground">
                            ℹ️ Framework (optional)
                          </li>
                          <li className="flex items-center gap-2 text-muted-foreground">
                            ℹ️ Success Metrics (optional)
                          </li>
                        </ul>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <motion.div variants={fadeInUp} className="space-y-3">
                        <Label>Main framework</Label>
                        <RadioGroup
                          value={formData.framework}
                          onValueChange={(value) => updateFormData("framework", value)}
                          className="space-y-2"
                        >
                          {[
                            { value: "grow", label: "GROW (Goal, Reality, Options, Will)" },
                            { value: "okr", label: "OKRs (Objectives & Key Results)" },
                            { value: "smart", label: "SMART Goals" },
                            { value: "custom", label: "Custom Methodology" },
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
                          <Label htmlFor="customFramework">Describe your methodology:</Label>
                          <Textarea
                            id="customFramework"
                            placeholder="E.g.: I use a combination of design thinking + monthly accountability..."
                            value={formData.customFramework}
                            onChange={(e) => updateFormData("customFramework", e.target.value)}
                            rows={3}
                            className="transition-all duration-300 focus:ring-2 focus:ring-primary/20"
                          />
                        </motion.div>
                      )}

                      <motion.div variants={fadeInUp} className="space-y-3">
                        <Label className={cn(
                          "text-lg font-semibold",
                          formData.mentoringStyle === "" && "text-red-600 dark:text-red-400"
                        )}>
                          Mentoring style *
                          {formData.mentoringStyle === "" && (
                            <span className="ml-2 text-sm font-normal text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950 px-2 py-1 rounded">
                              ⚠️ Required - please select one option below
                            </span>
                          )}
                          {formData.mentoringStyle !== "" && (
                            <span className="ml-2 text-sm font-normal text-green-600 dark:text-green-400">
                              ✓ Selected
                            </span>
                          )}
                        </Label>
                        <RadioGroup
                          value={formData.mentoringStyle}
                          onValueChange={(value) => updateFormData("mentoringStyle", value)}
                          className={cn(
                            "space-y-2",
                            formData.mentoringStyle === "" && "border-2 border-red-400 dark:border-red-600 rounded-lg p-3 bg-red-50/50 dark:bg-red-950/50"
                          )}
                        >
                          {[
                            { value: "directive", label: "Directive (more direct guidance)" },
                            { value: "coaching", label: "Coaching (provocative questions)" },
                            { value: "facilitator", label: "Facilitator (mentee leads)" },
                            { value: "hybrid", label: "Hybrid (balanced)" },
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
                        <Label>How do you measure mentee success?</Label>
                        <div className="grid grid-cols-1 gap-2">
                          {[
                            { value: "revenue-growth", label: "Revenue Growth" },
                            { value: "goals-achievement", label: "Achievement of Defined Goals" },
                            { value: "leadership-dev", label: "Leadership Development" },
                            { value: "nps", label: "NPS / Satisfaction" },
                            { value: "renewal", label: "Contract Renewal" },
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

                {/* Step 5: Documents Upload */}
                {currentStep === 4 && (
                  <>
                    <CardHeader>
                      <CardTitle>Complementary Documents (Optional)</CardTitle>
                      <CardDescription>
                        Add profile photo and complementary documents
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <motion.div variants={fadeInUp} className="space-y-2">
                        <Label htmlFor="profilePhoto">Profile Photo</Label>
                        <Input
                          id="profilePhoto"
                          type="file"
                          accept="image/*"
                          onChange={(e) => {
                            const file = e.target.files?.[0] || null
                            updateFormData("profilePhoto", file)
                          }}
                          className="transition-all duration-300 focus:ring-2 focus:ring-primary/20"
                        />
                        <p className="text-xs text-muted-foreground">
                          Accepted formats: JPG, PNG, WEBP (max. 5MB)
                        </p>
                      </motion.div>

                      <motion.div variants={fadeInUp} className="space-y-2">
                        <Label htmlFor="additionalDocs">Additional Documents</Label>
                        <Input
                          id="additionalDocs"
                          type="file"
                          multiple
                          accept=".pdf,.doc,.docx,.txt"
                          onChange={(e) => {
                            const files = e.target.files ? Array.from(e.target.files) : []
                            updateFormData("additionalDocuments", files)
                          }}
                          className="transition-all duration-300 focus:ring-2 focus:ring-primary/20"
                        />
                        <p className="text-xs text-muted-foreground">
                          Frameworks, certificates, support materials (PDF, DOC, TXT - max. 10MB each)
                        </p>
                      </motion.div>

                      <div className="rounded-lg border border-blue-200 bg-blue-50 dark:bg-blue-950 dark:border-blue-800 p-4">
                        <p className="text-sm text-blue-800 dark:text-blue-200">
                          💡 <strong>Tip:</strong> You can skip this step and add documents later in your profile.
                        </p>
                      </div>
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
                  <ChevronLeft className="h-4 w-4" /> Back
                </Button>
              </motion.div>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button
                  type="button"
                  onClick={() => {
                    console.log(`[Button Click] Current step: ${currentStep}, Button text: ${currentStep === 3 ? "Save & Continue" : currentStep === 4 ? "Finish" : "Next"}`)

                    // ⚓ ANCHOR: ONBOARDING_SAVE_VALIDATION
                    // REASON: Show clear error when required fields missing
                    // PATTERN: Check validation before save, show toast with specific errors
                    // UX: User knows exactly what's missing instead of nothing happening
                    if (currentStep === 3) {
                      console.log("[Button Click] Step 4 (Methodology) - Checking validation...")
                      // Step 4 (Methodology): Validate before saving
                      const errors = getStepValidationErrors()
                      console.log("[Button Click] Validation errors:", errors)

                      if (errors.length > 0) {
                        console.log("[Button Click] ❌ Validation failed - showing errors to user")
                        toast.error(
                          <div className="space-y-2">
                            <p className="font-semibold">⚠️ Please fill in required fields:</p>
                            <ul className="list-disc list-inside space-y-1">
                              {errors.map((err, i) => <li key={i}>{err}</li>)}
                            </ul>
                          </div>,
                          { duration: 8000 }
                        )
                        return
                      }

                      console.log("[Button Click] ✅ Validation passed - calling saveOnboardingData()")
                      // Save data and advance to documents
                      saveOnboardingData()
                    } else if (currentStep === 4) {
                      console.log("[Button Click] Step 5 (Documents) - Final submit")
                      // Step 5 (Documents): Final submit
                      handleFinalSubmit()
                    } else {
                      console.log(`[Button Click] Step ${currentStep + 1} - Validating and advancing...`)
                      // Steps 1-3: Validate and advance
                      handleNextStep()
                    }
                  }}
                  disabled={isSubmitting}
                  className={cn(
                    "flex items-center gap-1 transition-all duration-300 rounded-2xl",
                    (!isStepValid() && currentStep !== 4) && "opacity-50 cursor-not-allowed"
                  )}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" /> Saving...
                    </>
                  ) : (
                    <>
                      {currentStep === 3 ? "Save & Continue" : currentStep === 4 ? "Finish" : "Next"}
                      {currentStep === 4 ? (
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
        Step {currentStep + 1} of {steps.length}: {steps[currentStep].title}
      </motion.div>
    </div>
  )
}
