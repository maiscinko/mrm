import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"
import Anthropic from "@anthropic-ai/sdk"
import { rateLimit } from "@/lib/rate-limit"
import { validateServerEnv } from "@/lib/config"

validateServerEnv()

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
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

    const rateLimitResult = await rateLimit(`renewal-plan:${user.id}`, {
      maxRequests: 3,
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

    // Fetch complete mentee data
    const { data: mentee } = await supabase
      .from("mentees")
      .select("*, sessions(*), deliverables(*)")
      .eq("id", menteeId)
      .eq("mentor_id", user.id)
      .single()

    if (!mentee) {
      return NextResponse.json({ error: "Mentee not found" }, { status: 404 })
    }

    const totalDeliverables = mentee.deliverables?.length || 0
    const completedDeliverables = mentee.deliverables?.filter((d) => d.status === "completed").length || 0
    const progressPercentage = totalDeliverables > 0 ? Math.round((completedDeliverables / totalDeliverables) * 100) : 0

    const pendingDeliverables =
      mentee.deliverables?.filter((d) => d.status !== "completed" && d.status !== "cancelled") || []

    const context = `
Mentee: ${mentee.full_name}
Company: ${mentee.company || "N/A"}
Stated Goal: ${mentee.stated_goal}
Observed Pain: ${mentee.observed_pain || "Not yet identified"}

Current Plan:
- Duration: ${mentee.plan_duration_months} months
- Progress: ${progressPercentage}%
- Sessions Completed: ${mentee.sessions?.length || 0}
- Deliverables: ${completedDeliverables}/${totalDeliverables} completed

Pending Deliverables:
${pendingDeliverables.map((d) => `- ${d.task}`).join("\n") || "None"}

Recent Session Themes:
${
  mentee.sessions
    ?.slice(-3)
    .map((s) => `- ${s.theme || "Session"} (${new Date(s.session_date).toLocaleDateString()})`)
    .join("\n") || "No sessions yet"
}
`

    const message = await anthropic.messages.create({
      model: "claude-3-5-sonnet-20241022",
      max_tokens: 1024,
      messages: [
        {
          role: "user",
          content: `You are an expert mentor helping to create a renewal proposal for a mentee. Based on the context below, write a compelling 3-paragraph proposal for the next phase of mentoring (next 3-6 months).

Paragraph 1: Acknowledge progress made and key achievements
Paragraph 2: Identify gaps and areas that need more work
Paragraph 3: Propose focus areas for the next phase with specific outcomes

Be specific, actionable, and compelling. The goal is to show clear value and make the mentee want to continue.

Context:
${context}`,
        },
      ],
    })

    const proposal = message.content[0].type === "text" ? message.content[0].text : "Unable to generate proposal"

    // Cache result
    await supabase.from("ai_insights").insert({
      mentee_id: menteeId,
      insight_type: "renewal_plan",
      content: { proposal, generated_at: new Date().toISOString() },
    })

    return NextResponse.json({ proposal })
  } catch (error) {
    console.error("[v0] Error generating renewal plan:", error)
    return NextResponse.json({ error: "Failed to generate renewal plan" }, { status: 500 })
  }
}
