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
    PostgrestVersion: "14.5"
  }
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          extensions?: Json
          operationName?: string
          query?: string
          variables?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      certificates: {
        Row: {
          jm_cd: string
          job_field_code: string
          job_field_name: string
          mid_job_field_code: string
          mid_job_field_name: string
          name: string
          qualification_type_code: string
          qualification_type_name: string
          series_code: string
          series_name: string
          updated_at: string
        }
        Insert: {
          jm_cd: string
          job_field_code: string
          job_field_name: string
          mid_job_field_code: string
          mid_job_field_name: string
          name: string
          qualification_type_code: string
          qualification_type_name: string
          series_code: string
          series_name: string
          updated_at?: string
        }
        Update: {
          jm_cd?: string
          job_field_code?: string
          job_field_name?: string
          mid_job_field_code?: string
          mid_job_field_name?: string
          name?: string
          qualification_type_code?: string
          qualification_type_name?: string
          series_code?: string
          series_name?: string
          updated_at?: string
        }
        Relationships: []
      }
      exam_checklists: {
        Row: {
          checked_defaults: string[]
          custom_items: Json
          plan_id: string
          user_id: string
        }
        Insert: {
          checked_defaults?: string[]
          custom_items?: Json
          plan_id: string
          user_id: string
        }
        Update: {
          checked_defaults?: string[]
          custom_items?: Json
          plan_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "exam_checklists_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: true
            referencedRelation: "my_exam_plans"
            referencedColumns: ["id"]
          },
        ]
      }
      exam_fees: {
        Row: {
          items: Json
          jm_cd: string
          updated_at: string
        }
        Insert: {
          items?: Json
          jm_cd: string
          updated_at?: string
        }
        Update: {
          items?: Json
          jm_cd?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "exam_fees_jm_cd_fkey"
            columns: ["jm_cd"]
            isOneToOne: true
            referencedRelation: "certificates"
            referencedColumns: ["jm_cd"]
          },
        ]
      }
      exam_records: {
        Row: {
          certificate_name: string
          created_at: string
          exam_date: string
          id: string
          jm_cd: string
          memo: string | null
          passed: boolean
          plan_id: string | null
          round: number
          score: number | null
          stage: string
          user_id: string
          year: number
        }
        Insert: {
          certificate_name: string
          created_at?: string
          exam_date: string
          id?: string
          jm_cd: string
          memo?: string | null
          passed: boolean
          plan_id?: string | null
          round: number
          score?: number | null
          stage: string
          user_id: string
          year: number
        }
        Update: {
          certificate_name?: string
          created_at?: string
          exam_date?: string
          id?: string
          jm_cd?: string
          memo?: string | null
          passed?: boolean
          plan_id?: string | null
          round?: number
          score?: number | null
          stage?: string
          user_id?: string
          year?: number
        }
        Relationships: [
          {
            foreignKeyName: "exam_records_jm_cd_fkey"
            columns: ["jm_cd"]
            isOneToOne: false
            referencedRelation: "certificates"
            referencedColumns: ["jm_cd"]
          },
          {
            foreignKeyName: "exam_records_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "my_exam_plans"
            referencedColumns: ["id"]
          },
        ]
      }
      exam_schedules: {
        Row: {
          id: string
          jm_cd: string
          round: number
          stages: Json
          updated_at: string
          year: number
        }
        Insert: {
          id?: string
          jm_cd: string
          round: number
          stages?: Json
          updated_at?: string
          year: number
        }
        Update: {
          id?: string
          jm_cd?: string
          round?: number
          stages?: Json
          updated_at?: string
          year?: number
        }
        Relationships: [
          {
            foreignKeyName: "exam_schedules_jm_cd_fkey"
            columns: ["jm_cd"]
            isOneToOne: false
            referencedRelation: "certificates"
            referencedColumns: ["jm_cd"]
          },
        ]
      }
      exam_subjects: {
        Row: {
          duration_minutes: number
          full_score: number
          id: string
          is_required: boolean
          jm_cd: string
          optional_field_name: string
          subject_name: string
          subject_order: number
          total_questions: number
          type: string
          updated_at: string
        }
        Insert: {
          duration_minutes?: number
          full_score?: number
          id?: string
          is_required?: boolean
          jm_cd: string
          optional_field_name?: string
          subject_name: string
          subject_order: number
          total_questions?: number
          type: string
          updated_at?: string
        }
        Update: {
          duration_minutes?: number
          full_score?: number
          id?: string
          is_required?: boolean
          jm_cd?: string
          optional_field_name?: string
          subject_name?: string
          subject_order?: number
          total_questions?: number
          type?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "exam_subjects_jm_cd_fkey"
            columns: ["jm_cd"]
            isOneToOne: false
            referencedRelation: "certificates"
            referencedColumns: ["jm_cd"]
          },
        ]
      }
      interest_certificates: {
        Row: {
          added_at: string
          jm_cd: string
          user_id: string
        }
        Insert: {
          added_at?: string
          jm_cd: string
          user_id: string
        }
        Update: {
          added_at?: string
          jm_cd?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "interest_certificates_jm_cd_fkey"
            columns: ["jm_cd"]
            isOneToOne: false
            referencedRelation: "certificates"
            referencedColumns: ["jm_cd"]
          },
        ]
      }
      my_exam_plans: {
        Row: {
          certificate_name: string
          created_at: string
          exam_date: string
          exam_location: string | null
          id: string
          jm_cd: string
          round: number
          stage: string
          user_id: string
          year: number
        }
        Insert: {
          certificate_name: string
          created_at?: string
          exam_date: string
          exam_location?: string | null
          id?: string
          jm_cd: string
          round: number
          stage: string
          user_id: string
          year: number
        }
        Update: {
          certificate_name?: string
          created_at?: string
          exam_date?: string
          exam_location?: string | null
          id?: string
          jm_cd?: string
          round?: number
          stage?: string
          user_id?: string
          year?: number
        }
        Relationships: [
          {
            foreignKeyName: "my_exam_plans_jm_cd_fkey"
            columns: ["jm_cd"]
            isOneToOne: false
            referencedRelation: "certificates"
            referencedColumns: ["jm_cd"]
          },
        ]
      }
      pass_rates: {
        Row: {
          average_rate: number
          jm_cd: string
          updated_at: string
          years: Json
        }
        Insert: {
          average_rate?: number
          jm_cd: string
          updated_at?: string
          years?: Json
        }
        Update: {
          average_rate?: number
          jm_cd?: string
          updated_at?: string
          years?: Json
        }
        Relationships: [
          {
            foreignKeyName: "pass_rates_jm_cd_fkey"
            columns: ["jm_cd"]
            isOneToOne: true
            referencedRelation: "certificates"
            referencedColumns: ["jm_cd"]
          },
        ]
      }
      user_settings: {
        Row: {
          interest_field_codes: string[]
          user_id: string
        }
        Insert: {
          interest_field_codes?: string[]
          user_id: string
        }
        Update: {
          interest_field_codes?: string[]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      job_field_options: {
        Row: {
          code: string | null
          name: string | null
        }
        Relationships: []
      }
      series_options: {
        Row: {
          code: string | null
          name: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
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
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {},
  },
} as const
