import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import type { Database } from '@/lib/supabase/database.types'
import { onboardingSchema } from '@/lib/validations/onboarding'
import { ZodError } from 'zod'

export async function POST(request: Request) {
  const rawData = await request.json()

  console.log('[Onboarding] Received data:', JSON.stringify(rawData, null, 2))

  // Validate input with Zod
  let data
  try {
    data = onboardingSchema.parse(rawData)
    console.log('[Onboarding] Validation passed')
  } catch (error) {
    if (error instanceof ZodError) {
      console.error('[Onboarding] Validation error:', error.errors)
      return NextResponse.json(
        {
          error: 'Dados de onboarding inválidos',
          details: error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', ')
        },
        { status: 400 }
      )
    }
    throw error
  }

  const cookieStore = cookies()
  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          cookieStore.set({ name, value, ...options })
        },
        remove(name: string, options: CookieOptions) {
          cookieStore.set({ name, value: '', ...options })
        },
      },
    }
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    // Step 1: Create or update mentor profile
    const { data: profileData, error: profileError } = await supabase
      .from('mentor_profiles')
      .upsert({
        user_id: user.id,
        full_name: data.fullName,
        email: data.email,
        linkedin_url: data.linkedinUrl || null,
        instagram_url: data.instagramUrl || null,
        bio: data.bio || null,
        club_name: data.clubName || null,
        club_category: data.clubCategory,
        active_mentees: data.activeMentees,
        niche_area: data.nicheArea,
        main_sources: data.mainSources || [],
        other_source: data.otherSource || null,
        mentoring_style: data.mentoringStyle,
        framework: data.framework || null,
        custom_framework: data.customFramework || null,
        success_metrics: data.successMetrics || [],
        updated_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (profileError) {
      console.error('[Onboarding] Profile error:', profileError)
      return NextResponse.json(
        { error: 'Failed to create mentor profile', details: profileError.message },
        { status: 500 }
      )
    }

    console.log('[Onboarding] Profile created:', profileData)

    // Step 2: Create or update mentoring program structure
    const { data: programData, error: programError } = await supabase
      .from('mentoring_programs')
      .upsert({
        user_id: user.id,
        program_name: data.clubName || 'Main Program',
        // Group meetings (optional)
        group_deliverable_name: data.groupDeliverableName || null,
        group_meeting_format: data.groupMeetingFormat || null,
        group_meeting_frequency: data.groupMeetingFrequency || null,
        group_meeting_duration: data.groupMeetingDuration || null,
        // Individual 1-on-1 sessions (required)
        individual_total_in_period: data.individualTotalInPeriod,
        individual_duration: data.individualDuration,
        individual_format: data.individualFormat,
        // Communication methods
        communication_methods: data.communicationMethods || [],
        custom_communication_method: data.customCommunicationMethod || null,
        other_deliverables: data.otherDeliverables || [],
        custom_other_deliverable: data.customOtherDeliverable || null,
      })
      .select()
      .single()

    if (programError) {
      console.error('[Onboarding] Program error:', programError)
      return NextResponse.json(
        { error: 'Failed to create mentoring program', details: programError.message },
        { status: 500 }
      )
    }

    console.log('[Onboarding] Program created:', programData)

    return NextResponse.json({
      success: true,
      profile: profileData,
      program: programData,
    })
  } catch (error) {
    console.error('[Onboarding] Unexpected error:', error)
    return NextResponse.json(
      { error: 'Unexpected error during onboarding', details: String(error) },
      { status: 500 }
    )
  }
}

// GET route to check if mentor has completed onboarding
export async function GET() {
  const cookieStore = cookies()
  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          cookieStore.set({ name, value, ...options })
        },
        remove(name: string, options: CookieOptions) {
          cookieStore.set({ name, value: '', ...options })
        },
      },
    }
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Check if mentor profile exists
  const { data: profile, error } = await supabase
    .from('mentor_profiles')
    .select('id, full_name, club_category, club_name')
    .eq('user_id', user.id)
    .single()

  if (error || !profile) {
    return NextResponse.json({ completed: false })
  }

  // Check if at least one mentoring program exists
  const { data: programs } = await supabase
    .from('mentoring_programs')
    .select('id')
    .eq('user_id', user.id)
    .limit(1)

  return NextResponse.json({
    completed: !!programs && programs.length > 0,
    profile,
  })
}
