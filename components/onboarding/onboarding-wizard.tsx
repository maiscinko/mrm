"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { ChevronLeft, ChevronRight, Check } from "lucide-react"
import { PersonalInfoStep } from "./steps/personal-info-step"
import { AboutYouStep } from "./steps/about-you-step"
import { PreferencesStep } from "./steps/preferences-step"
import { FamilyStep } from "./steps/family-step"
import { BusinessStep } from "./steps/business-step"
import { PrivacyConsentStep } from "./steps/privacy-consent-step"

interface OnboardingWizardProps {
  menteeId: string
  menteeName: string
  menteeEmail: string
}

// ⚓ ANCHOR: ONBOARDING WIZARD MAIN COMPONENT
// REASON: 6-step comprehensive mentee profile collection
// PATTERN: useState for step management, JSONB updates for personal_info/business_goals
// UX: Progress bar, back/next navigation, auto-save on step change, clear validation
export function OnboardingWizard({ menteeId, menteeName, menteeEmail }: OnboardingWizardProps) {
  const [currentStep, setCurrentStep] = useState(1)
  const [wizardData, setWizardData] = useState({
    personal: {},
    about: {},
    preferences: {},
    family: {},
    business: {},
    privacy: {},
  })

  const totalSteps = 6
  const progress = (currentStep / totalSteps) * 100

  const steps = [
    { number: 1, title: "Personal Info", description: "Basic information and address" },
    { number: 2, title: "About You", description: "Personal details" },
    { number: 3, title: "Preferences", description: "Sizes, colors, hobbies" },
    { number: 4, title: "Family", description: "Spouse, children, emergency contact" },
    { number: 5, title: "Business", description: "Companies and professional goals" },
    { number: 6, title: "Privacy", description: "Consent and finalize" },
  ]

  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleStepData = (stepKey: string, data: any) => {
    setWizardData((prev) => ({
      ...prev,
      [stepKey]: data,
    }))
  }

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <PersonalInfoStep
            menteeId={menteeId}
            data={wizardData.personal}
            onDataChange={(data) => handleStepData("personal", data)}
            onNext={handleNext}
          />
        )
      case 2:
        return (
          <AboutYouStep
            menteeId={menteeId}
            data={wizardData.about}
            onDataChange={(data) => handleStepData("about", data)}
            onNext={handleNext}
            onBack={handleBack}
          />
        )
      case 3:
        return (
          <PreferencesStep
            menteeId={menteeId}
            data={wizardData.preferences}
            onDataChange={(data) => handleStepData("preferences", data)}
            onNext={handleNext}
            onBack={handleBack}
          />
        )
      case 4:
        return (
          <FamilyStep
            menteeId={menteeId}
            data={wizardData.family}
            onDataChange={(data) => handleStepData("family", data)}
            onNext={handleNext}
            onBack={handleBack}
          />
        )
      case 5:
        return (
          <BusinessStep
            menteeId={menteeId}
            data={wizardData.business}
            onDataChange={(data) => handleStepData("business", data)}
            onNext={handleNext}
            onBack={handleBack}
          />
        )
      case 6:
        return (
          <PrivacyConsentStep
            menteeId={menteeId}
            menteeName={menteeName}
            menteeEmail={menteeEmail}
            data={wizardData.privacy}
            onDataChange={(data) => handleStepData("privacy", data)}
            onBack={handleBack}
          />
        )
      default:
        return null
    }
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-12">
      {/* Header */}
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold">Welcome, {menteeName}! 👋</h1>
        <p className="mt-2 text-muted-foreground">
          Complete your profile to start your mentoring journey. This should take about 10-15 minutes.
        </p>
      </div>

      {/* Progress Bar */}
      <div className="mb-8">
        <div className="mb-4 flex items-center justify-between text-sm">
          <span className="font-medium">
            Step {currentStep} of {totalSteps}
          </span>
          <span className="text-muted-foreground">{Math.round(progress)}% Complete</span>
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      {/* Step Navigation Dots */}
      <div className="mb-8 flex justify-center gap-2">
        {steps.map((step) => (
          <div
            key={step.number}
            className={`flex h-10 w-10 items-center justify-center rounded-full border-2 text-sm font-medium transition-all ${
              step.number === currentStep
                ? "border-primary bg-primary text-primary-foreground"
                : step.number < currentStep
                  ? "border-green-600 bg-green-600 text-white"
                  : "border-muted bg-background text-muted-foreground"
            }`}
          >
            {step.number < currentStep ? <Check className="h-5 w-5" /> : step.number}
          </div>
        ))}
      </div>

      {/* Current Step Title */}
      <div className="mb-6 text-center">
        <h2 className="text-2xl font-semibold">{steps[currentStep - 1].title}</h2>
        <p className="text-sm text-muted-foreground">{steps[currentStep - 1].description}</p>
      </div>

      {/* Step Content */}
      <div className="rounded-lg border bg-card p-8 shadow-sm">{renderStep()}</div>

      {/* Footer Help Text */}
      <div className="mt-6 text-center text-xs text-muted-foreground">
        <p>All information is encrypted and protected. Only your mentor will have access to your profile.</p>
      </div>
    </div>
  )
}
