export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          full_name: string | null
          bio: string | null
          specialties: string[] | null
          languages: string[] | null
          mls_member: boolean
          mls_code: string | null
          ai_tone: "provocative" | "empathetic" | "direct"
          theme: "light" | "dark"
          created_at: string
        }
        Insert: {
          id: string
          email: string
          full_name?: string | null
          bio?: string | null
          specialties?: string[] | null
          languages?: string[] | null
          mls_member?: boolean
          mls_code?: string | null
          ai_tone?: "provocative" | "empathetic" | "direct"
          theme?: "light" | "dark"
          created_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          bio?: string | null
          specialties?: string[] | null
          languages?: string[] | null
          mls_member?: boolean
          mls_code?: string | null
          ai_tone?: "provocative" | "empathetic" | "direct"
          theme?: "light" | "dark"
          created_at?: string
        }
      }
      mentees: {
        Row: {
          id: string
          mentor_id: string
          full_name: string
          photo_url: string | null
          company: string | null
          role: string | null
          stated_goal: string | null
          observed_pain: string | null
          plan_duration_months: number
          plan_start_date: string
          plan_end_date: string
          status: "active" | "renewal_due" | "completed" | "cancelled"
          baseline_clarity_score: number | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          mentor_id: string
          full_name: string
          photo_url?: string | null
          company?: string | null
          role?: string | null
          stated_goal?: string | null
          observed_pain?: string | null
          plan_duration_months?: number
          plan_start_date: string
          plan_end_date: string
          status?: "active" | "renewal_due" | "completed" | "cancelled"
          baseline_clarity_score?: number | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          mentor_id?: string
          full_name?: string
          photo_url?: string | null
          company?: string | null
          role?: string | null
          stated_goal?: string | null
          observed_pain?: string | null
          plan_duration_months?: number
          plan_start_date?: string
          plan_end_date?: string
          status?: "active" | "renewal_due" | "completed" | "cancelled"
          baseline_clarity_score?: number | null
          created_at?: string
          updated_at?: string
        }
      }
      sessions: {
        Row: {
          id: string
          mentee_id: string
          session_date: string
          theme: string | null
          notes: string | null
          next_steps: string | null
          emotion_tag: "frustrated" | "hopeful" | "confused" | "excited" | "stuck" | null
          result_tag: "breakthrough" | "incremental" | "stuck" | null
          ai_summary: string | null
          created_at: string
        }
        Insert: {
          id?: string
          mentee_id: string
          session_date: string
          theme?: string | null
          notes?: string | null
          next_steps?: string | null
          emotion_tag?: "frustrated" | "hopeful" | "confused" | "excited" | "stuck" | null
          result_tag?: "breakthrough" | "incremental" | "stuck" | null
          ai_summary?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          mentee_id?: string
          session_date?: string
          theme?: string | null
          notes?: string | null
          next_steps?: string | null
          emotion_tag?: "frustrated" | "hopeful" | "confused" | "excited" | "stuck" | null
          result_tag?: "breakthrough" | "incremental" | "stuck" | null
          ai_summary?: string | null
          created_at?: string
        }
      }
      deliverables: {
        Row: {
          id: string
          mentee_id: string
          task: string
          responsible: "mentor" | "mentee"
          due_date: string | null
          status: "pending" | "in_progress" | "completed" | "cancelled"
          comment: string | null
          created_at: string
          completed_at: string | null
        }
        Insert: {
          id?: string
          mentee_id: string
          task: string
          responsible?: "mentor" | "mentee"
          due_date?: string | null
          status?: "pending" | "in_progress" | "completed" | "cancelled"
          comment?: string | null
          created_at?: string
          completed_at?: string | null
        }
        Update: {
          id?: string
          mentee_id?: string
          task?: string
          responsible?: "mentor" | "mentee"
          due_date?: string | null
          status?: "pending" | "in_progress" | "completed" | "cancelled"
          comment?: string | null
          created_at?: string
          completed_at?: string | null
        }
      }
      progress_tracking: {
        Row: {
          id: string
          mentee_id: string
          measurement_date: string
          clarity_score: number | null
          deliverables_completed_count: number
          sentiment_avg: "negative" | "neutral" | "positive" | null
          created_at: string
        }
        Insert: {
          id?: string
          mentee_id: string
          measurement_date: string
          clarity_score?: number | null
          deliverables_completed_count?: number
          sentiment_avg?: "negative" | "neutral" | "positive" | null
          created_at?: string
        }
        Update: {
          id?: string
          mentee_id?: string
          measurement_date?: string
          clarity_score?: number | null
          deliverables_completed_count?: number
          sentiment_avg?: "negative" | "neutral" | "positive" | null
          created_at?: string
        }
      }
      ai_insights: {
        Row: {
          id: string
          mentee_id: string
          insight_type: "session_summary" | "provocative_questions" | "renewal_plan" | "observed_pain"
          content: Json
          generated_at: string
        }
        Insert: {
          id?: string
          mentee_id: string
          insight_type: "session_summary" | "provocative_questions" | "renewal_plan" | "observed_pain"
          content: Json
          generated_at?: string
        }
        Update: {
          id?: string
          mentee_id?: string
          insight_type?: "session_summary" | "provocative_questions" | "renewal_plan" | "observed_pain"
          content?: Json
          generated_at?: string
        }
      }
      ai_chat_history: {
        Row: {
          id: string
          mentee_id: string
          mentor_id: string
          message: string
          role: "user" | "assistant"
          created_at: string
        }
        Insert: {
          id?: string
          mentee_id: string
          mentor_id: string
          message: string
          role: "user" | "assistant"
          created_at?: string
        }
        Update: {
          id?: string
          mentee_id?: string
          mentor_id?: string
          message?: string
          role?: "user" | "assistant"
          created_at?: string
        }
      }
      mentee_notes: {
        Row: {
          id: string
          mentee_id: string
          mentor_id: string
          note_text: string
          note_type: string | null
          created_by_role: string
          created_at: string
        }
        Insert: {
          id?: string
          mentee_id: string
          mentor_id: string
          note_text: string
          note_type?: string | null
          created_by_role: string
          created_at?: string
        }
        Update: {
          id?: string
          mentee_id?: string
          mentor_id?: string
          note_text?: string
          note_type?: string | null
          created_by_role?: string
          created_at?: string
        }
      }
      ai_prompts: {
        Row: {
          id: string
          prompt_name: string
          system_prompt: string
          description: string | null
          version: number
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          prompt_name: string
          system_prompt: string
          description?: string | null
          version?: number
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          prompt_name?: string
          system_prompt?: string
          description?: string | null
          version?: number
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      mrm_memory: {
        Row: {
          id: string
          change_type: string
          change_description: string
          created_by: string
          created_at: string
        }
        Insert: {
          id?: string
          change_type: string
          change_description: string
          created_by: string
          created_at?: string
        }
        Update: {
          id?: string
          change_type?: string
          change_description?: string
          created_by?: string
          created_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}
