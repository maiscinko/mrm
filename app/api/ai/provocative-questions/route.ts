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

    const rateLimitResult = await rateLimit(`provocative-questions:${user.id}`, {
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

    const { menteeId } = await request.json()

    if (!menteeId) {
      return NextResponse.json({ error: "menteeId is required" }, { status: 400 })
    }

    // Fetch mentee and recent sessions
    const { data: mentee } = await supabase
      .from("mentees")
      .select("*, sessions(*)")
      .eq("id", menteeId)
      .eq("mentor_id", user.id)
      .single()

    if (!mentee) {
      return NextResponse.json({ error: "Mentee not found" }, { status: 404 })
    }

    // Get mentor's AI tone preference
    const { data: mentorData } = await supabase.from("users").select("ai_tone").eq("id", user.id).single()

    const aiTone = mentorData?.ai_tone || "empathetic"

    const toneInstructions = {
      provocative: "Be challenging and thought-provoking. Push the mentee to think deeper.",
      empathetic: "Be supportive and understanding. Help the mentee feel heard.",
      direct: "Be straightforward and to the point. Focus on actionable insights.",
    }

    const recentSessions = mentee.sessions
      ?.sort((a, b) => new Date(b.session_date).getTime() - new Date(a.session_date).getTime())
      .slice(0, 3)

    const sessionsContext = recentSessions
      ?.map(
        (s) => `${new Date(s.session_date).toLocaleDateString()}: ${s.theme || "Session"} - ${s.notes?.slice(0, 200)}`,
      )
      .join("\n")

    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `You are an AI assistant helping mentors prepare for sessions. Generate 3 provocative, insightful questions based on the mentee's history. ${toneInstructions[aiTone]} Return ONLY the 3 questions, numbered 1-3.`,
        },
        {
          role: "user",
          content: `Mentee: ${mentee.full_name}\nGoal: ${mentee.stated_goal}\n\nRecent sessions:\n${sessionsContext || "No recent sessions"}\n\nGenerate 3 questions for the next session.`,
        },
      ],
      temperature: 0.8,
      max_tokens: 300,
    })

    const aiResponse = completion.choices[0]?.message?.content || ""
    const questions = aiResponse
      .split("\n")
      .filter((line) => line.match(/^\d+\./))
      .map((line) => line.replace(/^\d+\.\s*/, "").trim())

    // Cache result
    await supabase.from("ai_insights").insert({
      mentee_id: menteeId,
      insight_type: "provocative_questions",
      content: { questions },
    })

    return NextResponse.json({ questions })
  } catch (error) {
    console.error("[v0] Error generating questions:", error)
    return NextResponse.json({ error: "Failed to generate questions" }, { status: 500 })
  }
}
