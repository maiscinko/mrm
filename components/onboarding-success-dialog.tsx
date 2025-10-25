"use client"

import { useState } from "react"
import { Check, Copy, Mail, MessageCircle, ExternalLink } from "lucide-react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"

interface OnboardingSuccessDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onboardingLink: string
  menteeName: string
  menteeEmail: string
  menteeWhatsapp: string
}

// ⚓ ANCHOR: ONBOARDING SUCCESS DIALOG
// REASON: After mentor creates mentee, show onboarding link for sharing
// PATTERN: Copy/Email/WhatsApp sharing options
// UX: Clear call-to-action buttons + visual feedback on copy
export function OnboardingSuccessDialog({
  open,
  onOpenChange,
  onboardingLink,
  menteeName,
  menteeEmail,
  menteeWhatsapp,
}: OnboardingSuccessDialogProps) {
  const [copied, setCopied] = useState(false)
  const { toast } = useToast()

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(onboardingLink)
      setCopied(true)
      toast({
        title: "Link copied!",
        description: "Onboarding link copied to clipboard",
      })
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      toast({
        title: "Failed to copy",
        description: "Please copy the link manually",
        variant: "destructive",
      })
    }
  }

  const handleEmail = () => {
    const subject = encodeURIComponent("Complete Your Mentoring Onboarding")
    const body = encodeURIComponent(`Hi ${menteeName},

Welcome to our mentoring program! Please complete your onboarding by clicking the link below:

${onboardingLink}

This link will expire in 30 days.

Looking forward to working with you!`)

    window.open(`mailto:${menteeEmail}?subject=${subject}&body=${body}`, "_blank")
  }

  const handleWhatsApp = () => {
    const text = encodeURIComponent(`Olá ${menteeName}! 👋

Bem-vindo(a) ao programa de mentoria!

Complete seu onboarding neste link:
${onboardingLink}

O link expira em 30 dias. Qualquer dúvida, só me avisar! 🚀`)

    // Remove + from whatsapp number for URL
    const whatsappNumber = menteeWhatsapp.replace(/\+/g, "")
    window.open(`https://wa.me/${whatsappNumber}?text=${text}`, "_blank")
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Mentee Created Successfully! 🎉</DialogTitle>
          <DialogDescription>
            Share the onboarding link below with <strong>{menteeName}</strong>. They'll complete their profile and be
            ready to start!
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Onboarding Link */}
          <div className="space-y-2">
            <Label htmlFor="onboarding-link">Onboarding Link</Label>
            <div className="flex gap-2">
              <Input id="onboarding-link" value={onboardingLink} readOnly className="font-mono text-sm" />
              <Button onClick={handleCopy} variant="outline" size="icon" className="shrink-0">
                {copied ? <Check className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4" />}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">Link expires in 30 days</p>
          </div>

          {/* Quick Actions */}
          <div className="space-y-3">
            <Label>Share via:</Label>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <Button onClick={handleCopy} variant="outline" className="justify-start">
                <Copy className="mr-2 h-4 w-4" />
                Copy Link
              </Button>
              <Button onClick={handleEmail} variant="outline" className="justify-start">
                <Mail className="mr-2 h-4 w-4" />
                Send Email
              </Button>
              <Button onClick={handleWhatsApp} variant="outline" className="justify-start">
                <MessageCircle className="mr-2 h-4 w-4" />
                WhatsApp
              </Button>
            </div>
          </div>

          {/* Preview Link */}
          <div className="rounded-lg border bg-muted/50 p-4">
            <div className="flex items-start gap-3">
              <ExternalLink className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">What happens next?</p>
                <p className="text-xs text-muted-foreground">
                  {menteeName} will fill out a comprehensive onboarding form (personal info, family, business goals,
                  etc.). Once completed, they'll appear in your dashboard as "Active".
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <Button onClick={() => onOpenChange(false)}>Done</Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
