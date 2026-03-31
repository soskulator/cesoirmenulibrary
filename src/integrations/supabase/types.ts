export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      allergen_modifications: {
        Row: {
          allergen_type: string
          can_remove: boolean
          created_at: string
          id: string
          menu_item_id: string
          substitution_notes: string | null
          updated_at: string
        }
        Insert: {
          allergen_type: string
          can_remove?: boolean
          created_at?: string
          id?: string
          menu_item_id: string
          substitution_notes?: string | null
          updated_at?: string
        }
        Update: {
          allergen_type?: string
          can_remove?: boolean
          created_at?: string
          id?: string
          menu_item_id?: string
          substitution_notes?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      daily_focus_settings: {
        Row: {
          cocktail_id: string | null
          created_at: string
          created_by: string
          focus_date: string
          id: string
          menu_item_ids: string[]
          notes: string | null
          updated_at: string
        }
        Insert: {
          cocktail_id?: string | null
          created_at?: string
          created_by: string
          focus_date: string
          id?: string
          menu_item_ids?: string[]
          notes?: string | null
          updated_at?: string
        }
        Update: {
          cocktail_id?: string | null
          created_at?: string
          created_by?: string
          focus_date?: string
          id?: string
          menu_item_ids?: string[]
          notes?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      dish_ingredients: {
        Row: {
          allergens: string[] | null
          created_at: string
          id: string
          ingredient_name: string
          is_omittable: boolean
          menu_item_id: string
          omit_note: string | null
          sort_order: number
          updated_at: string
        }
        Insert: {
          allergens?: string[] | null
          created_at?: string
          id?: string
          ingredient_name: string
          is_omittable?: boolean
          menu_item_id: string
          omit_note?: string | null
          sort_order?: number
          updated_at?: string
        }
        Update: {
          allergens?: string[] | null
          created_at?: string
          id?: string
          ingredient_name?: string
          is_omittable?: boolean
          menu_item_id?: string
          omit_note?: string | null
          sort_order?: number
          updated_at?: string
        }
        Relationships: []
      }
      foh_test_answers: {
        Row: {
          admin_notes: string | null
          admin_override: boolean | null
          ai_feedback: string | null
          attempt_id: string
          correct_answer: string
          created_at: string
          id: string
          is_correct: boolean | null
          question_id: string
          question_text: string
          user_answer: string
        }
        Insert: {
          admin_notes?: string | null
          admin_override?: boolean | null
          ai_feedback?: string | null
          attempt_id: string
          correct_answer: string
          created_at?: string
          id?: string
          is_correct?: boolean | null
          question_id: string
          question_text: string
          user_answer: string
        }
        Update: {
          admin_notes?: string | null
          admin_override?: boolean | null
          ai_feedback?: string | null
          attempt_id?: string
          correct_answer?: string
          created_at?: string
          id?: string
          is_correct?: boolean | null
          question_id?: string
          question_text?: string
          user_answer?: string
        }
        Relationships: [
          {
            foreignKeyName: "foh_test_answers_attempt_id_fkey"
            columns: ["attempt_id"]
            isOneToOne: false
            referencedRelation: "foh_test_attempts"
            referencedColumns: ["id"]
          },
        ]
      }
      foh_test_attempts: {
        Row: {
          completed_at: string | null
          id: string
          is_reviewed: boolean | null
          percentage: number | null
          reviewed_at: string | null
          reviewed_by: string | null
          score: number | null
          started_at: string
          test_type: string
          total_questions: number | null
          user_id: string
        }
        Insert: {
          completed_at?: string | null
          id?: string
          is_reviewed?: boolean | null
          percentage?: number | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          score?: number | null
          started_at?: string
          test_type?: string
          total_questions?: number | null
          user_id: string
        }
        Update: {
          completed_at?: string | null
          id?: string
          is_reviewed?: boolean | null
          percentage?: number | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          score?: number | null
          started_at?: string
          test_type?: string
          total_questions?: number | null
          user_id?: string
        }
        Relationships: []
      }
      foh_test_questions: {
        Row: {
          category: string
          correct_answer: string
          correct_index: number | null
          created_at: string
          id: string
          is_active: boolean
          options: Json | null
          question: string
          test_type: string
          type: string
          updated_at: string
        }
        Insert: {
          category: string
          correct_answer: string
          correct_index?: number | null
          created_at?: string
          id?: string
          is_active?: boolean
          options?: Json | null
          question: string
          test_type?: string
          type: string
          updated_at?: string
        }
        Update: {
          category?: string
          correct_answer?: string
          correct_index?: number | null
          created_at?: string
          id?: string
          is_active?: boolean
          options?: Json | null
          question?: string
          test_type?: string
          type?: string
          updated_at?: string
        }
        Relationships: []
      }
      invitations: {
        Row: {
          accepted_at: string | null
          created_at: string
          email: string
          expires_at: string
          id: string
          invited_by: string
          role: Database["public"]["Enums"]["app_role"]
          token: string
        }
        Insert: {
          accepted_at?: string | null
          created_at?: string
          email: string
          expires_at?: string
          id?: string
          invited_by: string
          role?: Database["public"]["Enums"]["app_role"]
          token?: string
        }
        Update: {
          accepted_at?: string | null
          created_at?: string
          email?: string
          expires_at?: string
          id?: string
          invited_by?: string
          role?: Database["public"]["Enums"]["app_role"]
          token?: string
        }
        Relationships: []
      }
      menu_categories: {
        Row: {
          created_at: string
          icon: string
          id: string
          is_active: boolean
          name: string
          name_french: string
          sort_order: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          icon?: string
          id: string
          is_active?: boolean
          name: string
          name_french?: string
          sort_order?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          icon?: string
          id?: string
          is_active?: boolean
          name?: string
          name_french?: string
          sort_order?: number
          updated_at?: string
        }
        Relationships: []
      }
      menu_items: {
        Row: {
          allergens: string[]
          category_id: string
          created_at: string
          id: string
          image_url: string
          ingredients_text: string
          is_published: boolean
          long_description: string
          name: string
          prep_notes: string
          questions: Json
          selling_points_text: string
          short_description: string
          updated_at: string
        }
        Insert: {
          allergens?: string[]
          category_id: string
          created_at?: string
          id: string
          image_url?: string
          ingredients_text?: string
          is_published?: boolean
          long_description?: string
          name: string
          prep_notes?: string
          questions?: Json
          selling_points_text?: string
          short_description?: string
          updated_at?: string
        }
        Update: {
          allergens?: string[]
          category_id?: string
          created_at?: string
          id?: string
          image_url?: string
          ingredients_text?: string
          is_published?: boolean
          long_description?: string
          name?: string
          prep_notes?: string
          questions?: Json
          selling_points_text?: string
          short_description?: string
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          email: string
          full_name: string | null
          id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          email: string
          full_name?: string | null
          id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string
          full_name?: string | null
          id?: string
          updated_at?: string
        }
        Relationships: []
      }
      quiz_questions: {
        Row: {
          category: string
          correct_answer: string
          correct_index: number | null
          created_at: string
          created_by: string | null
          difficulty: string
          id: string
          is_active: boolean
          options: Json | null
          question_text: string
          question_type: string
          target_roles: string[]
          updated_at: string
        }
        Insert: {
          category: string
          correct_answer: string
          correct_index?: number | null
          created_at?: string
          created_by?: string | null
          difficulty?: string
          id?: string
          is_active?: boolean
          options?: Json | null
          question_text: string
          question_type: string
          target_roles?: string[]
          updated_at?: string
        }
        Update: {
          category?: string
          correct_answer?: string
          correct_index?: number | null
          created_at?: string
          created_by?: string | null
          difficulty?: string
          id?: string
          is_active?: boolean
          options?: Json | null
          question_text?: string
          question_type?: string
          target_roles?: string[]
          updated_at?: string
        }
        Relationships: []
      }
      quiz_scores: {
        Row: {
          completed_at: string
          id: string
          percentage: number
          quiz_type: string
          score: number
          total_questions: number
          user_id: string
        }
        Insert: {
          completed_at?: string
          id?: string
          percentage: number
          quiz_type: string
          score: number
          total_questions: number
          user_id: string
        }
        Update: {
          completed_at?: string
          id?: string
          percentage?: number
          quiz_type?: string
          score?: number
          total_questions?: number
          user_id?: string
        }
        Relationships: []
      }
      role_audit_log: {
        Row: {
          changed_by: string
          created_at: string
          id: string
          new_role: string | null
          old_role: string | null
          reason: string | null
          user_id: string
        }
        Insert: {
          changed_by: string
          created_at?: string
          id?: string
          new_role?: string | null
          old_role?: string | null
          reason?: string | null
          user_id: string
        }
        Update: {
          changed_by?: string
          created_at?: string
          id?: string
          new_role?: string | null
          old_role?: string | null
          reason?: string | null
          user_id?: string
        }
        Relationships: []
      }
      role_permissions: {
        Row: {
          created_at: string
          id: string
          is_enabled: boolean
          permission_key: string
          role: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_enabled?: boolean
          permission_key: string
          role: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          is_enabled?: boolean
          permission_key?: string
          role?: string
          updated_at?: string
        }
        Relationships: []
      }
      staff_activity_log: {
        Row: {
          activity_type: string
          created_at: string
          id: string
          item_category: string | null
          item_name: string
          user_id: string
        }
        Insert: {
          activity_type: string
          created_at?: string
          id?: string
          item_category?: string | null
          item_name: string
          user_id: string
        }
        Update: {
          activity_type?: string
          created_at?: string
          id?: string
          item_category?: string | null
          item_name?: string
          user_id?: string
        }
        Relationships: []
      }
      staff_invitations: {
        Row: {
          accepted_at: string | null
          created_at: string
          email: string
          expires_at: string
          full_name: string | null
          id: string
          invitation_code: string
          invited_by: string
          invited_role: string
          status: string
        }
        Insert: {
          accepted_at?: string | null
          created_at?: string
          email: string
          expires_at?: string
          full_name?: string | null
          id?: string
          invitation_code?: string
          invited_by: string
          invited_role: string
          status?: string
        }
        Update: {
          accepted_at?: string | null
          created_at?: string
          email?: string
          expires_at?: string
          full_name?: string | null
          id?: string
          invitation_code?: string
          invited_by?: string
          invited_role?: string
          status?: string
        }
        Relationships: []
      }
      study_progress: {
        Row: {
          id: string
          is_known: boolean
          menu_item_name: string
          studied_at: string
          user_id: string
        }
        Insert: {
          id?: string
          is_known?: boolean
          menu_item_name: string
          studied_at?: string
          user_id: string
        }
        Update: {
          id?: string
          is_known?: boolean
          menu_item_name?: string
          studied_at?: string
          user_id?: string
        }
        Relationships: []
      }
      test_configurations: {
        Row: {
          created_by: string | null
          difficulty_filter: string[] | null
          id: string
          is_active: boolean
          passing_score: number
          test_name: string
          test_type: string
          time_limit_minutes: number | null
          total_questions: number
          updated_at: string
        }
        Insert: {
          created_by?: string | null
          difficulty_filter?: string[] | null
          id?: string
          is_active?: boolean
          passing_score?: number
          test_name: string
          test_type: string
          time_limit_minutes?: number | null
          total_questions?: number
          updated_at?: string
        }
        Update: {
          created_by?: string | null
          difficulty_filter?: string[] | null
          id?: string
          is_active?: boolean
          passing_score?: number
          test_name?: string
          test_type?: string
          time_limit_minutes?: number | null
          total_questions?: number
          updated_at?: string
        }
        Relationships: []
      }
      test_question_assignments: {
        Row: {
          id: string
          is_required: boolean
          question_id: string
          sort_order: number | null
          test_config_id: string
        }
        Insert: {
          id?: string
          is_required?: boolean
          question_id: string
          sort_order?: number | null
          test_config_id: string
        }
        Update: {
          id?: string
          is_required?: boolean
          question_id?: string
          sort_order?: number | null
          test_config_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "test_question_assignments_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "quiz_questions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "test_question_assignments_test_config_id_fkey"
            columns: ["test_config_id"]
            isOneToOne: false
            referencedRelation: "test_configurations"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      user_sessions: {
        Row: {
          created_at: string
          duration_seconds: number | null
          id: string
          is_active: boolean | null
          last_heartbeat: string
          session_end: string | null
          session_start: string
          user_id: string
        }
        Insert: {
          created_at?: string
          duration_seconds?: number | null
          id?: string
          is_active?: boolean | null
          last_heartbeat?: string
          session_end?: string | null
          session_start?: string
          user_id: string
        }
        Update: {
          created_at?: string
          duration_seconds?: number | null
          id?: string
          is_active?: boolean | null
          last_heartbeat?: string
          session_end?: string | null
          session_start?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_beverage_access: { Args: { _user_id: string }; Returns: boolean }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_admin: { Args: { _user_id: string }; Returns: boolean }
    }
    Enums: {
      app_role:
        | "lead_admin"
        | "admin"
        | "employee"
        | "server"
        | "bartender"
        | "server_assistant"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: [
        "lead_admin",
        "admin",
        "employee",
        "server",
        "bartender",
        "server_assistant",
      ],
    },
  },
} as const
