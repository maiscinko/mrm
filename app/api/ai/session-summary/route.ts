import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"
import OpenAI from "openai"
import { rateLimit } from "@/lib/rate-limit"
import { validateServerEnv } from "@/lib/config"

validateServerEnv()

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function POST(request: Request) {
  try {
    const supabase = await createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const rateLimitResult = await rateLimit(`session-summary:${user.id}`, {
      maxRequests: 5,
      windowMs: 60000,
    })

    if (!rateLimitResult.success) {
      return NextResponse.json(
        {
          error: "Rate limit exceeded. Please try again later.",
          resetAt: rateLimitResult.resetAt,
        },
        { status: 429 },
      )
    }

    const { menteeId, sessionIds } = await request.json()

    if (!menteeId) {
      return NextResponse.json({ error: "menteeId is required" }, { status: 400 })
    }

    // Verify mentor owns this mentee
    const { data: mentee, error: menteeError } = await supabase
      .from("mentees")
      .select("*")
      .eq("id", menteeId)
      .eq("mentor_id", user.id)
      .single()

    if (menteeError || !mentee) {
      return NextResponse.json({ error: "Mentee not found" }, { status: 404 })
    }

    // Fetch last 3 sessions if sessionIds not provided
    const { data: sessions, error: sessionsError } = await supabase
      .from("sessions")
      .select("*")
      .eq("mentee_id", menteeId)
      .order("session_date", { ascending: false })
      .limit(3)

    if (sessionsError) {
      throw sessionsError
    }

    if (!sessions || sessions.length === 0) {
      return NextResponse.json({
        summary: "No sessions recorded yet. Start by adding your first session notes.",
        highlights: [],
      })
    }

    // Prepare context for AI
    const sessionsContext = sessions
      .map(
        (s, i) =>
          `Session ${i + 1} (${new Date(s.session_date).toLocaleDateString()}):\nTheme: ${s.theme || "N/A"}\nNotes: ${s.notes || "N/A"}\nNext Steps: ${s.next_steps || "N/A"}`,
      )
      .join("\n\n")

    // Call OpenAI
    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content:
            "You are an AI assistant helping mentors summarize their mentoring sessions. Provide a concise summary (max 200 words) highlighting key themes, progress, and patterns. Also extract 3-5 key highlights as bullet points.",
        },
        {
          role: "user",
          content: `Summarize these mentoring sessions for ${mentee.full_name}:\n\n${sessionsContext}`,
        },
      ],
      temperature: 0.7,
      max_tokens: 500,
    })

    const aiResponse = completion.choices[0]?.message?.content || "Unable to generate summary"

    // Parse response to extract summary and highlights
    const lines = aiResponse.split("\n").filter((line) => line.trim())
    const summary = lines.slice(0, 3).join(" ")
    const highlights = lines
      .filter((line) => line.startsWith("-") || line.startsWith("•"))
      .map((line) => line.replace(/^[-•]\s*/, ""))

    // Cache the result in ai_insights table
    await supabase.from("ai_insights").insert({
      mentee_id: menteeId,
      insight_type: "session_summary",
      content: { summary, highlights, sessions_analyzed: sessions.length },
    })

    return NextResponse.json({ summary, highlights })
  } catch (error) {
    console.error("[v0] Error generating session summary:", error)
    return NextResponse.json({ error: "Failed to generate summary" }, { status: 500 })
  }
}
