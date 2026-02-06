export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      subjects: {
        Row: {
          id: string
          name: string
          exam_date: string
          color: string | null
          icon: string | null
          created_at: string
          parent_subject_id: string | null
        }
        Insert: {
          id?: string
          name: string
          exam_date: string
          color?: string | null
          icon?: string | null
          created_at?: string
          parent_subject_id?: string | null
        }
        Update: {
          id?: string
          name?: string
          exam_date?: string
          color?: string | null
          icon?: string | null
          created_at?: string
          parent_subject_id?: string | null
        }
      }
      cards: {
        Row: {
          id: string
          user_id: string
          subject_id: string
          front: string
          back: string
          card_type: string
          options: Json | null
          correct_option: number | null
          tags: string[] | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          subject_id: string
          front: string
          back: string
          card_type?: string
          options?: Json | null
          correct_option?: number | null
          tags?: string[] | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          subject_id?: string
          front?: string
          back?: string
          card_type?: string
          options?: Json | null
          correct_option?: number | null
          tags?: string[] | null
          created_at?: string
        }
      }
      reviews: {
        Row: {
          id: string
          card_id: string
          user_id: string
          quality: number
          easiness: number
          interval: number
          repetitions: number
          next_review: string
          reviewed_at: string
        }
        Insert: {
          id?: string
          card_id: string
          user_id: string
          quality: number
          easiness?: number
          interval?: number
          repetitions?: number
          next_review?: string
          reviewed_at?: string
        }
        Update: {
          id?: string
          card_id?: string
          user_id?: string
          quality?: number
          easiness?: number
          interval?: number
          repetitions?: number
          next_review?: string
          reviewed_at?: string
        }
      }
      study_sessions: {
        Row: {
          id: string
          user_id: string
          subject_id: string
          duration_minutes: number | null
          cards_reviewed: number | null
          cards_correct: number | null
          xp_earned: number | null
          session_date: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          subject_id: string
          duration_minutes?: number | null
          cards_reviewed?: number | null
          cards_correct?: number | null
          xp_earned?: number | null
          session_date?: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          subject_id?: string
          duration_minutes?: number | null
          cards_reviewed?: number | null
          cards_correct?: number | null
          xp_earned?: number | null
          session_date?: string
          created_at?: string
        }
      }
      user_stats: {
        Row: {
          user_id: string
          total_xp: number
          current_streak: number
          longest_streak: number
          level: number
          last_study_date: string | null
          achievements: Json
        }
        Insert: {
          user_id: string
          total_xp?: number
          current_streak?: number
          longest_streak?: number
          level?: number
          last_study_date?: string | null
          achievements?: Json
        }
        Update: {
          user_id?: string
          total_xp?: number
          current_streak?: number
          longest_streak?: number
          level?: number
          last_study_date?: string | null
          achievements?: Json
        }
      }
      daily_goals: {
        Row: {
          id: string
          user_id: string
          goal_date: string
          target_minutes: number
          target_cards: number
          completed_minutes: number
          completed_cards: number
          completed: boolean
        }
        Insert: {
          id?: string
          user_id: string
          goal_date?: string
          target_minutes?: number
          target_cards?: number
          completed_minutes?: number
          completed_cards?: number
          completed?: boolean
        }
        Update: {
          id?: string
          user_id?: string
          goal_date?: string
          target_minutes?: number
          target_cards?: number
          completed_minutes?: number
          completed_cards?: number
          completed?: boolean
        }
      }
    }
  }
}
