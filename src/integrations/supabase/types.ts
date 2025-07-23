export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.12 (cd3cf9e)"
  }
  public: {
    Tables: {
      announcements: {
        Row: {
          author_name: string | null
          author_type: string | null
          class_id: string | null
          content: string
          created_at: string
          created_by: string
          id: string
          title: string
        }
        Insert: {
          author_name?: string | null
          author_type?: string | null
          class_id?: string | null
          content: string
          created_at?: string
          created_by: string
          id?: string
          title: string
        }
        Update: {
          author_name?: string | null
          author_type?: string | null
          class_id?: string | null
          content?: string
          created_at?: string
          created_by?: string
          id?: string
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "announcements_class_id_fkey"
            columns: ["class_id"]
            isOneToOne: false
            referencedRelation: "classes"
            referencedColumns: ["id"]
          },
        ]
      }
      attendance_records: {
        Row: {
          class_id: string | null
          created_at: string
          date: string
          id: string
          present: boolean
          quarter: string
          student_id: string | null
          week: number
        }
        Insert: {
          class_id?: string | null
          created_at?: string
          date: string
          id?: string
          present: boolean
          quarter: string
          student_id?: string | null
          week: number
        }
        Update: {
          class_id?: string | null
          created_at?: string
          date?: string
          id?: string
          present?: boolean
          quarter?: string
          student_id?: string | null
          week?: number
        }
        Relationships: [
          {
            foreignKeyName: "attendance_records_class_id_fkey"
            columns: ["class_id"]
            isOneToOne: false
            referencedRelation: "classes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "attendance_records_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      birthdays: {
        Row: {
          class_id: string | null
          created_at: string
          date: string
          day: number
          id: string
          month: number
          student_id: string | null
          student_name: string
        }
        Insert: {
          class_id?: string | null
          created_at?: string
          date: string
          day: number
          id?: string
          month: number
          student_id?: string | null
          student_name: string
        }
        Update: {
          class_id?: string | null
          created_at?: string
          date?: string
          day?: number
          id?: string
          month?: number
          student_id?: string | null
          student_name?: string
        }
        Relationships: [
          {
            foreignKeyName: "birthdays_class_id_fkey"
            columns: ["class_id"]
            isOneToOne: false
            referencedRelation: "classes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "birthdays_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      classes: {
        Row: {
          created_at: string
          id: string
          name: string
          teacher_ids: string[] | null
          teacher_names: string[] | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          teacher_ids?: string[] | null
          teacher_names?: string[] | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          teacher_ids?: string[] | null
          teacher_names?: string[] | null
          updated_at?: string
        }
        Relationships: []
      }
      inventory: {
        Row: {
          bibles: number
          class_id: string | null
          id: string
          last_updated: string
          magazines: number
          offerings: number
          quarter: string
        }
        Insert: {
          bibles?: number
          class_id?: string | null
          id?: string
          last_updated?: string
          magazines?: number
          offerings?: number
          quarter: string
        }
        Update: {
          bibles?: number
          class_id?: string | null
          id?: string
          last_updated?: string
          magazines?: number
          offerings?: number
          quarter?: string
        }
        Relationships: [
          {
            foreignKeyName: "inventory_class_id_fkey"
            columns: ["class_id"]
            isOneToOne: false
            referencedRelation: "classes"
            referencedColumns: ["id"]
          },
        ]
      }
      messages: {
        Row: {
          content: string
          created_at: string
          from_user_id: string
          from_user_name: string
          from_user_type: string
          id: string
          message_type: string
          read_at: string | null
          to_user_id: string | null
          to_user_name: string | null
          to_user_type: string | null
        }
        Insert: {
          content: string
          created_at?: string
          from_user_id: string
          from_user_name: string
          from_user_type: string
          id?: string
          message_type?: string
          read_at?: string | null
          to_user_id?: string | null
          to_user_name?: string | null
          to_user_type?: string | null
        }
        Update: {
          content?: string
          created_at?: string
          from_user_id?: string
          from_user_name?: string
          from_user_type?: string
          id?: string
          message_type?: string
          read_at?: string | null
          to_user_id?: string | null
          to_user_name?: string | null
          to_user_type?: string | null
        }
        Relationships: []
      }
      students: {
        Row: {
          birthday: string | null
          class_id: string | null
          created_at: string
          id: string
          name: string
        }
        Insert: {
          birthday?: string | null
          class_id?: string | null
          created_at?: string
          id?: string
          name: string
        }
        Update: {
          birthday?: string | null
          class_id?: string | null
          created_at?: string
          id?: string
          name?: string
        }
        Relationships: [
          {
            foreignKeyName: "students_class_id_fkey"
            columns: ["class_id"]
            isOneToOne: false
            referencedRelation: "classes"
            referencedColumns: ["id"]
          },
        ]
      }
      system_settings: {
        Row: {
          church_name: string | null
          created_at: string
          id: string
          secretary_password: string
          secretary_username: string
          updated_at: string
        }
        Insert: {
          church_name?: string | null
          created_at?: string
          id?: string
          secretary_password?: string
          secretary_username?: string
          updated_at?: string
        }
        Update: {
          church_name?: string | null
          created_at?: string
          id?: string
          secretary_password?: string
          secretary_username?: string
          updated_at?: string
        }
        Relationships: []
      }
      users: {
        Row: {
          church_name: string
          created_at: string
          email: string
          id: string
          name: string
          password: string
          phone: string
          type: string
          updated_at: string
          username: string
        }
        Insert: {
          church_name: string
          created_at?: string
          email: string
          id?: string
          name: string
          password: string
          phone: string
          type: string
          updated_at?: string
          username: string
        }
        Update: {
          church_name?: string
          created_at?: string
          email?: string
          id?: string
          name?: string
          password?: string
          phone?: string
          type?: string
          updated_at?: string
          username?: string
        }
        Relationships: []
      }
      visitors: {
        Row: {
          class_id: string | null
          created_at: string
          id: string
          name: string
          visit_date: string
        }
        Insert: {
          class_id?: string | null
          created_at?: string
          id?: string
          name: string
          visit_date: string
        }
        Update: {
          class_id?: string | null
          created_at?: string
          id?: string
          name?: string
          visit_date?: string
        }
        Relationships: [
          {
            foreignKeyName: "visitors_class_id_fkey"
            columns: ["class_id"]
            isOneToOne: false
            referencedRelation: "classes"
            referencedColumns: ["id"]
          },
        ]
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
    Enums: {},
  },
} as const
