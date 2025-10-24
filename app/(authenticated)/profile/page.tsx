"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import { Loader2 } from "lucide-react"

// ⚓ ANCHOR: TYPE DEFINITIONS
// REASON: Type safety for profile data and save operations
type ProfileData = {
  full_name: string
  bio: string
  specialties: string[]
  ai_tone: "provocative" | "empathetic" | "direct"
  mls_member: boolean
  mls_code: string
}

export default function ProfilePage() {
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [profile, setProfile] = useState<ProfileData>({
    full_name: "",
    bio: "",
    specialties: [],
    ai_tone: "empathetic",
    mls_member: false,
    mls_code: "",
  })
  const [specialtyInput, setSpecialtyInput] = useState("")
  const supabase = createClient()
  const router = useRouter()

  // ⚓ ANCHOR: DEBOUNCE TIMER
  // REASON: Prevent excessive DB writes (auto-save after 1s of no changes)
  const saveTimerRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    loadProfile()

    // ⚓ ANCHOR: CLEANUP TIMER ON UNMOUNT
    // REASON: Prevent memory leaks from pending debounced saves
    return () => {
      if (saveTimerRef.current) {
        clearTimeout(saveTimerRef.current)
      }
    }
  }, [])

  // ⚓ ANCHOR: LOAD PROFILE
  // REASON: Fetch mentor profile from DB on mount
  const loadProfile = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        router.push("/login")
        return
      }

      const { data, error } = await supabase
        .from("mentor_profiles")
        .select("*")
        .eq("user_id", user.id)
        .single()

      if (error) {
        console.error("[Profile] Load error:", error)
        throw error
      }

      if (data) {
        console.log("[Profile] Loaded:", data)

        // ⚓ ANCHOR: VALIDATE AI TONE
        // REASON: DB may have invalid values - default to empathetic if invalid
        const validTones = ["provocative", "empathetic", "direct"]
        const aiTone = validTones.includes(data.mentoring_style)
          ? (data.mentoring_style as "provocative" | "empathetic" | "direct")
          : "empathetic"

        console.log("[Profile] AI Tone:", data.mentoring_style, "→", aiTone)

        setProfile({
          full_name: data.full_name || "",
          bio: data.bio || "",
          specialties: data.specialties || [],
          ai_tone: aiTone,
          mls_member: data.is_mls_member || false,
          mls_code: data.mls_code || "",
        })
      }
    } catch (error) {
      console.error("[Profile] Error loading profile:", error)
      toast.error("Failed to load profile")
    } finally {
      setIsLoading(false)
    }
  }

  // ⚓ ANCHOR: AUTO-SAVE WITH DEBOUNCE
  // REASON: Save changes automatically after 1s of no typing (better UX than manual save button)
  // PATTERN: Debounced saves prevent excessive DB writes (e.g., typing "John" = 1 save, not 4)
  const autoSaveProfile = useCallback(
    async (updates: Partial<ProfileData>) => {
      console.log("[Profile] Auto-save START:", updates)

      try {
        const {
          data: { user },
          error: authError,
        } = await supabase.auth.getUser()

        console.log("[Profile] Auth check:", { user: user?.id, authError })

        if (!user) {
          console.error("[Profile] No user - redirecting to login")
          throw new Error("Not authenticated")
        }

        // ⚓ Map local field names to DB column names
        const dbUpdates: Record<string, any> = {}
        if ("full_name" in updates) dbUpdates.full_name = updates.full_name
        if ("bio" in updates) dbUpdates.bio = updates.bio
        if ("specialties" in updates) dbUpdates.specialties = updates.specialties
        if ("ai_tone" in updates) dbUpdates.mentoring_style = updates.ai_tone

        console.log("[Profile] Sending UPDATE to DB:", {
          updates: dbUpdates,
          userId: user.id,
        })

        const { error, data } = await supabase
          .from("mentor_profiles")
          .update(dbUpdates)
          .eq("user_id", user.id)
          .select()

        console.log("[Profile] DB Response:", { error, data })

        if (error) {
          console.error("[Profile] Save error DETAIL:", {
            message: error.message,
            details: error.details,
            hint: error.hint,
            code: error.code,
          })
          throw error
        }

        console.log("[Profile] ✅ Saved successfully to DB:", data)

        // ⚓ UX: Show success toast for AI Tone changes (immediate feedback)
        if ("mentoring_style" in dbUpdates) {
          toast.success("AI Tone updated successfully")
        }

        // ⚓ UX: Subtle feedback (no toast spam while typing)
        setIsSaving(false)
      } catch (error) {
        console.error("[Profile] Error auto-saving:", error)
        toast.error("Failed to save changes")
        setIsSaving(false)
      }
    },
    [supabase]
  )

  // ⚓ ANCHOR: DEBOUNCED UPDATE
  // REASON: Trigger auto-save 1s after user stops typing
  const debouncedSave = useCallback(
    (updates: Partial<ProfileData>) => {
      // Clear existing timer
      if (saveTimerRef.current) {
        clearTimeout(saveTimerRef.current)
      }

      // Show saving indicator immediately
      setIsSaving(true)

      // Set new timer for 1s
      saveTimerRef.current = setTimeout(() => {
        autoSaveProfile(updates)
      }, 1000)
    },
    [autoSaveProfile]
  )

  // ⚓ ANCHOR: SPECIALTY MANAGEMENT
  // REASON: Add/remove specialties with auto-save
  const addSpecialty = () => {
    if (specialtyInput.trim() && !profile.specialties.includes(specialtyInput.trim())) {
      const newSpecialties = [...profile.specialties, specialtyInput.trim()]
      setProfile({ ...profile, specialties: newSpecialties })
      setSpecialtyInput("")

      // ⚓ Auto-save immediately (no debounce for button clicks)
      autoSaveProfile({ specialties: newSpecialties })
    }
  }

  const removeSpecialty = (specialty: string) => {
    const newSpecialties = profile.specialties.filter((s) => s !== specialty)
    setProfile({ ...profile, specialties: newSpecialties })

    // ⚓ Auto-save immediately
    autoSaveProfile({ specialties: newSpecialties })
  }

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-3xl">
        <h1 className="text-3xl font-bold mb-8">Mentor Profile</h1>

        <div className="space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* ⚓ ANCHOR: FULL NAME INPUT */}
              {/* UX: Auto-save with debounce - saves 1s after user stops typing */}
              <div className="space-y-2">
                <Label htmlFor="full_name">Full Name</Label>
                <Input
                  id="full_name"
                  value={profile.full_name}
                  onChange={(e) => {
                    const newValue = e.target.value
                    setProfile({ ...profile, full_name: newValue })
                    debouncedSave({ full_name: newValue })
                  }}
                  placeholder="Your full name"
                />
              </div>

              {/* ⚓ ANCHOR: BIO INPUT */}
              {/* UX: Auto-save with debounce - saves 1s after user stops typing */}
              <div className="space-y-2">
                <Label htmlFor="bio">Bio</Label>
                <Textarea
                  id="bio"
                  value={profile.bio}
                  onChange={(e) => {
                    const newValue = e.target.value
                    setProfile({ ...profile, bio: newValue })
                    debouncedSave({ bio: newValue })
                  }}
                  placeholder="Tell us about yourself..."
                  rows={4}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="specialties">Specialties</Label>
                <div className="flex gap-2">
                  <Input
                    id="specialties"
                    value={specialtyInput}
                    onChange={(e) => setSpecialtyInput(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addSpecialty())}
                    placeholder="e.g., Leadership, Strategy"
                  />
                  <Button type="button" onClick={addSpecialty}>
                    Add
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                  {profile.specialties.map((specialty) => (
                    <Badge
                      key={specialty}
                      variant="secondary"
                      className="cursor-pointer"
                      onClick={() => removeSpecialty(specialty)}
                    >
                      {specialty} ×
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* AI Configuration */}
          <Card>
            <CardHeader>
              <CardTitle>AI Assistant Configuration</CardTitle>
              <p className="text-sm text-muted-foreground">Customize how the AI assistant interacts with you</p>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* ⚓ ANCHOR: AI TONE SELECT */}
              {/* UX: Auto-save immediately on change (no debounce for dropdowns) */}
              <div className="space-y-2">
                <Label htmlFor="ai_tone">AI Tone</Label>
                <Select
                  value={profile.ai_tone}
                  onValueChange={(value: "provocative" | "empathetic" | "direct") => {
                    setProfile({ ...profile, ai_tone: value })
                    autoSaveProfile({ ai_tone: value })
                  }}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="provocative">Provocative - Challenges thinking</SelectItem>
                    <SelectItem value="empathetic">Empathetic - Supportive and understanding</SelectItem>
                    <SelectItem value="direct">Direct - Straight to the point</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* MLS Badge */}
          {profile.mls_member && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Badge variant="default">MLS Member</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  You are a verified member of the Mentoring League Society
                </p>
                {profile.mls_code && (
                  <p className="text-sm mt-2">
                    Code: <span className="font-mono">{profile.mls_code}</span>
                  </p>
                )}
              </CardContent>
            </Card>
          )}

          {/* ⚓ ANCHOR: AUTO-SAVE INDICATOR */}
          {/* UX: Subtle feedback that changes are being saved automatically */}
          <div className="flex justify-end">
            {isSaving && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Saving...</span>
              </div>
            )}
            {!isSaving && (
              <div className="text-sm text-muted-foreground">
                All changes saved automatically
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
