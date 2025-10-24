"use client"

import { useState, useEffect } from "react"
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

export default function ProfilePage() {
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [profile, setProfile] = useState({
    full_name: "",
    bio: "",
    specialties: [] as string[],
    ai_tone: "empathetic" as "provocative" | "empathetic" | "direct",
    mls_member: false,
    mls_code: "",
  })
  const [specialtyInput, setSpecialtyInput] = useState("")
  const supabase = createClient()
  const router = useRouter()

  useEffect(() => {
    loadProfile()
  }, [])

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

      if (error) throw error

      if (data) {
        setProfile({
          full_name: data.full_name || "",
          bio: data.bio || "",
          specialties: data.specialties || [],
          ai_tone: data.mentoring_style || "empathetic",
          mls_member: data.is_mls_member || false,
          mls_code: data.mls_code || "",
        })
      }
    } catch (error) {
      console.error("[v0] Error loading profile:", error)
      toast.error("Failed to load profile")
    } finally {
      setIsLoading(false)
    }
  }

  const saveProfile = async () => {
    setIsSaving(true)
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) throw new Error("Not authenticated")

      const { error } = await supabase
        .from("mentor_profiles")
        .update({
          full_name: profile.full_name,
          bio: profile.bio,
          specialties: profile.specialties,
          mentoring_style: profile.ai_tone,
        })
        .eq("user_id", user.id)

      if (error) throw error

      toast.success("Profile updated successfully")
    } catch (error) {
      console.error("[v0] Error saving profile:", error)
      toast.error("Failed to save profile")
    } finally {
      setIsSaving(false)
    }
  }

  const addSpecialty = () => {
    if (specialtyInput.trim() && !profile.specialties.includes(specialtyInput.trim())) {
      setProfile({ ...profile, specialties: [...profile.specialties, specialtyInput.trim()] })
      setSpecialtyInput("")
    }
  }

  const removeSpecialty = (specialty: string) => {
    setProfile({ ...profile, specialties: profile.specialties.filter((s) => s !== specialty) })
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
              <div className="space-y-2">
                <Label htmlFor="full_name">Full Name</Label>
                <Input
                  id="full_name"
                  value={profile.full_name}
                  onChange={(e) => setProfile({ ...profile, full_name: e.target.value })}
                  placeholder="Your full name"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="bio">Bio</Label>
                <Textarea
                  id="bio"
                  value={profile.bio}
                  onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
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
              <div className="space-y-2">
                <Label htmlFor="ai_tone">AI Tone</Label>
                <Select
                  value={profile.ai_tone}
                  onValueChange={(value: "provocative" | "empathetic" | "direct") =>
                    setProfile({ ...profile, ai_tone: value })
                  }
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

          <div className="flex justify-end">
            <Button onClick={saveProfile} disabled={isSaving} size="lg">
              {isSaving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Profile"
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
