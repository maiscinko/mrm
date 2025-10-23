import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"
import OpenAI from "openai"
import { rateLimit } from "@/lib/rate-limit"
import { sanitizeText } from "@/lib/sanitize"
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

    const rateLimitResult = await rateLimit(`ai-chat:${user.id}`, {
      maxRequests: 10,
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

    const { menteeId, message } = await request.json()

    if (!menteeId || !message) {
      return NextResponse.json({ error: "menteeId and message are required" }, { status: 400 })
    }

    const sanitizedMessage = sanitizeText(message)

    // Fetch all context in parallel for performance
    const [menteeResult, mentorResult, sessionsResult, deliverablesResult, notesResult, promptResult] =
      await Promise.all([
        supabase.from("mentees").select("*").eq("id", menteeId).eq("mentor_id", user.id).single(),
        supabase.from("users").select("full_name, ai_tone").eq("id", user.id).single(),
        supabase
          .from("sessions")
          .select("*")
          .eq("mentee_id", menteeId)
          .order("session_date", { ascending: false })
          .limit(3),
        supabase.from("deliverables").select("*").eq("mentee_id", menteeId),
        supabase
          .from("mentee_notes")
          .select("*")
          .eq("mentee_id", menteeId)
          .order("created_at", { ascending: false })
          .limit(5),
        supabase
          .from("ai_prompts")
          .select("system_prompt")
          .eq("prompt_name", "chat_assistant")
          .eq("is_active", true)
          .single(),
      ])

    const mentee = menteeResult.data
    const mentor = mentorResult.data
    const sessions = sessionsResult.data || []
    const deliverables = deliverablesResult.data || []
    const notes = notesResult.data || []
    const promptData = promptResult.data

    if (!mentee) {
      return NextResponse.json({ error: "Mentee not found" }, { status: 404 })
    }

    // Calculate deliverables status
    const totalDeliverables = deliverables.length
    const completedDeliverables = deliverables.filter((d) => d.status === "completed").length
    const pendingDeliverables = deliverables.filter((d) => d.status === "pending" || d.status === "in_progress")

    // Prepare context variables
    const recentSessions = sessions
      .map(
        (s) =>
          `${new Date(s.session_date).toLocaleDateString()}: ${s.theme || "Session"}\nNotes: ${s.notes?.slice(0, 200) || "No notes"}\nNext Steps: ${s.next_steps || "None"}`,
      )
      .join("\n\n")

    const internalNotes = notes.map((n) => `[${n.created_by_role}] ${n.note_text}`).join("\n")

    // Use editable prompt from database or fallback to default
    let systemPrompt =
      promptData?.system_prompt ||
      `You are an AI assistant helping mentor {{mentor_name}} with their mentee {{mentee_name}}.

Context:
- Mentee Goal: {{mentee_goal}}
- Company: {{mentee_company}}
- Days Remaining: {{days_remaining}}
- AI Tone: {{mentor_ai_tone}}

Recent Sessions:
{{recent_sessions}}

Deliverables Status:
{{deliverables_status}}

Internal Notes (CS/Support):
{{internal_notes}}

Provide helpful, contextual responses based on this information. Be {{mentor_ai_tone}} in your tone.`

    // Replace template variables
    const daysRemaining = Math.ceil(
      (new Date(mentee.plan_end_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24),
    )

    systemPrompt = systemPrompt
      .replace(/{{mentor_name}}/g, mentor?.full_name || "Mentor")
      .replace(/{{mentee_name}}/g, mentee.full_name)
      .replace(/{{mentee_goal}}/g, mentee.stated_goal || "Not specified")
      .replace(/{{mentee_company}}/g, mentee.company || "N/A")
      .replace(/{{days_remaining}}/g, daysRemaining.toString())
      .replace(/{{mentor_ai_tone}}/g, mentor?.ai_tone || "empathetic")
      .replace(/{{recent_sessions}}/g, recentSessions || "No recent sessions")
      .replace(
        /{{deliverables_status}}/g,
        `${completedDeliverables}/${totalDeliverables} completed. ${pendingDeliverables.length} pending: ${pendingDeliverables.map((d) => d.task).join(", ")}`,
      )
      .replace(/{{internal_notes}}/g, internalNotes || "No internal notes")

    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: sanitizedMessage },
      ],
      temperature: 0.7,
      max_tokens: 500,
    })

    const aiResponse = completion.choices[0]?.message?.content || "I'm sorry, I couldn't generate a response."

    const sanitizedAiResponse = sanitizeText(aiResponse)

    // Save conversation to history
    await supabase.from("ai_chat_history").insert([
      {
        mentee_id: menteeId,
        mentor_id: user.id,
        message: sanitizedMessage,
        role: "user",
      },
      {
        mentee_id: menteeId,
        mentor_id: user.id,
        message: sanitizedAiResponse,
        role: "assistant",
      },
    ])

    return NextResponse.json({ response: sanitizedAiResponse })
  } catch (error) {
    console.error("[v0] Error in AI chat:", error)
    return NextResponse.json({ error: "Failed to process chat message" }, { status: 500 })
  }
}
