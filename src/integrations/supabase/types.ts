export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      claim_timeline: {
        Row: {
          changed_by: string
          changed_date: string
          claim_id: string
          id: string
          notes: string | null
          status: Database["public"]["Enums"]["claim_status"]
        }
        Insert: {
          changed_by: string
          changed_date?: string
          claim_id: string
          id?: string
          notes?: string | null
          status: Database["public"]["Enums"]["claim_status"]
        }
        Update: {
          changed_by?: string
          changed_date?: string
          claim_id?: string
          id?: string
          notes?: string | null
          status?: Database["public"]["Enums"]["claim_status"]
        }
        Relationships: [
          {
            foreignKeyName: "claim_timeline_claim_id_fkey"
            columns: ["claim_id"]
            isOneToOne: false
            referencedRelation: "claims"
            referencedColumns: ["id"]
          },
        ]
      }
      claims: {
        Row: {
          account_code: string | null
          account_string: string | null
          actual_refund: number | null
          approved_by: string | null
          approved_date: string | null
          assigned_admin: string | null
          claim_number: string
          created_by: string
          created_date: string
          credit_note_number: string | null
          customer_address: string | null
          customer_contact: string | null
          customer_email: string | null
          customer_name: string
          customer_notes: string | null
          customer_phone: string | null
          department: Database["public"]["Enums"]["department"]
          detailed_description: string | null
          evatic_job_number: string | null
          expected_refund: number | null
          files: Json | null
          hourly_rate: number | null
          id: string
          internal_notes: string | null
          issue_description: string
          issue_type: Database["public"]["Enums"]["issue_type"]
          parts_cost: number | null
          product_model: string | null
          product_name: string
          purchase_date: string | null
          refund_status: Database["public"]["Enums"]["refund_status"] | null
          serial_number: string | null
          status: Database["public"]["Enums"]["claim_status"]
          supplier: string
          supplier_email_sent_date: string | null
          supplier_notes: string | null
          supplier_response_date: string | null
          technician_name: string
          total_cost: number | null
          travel_cost: number | null
          updated_date: string
          urgency_level: Database["public"]["Enums"]["urgency_level"]
          warranty_period: string | null
          work_hours: number | null
        }
        Insert: {
          account_code?: string | null
          account_string?: string | null
          actual_refund?: number | null
          approved_by?: string | null
          approved_date?: string | null
          assigned_admin?: string | null
          claim_number: string
          created_by: string
          created_date?: string
          credit_note_number?: string | null
          customer_address?: string | null
          customer_contact?: string | null
          customer_email?: string | null
          customer_name: string
          customer_notes?: string | null
          customer_phone?: string | null
          department: Database["public"]["Enums"]["department"]
          detailed_description?: string | null
          evatic_job_number?: string | null
          expected_refund?: number | null
          files?: Json | null
          hourly_rate?: number | null
          id?: string
          internal_notes?: string | null
          issue_description: string
          issue_type: Database["public"]["Enums"]["issue_type"]
          parts_cost?: number | null
          product_model?: string | null
          product_name: string
          purchase_date?: string | null
          refund_status?: Database["public"]["Enums"]["refund_status"] | null
          serial_number?: string | null
          status?: Database["public"]["Enums"]["claim_status"]
          supplier: string
          supplier_email_sent_date?: string | null
          supplier_notes?: string | null
          supplier_response_date?: string | null
          technician_name: string
          total_cost?: number | null
          travel_cost?: number | null
          updated_date?: string
          urgency_level?: Database["public"]["Enums"]["urgency_level"]
          warranty_period?: string | null
          work_hours?: number | null
        }
        Update: {
          account_code?: string | null
          account_string?: string | null
          actual_refund?: number | null
          approved_by?: string | null
          approved_date?: string | null
          assigned_admin?: string | null
          claim_number?: string
          created_by?: string
          created_date?: string
          credit_note_number?: string | null
          customer_address?: string | null
          customer_contact?: string | null
          customer_email?: string | null
          customer_name?: string
          customer_notes?: string | null
          customer_phone?: string | null
          department?: Database["public"]["Enums"]["department"]
          detailed_description?: string | null
          evatic_job_number?: string | null
          expected_refund?: number | null
          files?: Json | null
          hourly_rate?: number | null
          id?: string
          internal_notes?: string | null
          issue_description?: string
          issue_type?: Database["public"]["Enums"]["issue_type"]
          parts_cost?: number | null
          product_model?: string | null
          product_name?: string
          purchase_date?: string | null
          refund_status?: Database["public"]["Enums"]["refund_status"] | null
          serial_number?: string | null
          status?: Database["public"]["Enums"]["claim_status"]
          supplier?: string
          supplier_email_sent_date?: string | null
          supplier_notes?: string | null
          supplier_response_date?: string | null
          technician_name?: string
          total_cost?: number | null
          travel_cost?: number | null
          updated_date?: string
          urgency_level?: Database["public"]["Enums"]["urgency_level"]
          warranty_period?: string | null
          work_hours?: number | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_date: string
          department: Database["public"]["Enums"]["department"]
          email: string | null
          full_name: string
          id: string
          is_active: boolean
          last_login: string | null
          phone: string | null
          role: Database["public"]["Enums"]["user_role"]
        }
        Insert: {
          created_date?: string
          department: Database["public"]["Enums"]["department"]
          email?: string | null
          full_name: string
          id: string
          is_active?: boolean
          last_login?: string | null
          phone?: string | null
          role?: Database["public"]["Enums"]["user_role"]
        }
        Update: {
          created_date?: string
          department?: Database["public"]["Enums"]["department"]
          email?: string | null
          full_name?: string
          id?: string
          is_active?: boolean
          last_login?: string | null
          phone?: string | null
          role?: Database["public"]["Enums"]["user_role"]
        }
        Relationships: []
      }
      suppliers: {
        Row: {
          contact_person: string | null
          email: string | null
          id: string
          is_active: boolean | null
          name: string
          phone: string | null
        }
        Insert: {
          contact_person?: string | null
          email?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          phone?: string | null
        }
        Update: {
          contact_person?: string | null
          email?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          phone?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      generate_account_code: {
        Args: {
          p_issue_type: Database["public"]["Enums"]["issue_type"]
          p_product_name: string
          p_customer_name: string
        }
        Returns: {
          account_code: string
          account_string: string
        }[]
      }
      generate_claim_number: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
    }
    Enums: {
      claim_status:
        | "new"
        | "pending_approval"
        | "under_processing"
        | "sent_supplier"
        | "awaiting_response"
        | "resolved"
        | "rejected"
      department:
        | "oslo"
        | "bergen"
        | "trondheim"
        | "stavanger"
        | "kristiansand"
        | "nord_norge"
        | "innlandet"
      issue_type:
        | "warranty"
        | "claim"
        | "service_callback"
        | "extended_warranty"
      refund_status: "pending" | "received" | "rejected"
      urgency_level: "low" | "normal" | "high" | "critical"
      user_role: "technician" | "admin"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      claim_status: [
        "new",
        "pending_approval",
        "under_processing",
        "sent_supplier",
        "awaiting_response",
        "resolved",
        "rejected",
      ],
      department: [
        "oslo",
        "bergen",
        "trondheim",
        "stavanger",
        "kristiansand",
        "nord_norge",
        "innlandet",
      ],
      issue_type: [
        "warranty",
        "claim",
        "service_callback",
        "extended_warranty",
      ],
      refund_status: ["pending", "received", "rejected"],
      urgency_level: ["low", "normal", "high", "critical"],
      user_role: ["technician", "admin"],
    },
  },
} as const
