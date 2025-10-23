"use client"

import { motion } from "framer-motion"
import { CircleCheck, ChevronLeft, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

interface OnboardingProgressProps {
  currentStep: number
  totalSteps: number
  onBack: () => void
  onContinue: () => void
  onFinish?: () => void
  loading?: boolean
  isFirstStep: boolean
  isFinalStep: boolean
}

export function OnboardingProgress({
  currentStep,
  totalSteps,
  onBack,
  onContinue,
  onFinish,
  loading = false,
  isFirstStep,
  isFinalStep,
}: OnboardingProgressProps) {
  const isExpanded = isFirstStep

  // Calculate progress bar width based on current step
  const getProgressWidth = () => {
    const baseWidth = 24 // Width for first dot
    const gapWidth = 36 // Width between dots (24px dot + 12px gap)
    return baseWidth + (currentStep - 1) * gapWidth
  }

  return (
    <div className="flex flex-col items-center justify-center gap-8">
      {/* Progress Dots */}
      <div className="flex items-center gap-6 relative">
        {Array.from({ length: totalSteps }, (_, i) => i + 1).map((dot) => (
          <div
            key={dot}
            className={cn(
              "w-2 h-2 rounded-full relative z-10 transition-colors duration-300",
              dot <= currentStep ? "bg-white" : "bg-muted-foreground/30"
            )}
          />
        ))}

        {/* Green progress overlay (animated) */}
        <motion.div
          initial={{ width: "24px", height: "24px", x: 0 }}
          animate={{
            width: `${getProgressWidth()}px`,
            x: 0,
          }}
          className="absolute -left-[8px] -top-[8px] -translate-y-1/2 h-3 bg-green-500 rounded-full"
          transition={{
            type: "spring",
            stiffness: 300,
            damping: 20,
            mass: 0.8,
            bounce: 0.25,
            duration: 0.6,
          }}
        />
      </div>

      {/* Step indicator text */}
      <p className="text-sm text-muted-foreground font-medium">
        Etapa {currentStep} de {totalSteps}
      </p>

      {/* Buttons container */}
      <div className="w-full max-w-sm">
        <motion.div
          className="flex items-center gap-2"
          animate={{
            justifyContent: isExpanded ? "stretch" : "space-between",
          }}
        >
          {/* Back button (appears after step 1) */}
          {!isExpanded && (
            <motion.div
              initial={{ opacity: 0, width: 0, scale: 0.8 }}
              animate={{ opacity: 1, width: "auto", scale: 1 }}
              exit={{ opacity: 0, width: 0, scale: 0.8 }}
              transition={{
                type: "spring",
                stiffness: 400,
                damping: 15,
                mass: 0.8,
                bounce: 0.25,
                duration: 0.6,
                opacity: { duration: 0.2 },
              }}
            >
              <Button
                type="button"
                variant="outline"
                onClick={onBack}
                disabled={loading}
                className="px-6"
              >
                <ChevronLeft className="mr-1 h-4 w-4" />
                Anterior
              </Button>
            </motion.div>
          )}

          {/* Continue/Finish button */}
          <motion.div
            animate={{
              flex: isExpanded ? 1 : "inherit",
            }}
            transition={{
              type: "spring",
              stiffness: 300,
              damping: 20,
            }}
            className="flex-1"
          >
            <Button
              type="button"
              onClick={isFinalStep ? onFinish || onContinue : onContinue}
              disabled={loading}
              className={cn(
                "w-full font-semibold transition-all",
                isFinalStep && "bg-green-600 hover:bg-green-700"
              )}
            >
              <div className="flex items-center justify-center gap-2">
                {isFinalStep && (
                  <motion.div
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{
                      type: "spring",
                      stiffness: 500,
                      damping: 15,
                      mass: 0.5,
                      bounce: 0.4,
                    }}
                  >
                    <CircleCheck size={16} />
                  </motion.div>
                )}
                {loading
                  ? "Salvando..."
                  : isFinalStep
                    ? "Concluir"
                    : "Próximo"}
                {!isFinalStep && !loading && (
                  <ChevronRight className="ml-1 h-4 w-4" />
                )}
              </div>
            </Button>
          </motion.div>
        </motion.div>
      </div>
    </div>
  )
}
