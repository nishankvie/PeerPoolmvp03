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
      profiles: {
        Row: {
          id: string
          email: string
          full_name: string | null
          avatar_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          full_name?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      availability_blocks: {
        Row: {
          id: string
          user_id: string
          start_time: string
          end_time: string
          status: 'available' | 'busy' | 'maybe'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          start_time: string
          end_time: string
          status?: 'available' | 'busy' | 'maybe'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          start_time?: string
          end_time?: string
          status?: 'available' | 'busy' | 'maybe'
          created_at?: string
          updated_at?: string
        }
      }
      hangouts: {
        Row: {
          id: string
          title: string
          description: string | null
          creator_id: string
          start_time: string | null
          end_time: string | null
          status: 'planning' | 'confirmed' | 'cancelled' | 'completed'
          is_public: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          description?: string | null
          creator_id: string
          start_time?: string | null
          end_time?: string | null
          status?: 'planning' | 'confirmed' | 'cancelled' | 'completed'
          is_public?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          description?: string | null
          creator_id?: string
          start_time?: string | null
          end_time?: string | null
          status?: 'planning' | 'confirmed' | 'cancelled' | 'completed'
          is_public?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      hangout_participants: {
        Row: {
          id: string
          hangout_id: string
          user_id: string
          status: 'invited' | 'accepted' | 'declined' | 'maybe'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          hangout_id: string
          user_id: string
          status?: 'invited' | 'accepted' | 'declined' | 'maybe'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          hangout_id?: string
          user_id?: string
          status?: 'invited' | 'accepted' | 'declined' | 'maybe'
          created_at?: string
          updated_at?: string
        }
      }
      friendships: {
        Row: {
          id: string
          user_id: string
          friend_id: string
          status: 'pending' | 'accepted' | 'blocked'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          friend_id: string
          status?: 'pending' | 'accepted' | 'blocked'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          friend_id?: string
          status?: 'pending' | 'accepted' | 'blocked'
          created_at?: string
          updated_at?: string
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

