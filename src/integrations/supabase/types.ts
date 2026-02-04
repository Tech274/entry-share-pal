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
      delivery_requests: {
        Row: {
          account_manager: string | null
          agent_name: string | null
          assigned_to: string | null
          client: string
          cloud: string | null
          cloud_type: string | null
          created_at: string
          end_date: string | null
          fresh_desk_ticket_number: string | null
          id: string
          input_cost_per_user: number | null
          lab_name: string | null
          lab_setup_requirement: string | null
          lab_status: string | null
          lab_type: string | null
          line_of_business: string | null
          month: string
          number_of_users: number | null
          potential_id: string | null
          received_on: string | null
          requester: string | null
          selling_cost_per_user: number | null
          start_date: string | null
          total_amount: number | null
          tp_lab_type: string | null
          training_name: string | null
          updated_at: string
          year: number
        }
        Insert: {
          account_manager?: string | null
          agent_name?: string | null
          assigned_to?: string | null
          client: string
          cloud?: string | null
          cloud_type?: string | null
          created_at?: string
          end_date?: string | null
          fresh_desk_ticket_number?: string | null
          id?: string
          input_cost_per_user?: number | null
          lab_name?: string | null
          lab_setup_requirement?: string | null
          lab_status?: string | null
          lab_type?: string | null
          line_of_business?: string | null
          month: string
          number_of_users?: number | null
          potential_id?: string | null
          received_on?: string | null
          requester?: string | null
          selling_cost_per_user?: number | null
          start_date?: string | null
          total_amount?: number | null
          tp_lab_type?: string | null
          training_name?: string | null
          updated_at?: string
          year: number
        }
        Update: {
          account_manager?: string | null
          agent_name?: string | null
          assigned_to?: string | null
          client?: string
          cloud?: string | null
          cloud_type?: string | null
          created_at?: string
          end_date?: string | null
          fresh_desk_ticket_number?: string | null
          id?: string
          input_cost_per_user?: number | null
          lab_name?: string | null
          lab_setup_requirement?: string | null
          lab_status?: string | null
          lab_type?: string | null
          line_of_business?: string | null
          month?: string
          number_of_users?: number | null
          potential_id?: string | null
          received_on?: string | null
          requester?: string | null
          selling_cost_per_user?: number | null
          start_date?: string | null
          total_amount?: number | null
          tp_lab_type?: string | null
          training_name?: string | null
          updated_at?: string
          year?: number
        }
        Relationships: []
      }
      engineer_settings: {
        Row: {
          created_at: string
          expertise: Json | null
          id: string
          is_available: boolean
          max_active_requests: number
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          expertise?: Json | null
          id?: string
          is_available?: boolean
          max_active_requests?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          expertise?: Json | null
          id?: string
          is_available?: boolean
          max_active_requests?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      lab_catalog_categories: {
        Row: {
          category_id: string
          created_at: string | null
          display_order: number | null
          id: string
          is_active: boolean | null
          label: string
          updated_at: string | null
        }
        Insert: {
          category_id: string
          created_at?: string | null
          display_order?: number | null
          id?: string
          is_active?: boolean | null
          label: string
          updated_at?: string | null
        }
        Update: {
          category_id?: string
          created_at?: string | null
          display_order?: number | null
          id?: string
          is_active?: boolean | null
          label?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      lab_catalog_entries: {
        Row: {
          category: string
          created_at: string
          created_by: string | null
          description: string
          display_order: number | null
          id: string
          is_published: boolean
          name: string
          updated_at: string
        }
        Insert: {
          category: string
          created_at?: string
          created_by?: string | null
          description: string
          display_order?: number | null
          id?: string
          is_published?: boolean
          name: string
          updated_at?: string
        }
        Update: {
          category?: string
          created_at?: string
          created_by?: string | null
          description?: string
          display_order?: number | null
          id?: string
          is_published?: boolean
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      lab_requests: {
        Row: {
          account_manager: string | null
          agent_name: string | null
          assigned_to: string | null
          client: string
          cloud: string | null
          cloud_type: string | null
          created_at: string
          duration_in_days: number | null
          fresh_desk_ticket_number: string | null
          id: string
          input_cost_per_user: number | null
          lab_end_date: string | null
          lab_name: string | null
          lab_start_date: string | null
          line_of_business: string | null
          margin: number | null
          month: string
          potential_id: string | null
          received_on: string | null
          remarks: string | null
          requester: string | null
          selling_cost_per_user: number | null
          status: string | null
          total_amount_for_training: number | null
          tp_lab_type: string | null
          updated_at: string
          user_count: number | null
          year: number
        }
        Insert: {
          account_manager?: string | null
          agent_name?: string | null
          assigned_to?: string | null
          client: string
          cloud?: string | null
          cloud_type?: string | null
          created_at?: string
          duration_in_days?: number | null
          fresh_desk_ticket_number?: string | null
          id?: string
          input_cost_per_user?: number | null
          lab_end_date?: string | null
          lab_name?: string | null
          lab_start_date?: string | null
          line_of_business?: string | null
          margin?: number | null
          month: string
          potential_id?: string | null
          received_on?: string | null
          remarks?: string | null
          requester?: string | null
          selling_cost_per_user?: number | null
          status?: string | null
          total_amount_for_training?: number | null
          tp_lab_type?: string | null
          updated_at?: string
          user_count?: number | null
          year: number
        }
        Update: {
          account_manager?: string | null
          agent_name?: string | null
          assigned_to?: string | null
          client?: string
          cloud?: string | null
          cloud_type?: string | null
          created_at?: string
          duration_in_days?: number | null
          fresh_desk_ticket_number?: string | null
          id?: string
          input_cost_per_user?: number | null
          lab_end_date?: string | null
          lab_name?: string | null
          lab_start_date?: string | null
          line_of_business?: string | null
          margin?: number | null
          month?: string
          potential_id?: string | null
          received_on?: string | null
          remarks?: string | null
          requester?: string | null
          selling_cost_per_user?: number | null
          status?: string | null
          total_amount_for_training?: number | null
          tp_lab_type?: string | null
          updated_at?: string
          user_count?: number | null
          year?: number
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          email: string | null
          full_name: string | null
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      request_activity_log: {
        Row: {
          action: string
          created_at: string
          id: string
          new_values: Json | null
          old_values: Json | null
          performed_by: string | null
          request_id: string
          request_type: string
        }
        Insert: {
          action: string
          created_at?: string
          id?: string
          new_values?: Json | null
          old_values?: Json | null
          performed_by?: string | null
          request_id: string
          request_type: string
        }
        Update: {
          action?: string
          created_at?: string
          id?: string
          new_values?: Json | null
          old_values?: Json | null
          performed_by?: string | null
          request_id?: string
          request_type?: string
        }
        Relationships: []
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
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_engineer_workload: { Args: { engineer_id: string }; Returns: number }
      get_user_role: {
        Args: { _user_id: string }
        Returns: Database["public"]["Enums"]["app_role"]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "ops_engineer" | "ops_lead" | "finance" | "admin"
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
      app_role: ["ops_engineer", "ops_lead", "finance", "admin"],
    },
  },
} as const
