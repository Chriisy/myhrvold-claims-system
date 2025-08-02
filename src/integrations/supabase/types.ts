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
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      audit_logs: {
        Row: {
          created_at: string
          id: string
          ip_address: unknown | null
          new_values: Json | null
          old_values: Json | null
          operation: string
          record_id: string | null
          table_name: string
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          ip_address?: unknown | null
          new_values?: Json | null
          old_values?: Json | null
          operation: string
          record_id?: string | null
          table_name: string
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          ip_address?: unknown | null
          new_values?: Json | null
          old_values?: Json | null
          operation?: string
          record_id?: string | null
          table_name?: string
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      budget_targets: {
        Row: {
          created_at: string
          created_by: string
          department: Database["public"]["Enums"]["department"] | null
          id: string
          notes: string | null
          supplier_name: string | null
          target_amount: number
          updated_at: string
          updated_by: string | null
          year: number
        }
        Insert: {
          created_at?: string
          created_by: string
          department?: Database["public"]["Enums"]["department"] | null
          id?: string
          notes?: string | null
          supplier_name?: string | null
          target_amount?: number
          updated_at?: string
          updated_by?: string | null
          year: number
        }
        Update: {
          created_at?: string
          created_by?: string
          department?: Database["public"]["Enums"]["department"] | null
          id?: string
          notes?: string | null
          supplier_name?: string | null
          target_amount?: number
          updated_at?: string
          updated_by?: string | null
          year?: number
        }
        Relationships: []
      }
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
          consumables_cost: number | null
          created_by: string
          created_date: string
          credit_note_number: string | null
          custom_line_items: Json | null
          customer_address: string | null
          customer_contact: string | null
          customer_email: string | null
          customer_name: string
          customer_notes: string | null
          customer_number: string | null
          customer_phone: string | null
          department: Database["public"]["Enums"]["department"]
          detailed_description: string | null
          evatic_job_number: string | null
          expected_refund: number | null
          external_services_cost: number | null
          files: Json | null
          hourly_rate: number | null
          id: string
          internal_notes: string | null
          issue_description: string
          issue_type: Database["public"]["Enums"]["issue_type"]
          ms_job_number: string | null
          net_cost: number | null
          ocr_confidence_score: number | null
          ocr_processed_at: string | null
          other_cost_refunded: boolean | null
          overtime_100_hours: number | null
          overtime_50_hours: number | null
          parts_cost: number | null
          parts_cost_refunded: boolean | null
          product_model: string | null
          product_name: string
          product_number: string | null
          purchase_date: string | null
          refund_date_received: string | null
          refund_status: Database["public"]["Enums"]["refund_status"] | null
          refunded_other_cost: number | null
          refunded_parts_cost: number | null
          refunded_travel_cost: number | null
          refunded_vehicle_cost: number | null
          refunded_work_cost: number | null
          scanned_invoice_url: string | null
          serial_number: string | null
          solution_description: string | null
          solution_text: string | null
          status: Database["public"]["Enums"]["claim_status"]
          supplier: string
          supplier_email_sent_date: string | null
          supplier_notes: string | null
          supplier_reference_number: string | null
          supplier_response_date: string | null
          technician_name: string
          total_cost: number | null
          total_refunded: number | null
          travel_cost: number | null
          travel_cost_refunded: boolean | null
          travel_distance_km: number | null
          travel_hours: number | null
          updated_date: string
          urgency_level: Database["public"]["Enums"]["urgency_level"]
          vehicle_cost_per_km: number | null
          vehicle_cost_refunded: boolean | null
          warranty_period: string | null
          work_cost_refunded: boolean | null
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
          consumables_cost?: number | null
          created_by: string
          created_date?: string
          credit_note_number?: string | null
          custom_line_items?: Json | null
          customer_address?: string | null
          customer_contact?: string | null
          customer_email?: string | null
          customer_name: string
          customer_notes?: string | null
          customer_number?: string | null
          customer_phone?: string | null
          department: Database["public"]["Enums"]["department"]
          detailed_description?: string | null
          evatic_job_number?: string | null
          expected_refund?: number | null
          external_services_cost?: number | null
          files?: Json | null
          hourly_rate?: number | null
          id?: string
          internal_notes?: string | null
          issue_description: string
          issue_type: Database["public"]["Enums"]["issue_type"]
          ms_job_number?: string | null
          net_cost?: number | null
          ocr_confidence_score?: number | null
          ocr_processed_at?: string | null
          other_cost_refunded?: boolean | null
          overtime_100_hours?: number | null
          overtime_50_hours?: number | null
          parts_cost?: number | null
          parts_cost_refunded?: boolean | null
          product_model?: string | null
          product_name: string
          product_number?: string | null
          purchase_date?: string | null
          refund_date_received?: string | null
          refund_status?: Database["public"]["Enums"]["refund_status"] | null
          refunded_other_cost?: number | null
          refunded_parts_cost?: number | null
          refunded_travel_cost?: number | null
          refunded_vehicle_cost?: number | null
          refunded_work_cost?: number | null
          scanned_invoice_url?: string | null
          serial_number?: string | null
          solution_description?: string | null
          solution_text?: string | null
          status?: Database["public"]["Enums"]["claim_status"]
          supplier: string
          supplier_email_sent_date?: string | null
          supplier_notes?: string | null
          supplier_reference_number?: string | null
          supplier_response_date?: string | null
          technician_name: string
          total_cost?: number | null
          total_refunded?: number | null
          travel_cost?: number | null
          travel_cost_refunded?: boolean | null
          travel_distance_km?: number | null
          travel_hours?: number | null
          updated_date?: string
          urgency_level?: Database["public"]["Enums"]["urgency_level"]
          vehicle_cost_per_km?: number | null
          vehicle_cost_refunded?: boolean | null
          warranty_period?: string | null
          work_cost_refunded?: boolean | null
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
          consumables_cost?: number | null
          created_by?: string
          created_date?: string
          credit_note_number?: string | null
          custom_line_items?: Json | null
          customer_address?: string | null
          customer_contact?: string | null
          customer_email?: string | null
          customer_name?: string
          customer_notes?: string | null
          customer_number?: string | null
          customer_phone?: string | null
          department?: Database["public"]["Enums"]["department"]
          detailed_description?: string | null
          evatic_job_number?: string | null
          expected_refund?: number | null
          external_services_cost?: number | null
          files?: Json | null
          hourly_rate?: number | null
          id?: string
          internal_notes?: string | null
          issue_description?: string
          issue_type?: Database["public"]["Enums"]["issue_type"]
          ms_job_number?: string | null
          net_cost?: number | null
          ocr_confidence_score?: number | null
          ocr_processed_at?: string | null
          other_cost_refunded?: boolean | null
          overtime_100_hours?: number | null
          overtime_50_hours?: number | null
          parts_cost?: number | null
          parts_cost_refunded?: boolean | null
          product_model?: string | null
          product_name?: string
          product_number?: string | null
          purchase_date?: string | null
          refund_date_received?: string | null
          refund_status?: Database["public"]["Enums"]["refund_status"] | null
          refunded_other_cost?: number | null
          refunded_parts_cost?: number | null
          refunded_travel_cost?: number | null
          refunded_vehicle_cost?: number | null
          refunded_work_cost?: number | null
          scanned_invoice_url?: string | null
          serial_number?: string | null
          solution_description?: string | null
          solution_text?: string | null
          status?: Database["public"]["Enums"]["claim_status"]
          supplier?: string
          supplier_email_sent_date?: string | null
          supplier_notes?: string | null
          supplier_reference_number?: string | null
          supplier_response_date?: string | null
          technician_name?: string
          total_cost?: number | null
          total_refunded?: number | null
          travel_cost?: number | null
          travel_cost_refunded?: boolean | null
          travel_distance_km?: number | null
          travel_hours?: number | null
          updated_date?: string
          urgency_level?: Database["public"]["Enums"]["urgency_level"]
          vehicle_cost_per_km?: number | null
          vehicle_cost_refunded?: boolean | null
          warranty_period?: string | null
          work_cost_refunded?: boolean | null
          work_hours?: number | null
        }
        Relationships: []
      }
      customers: {
        Row: {
          address: string | null
          contact_person: string | null
          created_at: string
          created_by: string
          customer_name: string
          customer_number: string
          email: string | null
          id: string
          is_active: boolean
          phone: string | null
        }
        Insert: {
          address?: string | null
          contact_person?: string | null
          created_at?: string
          created_by: string
          customer_name: string
          customer_number: string
          email?: string | null
          id?: string
          is_active?: boolean
          phone?: string | null
        }
        Update: {
          address?: string | null
          contact_person?: string | null
          created_at?: string
          created_by?: string
          customer_name?: string
          customer_number?: string
          email?: string | null
          id?: string
          is_active?: boolean
          phone?: string | null
        }
        Relationships: []
      }
      data_retention_policies: {
        Row: {
          auto_delete: boolean
          created_at: string
          id: string
          retention_days: number
          table_name: string
        }
        Insert: {
          auto_delete?: boolean
          created_at?: string
          id?: string
          retention_days: number
          table_name: string
        }
        Update: {
          auto_delete?: boolean
          created_at?: string
          id?: string
          retention_days?: number
          table_name?: string
        }
        Relationships: []
      }
      equipment: {
        Row: {
          avtale_id: string | null
          created_at: string | null
          driftstimer: number | null
          id: string
          installasjon_dato: string | null
          is_active: boolean | null
          kategori: string | null
          lokasjon: string | null
          miljø_fuktighet: number | null
          miljø_temperatur: number | null
          modell: string | null
          neste_service: string | null
          notater: string | null
          produkt_navn: string
          produsent: string | null
          serienummer: string | null
          service_intervall_måneder: number | null
          siste_service: string | null
          updated_at: string | null
        }
        Insert: {
          avtale_id?: string | null
          created_at?: string | null
          driftstimer?: number | null
          id?: string
          installasjon_dato?: string | null
          is_active?: boolean | null
          kategori?: string | null
          lokasjon?: string | null
          miljø_fuktighet?: number | null
          miljø_temperatur?: number | null
          modell?: string | null
          neste_service?: string | null
          notater?: string | null
          produkt_navn: string
          produsent?: string | null
          serienummer?: string | null
          service_intervall_måneder?: number | null
          siste_service?: string | null
          updated_at?: string | null
        }
        Update: {
          avtale_id?: string | null
          created_at?: string | null
          driftstimer?: number | null
          id?: string
          installasjon_dato?: string | null
          is_active?: boolean | null
          kategori?: string | null
          lokasjon?: string | null
          miljø_fuktighet?: number | null
          miljø_temperatur?: number | null
          modell?: string | null
          neste_service?: string | null
          notater?: string | null
          produkt_navn?: string
          produsent?: string | null
          serienummer?: string | null
          service_intervall_måneder?: number | null
          siste_service?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "equipment_avtale_id_fkey"
            columns: ["avtale_id"]
            isOneToOne: false
            referencedRelation: "maintenance_agreements"
            referencedColumns: ["id"]
          },
        ]
      }
      error_logs: {
        Row: {
          created_at: string
          error_context: Json | null
          error_message: string
          error_stack: string | null
          id: string
          resolved: boolean | null
          severity: string | null
          updated_at: string
          url: string | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string
          error_context?: Json | null
          error_message: string
          error_stack?: string | null
          id?: string
          resolved?: boolean | null
          severity?: string | null
          updated_at?: string
          url?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string
          error_context?: Json | null
          error_message?: string
          error_stack?: string | null
          id?: string
          resolved?: boolean | null
          severity?: string | null
          updated_at?: string
          url?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      feature_flags: {
        Row: {
          created_at: string | null
          description: string | null
          enabled: boolean
          name: string
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          enabled?: boolean
          name: string
        }
        Update: {
          created_at?: string | null
          description?: string | null
          enabled?: boolean
          name?: string
        }
        Relationships: []
      }
      maintenance_agreements: {
        Row: {
          avtale_nummer: string
          beskrivelse: string | null
          besok_per_ar: number
          created_at: string | null
          created_by: string | null
          department: Database["public"]["Enums"]["department"] | null
          epost: string | null
          garantivilkar: string | null
          id: string
          intern_notat: string | null
          kontakt_info: string | null
          kontaktperson: string | null
          kunde_adresse: string | null
          kunde_id: string | null
          kunde_navn: string
          neste_besok: string | null
          pris_cpi_justerbar: boolean | null
          pris_grunnlag: number
          prosedyrer_ved_service: string | null
          signert_dato: string | null
          signert_kpi_verdi: number | null
          sist_cpi_justert: string | null
          slutt_dato: string | null
          start_dato: string
          status: Database["public"]["Enums"]["maintenance_status"] | null
          tekniker_id: string | null
          telefon: string | null
          updated_at: string | null
          vilkar: string | null
        }
        Insert: {
          avtale_nummer: string
          beskrivelse?: string | null
          besok_per_ar?: number
          created_at?: string | null
          created_by?: string | null
          department?: Database["public"]["Enums"]["department"] | null
          epost?: string | null
          garantivilkar?: string | null
          id?: string
          intern_notat?: string | null
          kontakt_info?: string | null
          kontaktperson?: string | null
          kunde_adresse?: string | null
          kunde_id?: string | null
          kunde_navn: string
          neste_besok?: string | null
          pris_cpi_justerbar?: boolean | null
          pris_grunnlag?: number
          prosedyrer_ved_service?: string | null
          signert_dato?: string | null
          signert_kpi_verdi?: number | null
          sist_cpi_justert?: string | null
          slutt_dato?: string | null
          start_dato: string
          status?: Database["public"]["Enums"]["maintenance_status"] | null
          tekniker_id?: string | null
          telefon?: string | null
          updated_at?: string | null
          vilkar?: string | null
        }
        Update: {
          avtale_nummer?: string
          beskrivelse?: string | null
          besok_per_ar?: number
          created_at?: string | null
          created_by?: string | null
          department?: Database["public"]["Enums"]["department"] | null
          epost?: string | null
          garantivilkar?: string | null
          id?: string
          intern_notat?: string | null
          kontakt_info?: string | null
          kontaktperson?: string | null
          kunde_adresse?: string | null
          kunde_id?: string | null
          kunde_navn?: string
          neste_besok?: string | null
          pris_cpi_justerbar?: boolean | null
          pris_grunnlag?: number
          prosedyrer_ved_service?: string | null
          signert_dato?: string | null
          signert_kpi_verdi?: number | null
          sist_cpi_justert?: string | null
          slutt_dato?: string | null
          start_dato?: string
          status?: Database["public"]["Enums"]["maintenance_status"] | null
          tekniker_id?: string | null
          telefon?: string | null
          updated_at?: string | null
          vilkar?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "maintenance_agreements_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "maintenance_agreements_kunde_id_fkey"
            columns: ["kunde_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
        ]
      }
      maintenance_tasks: {
        Row: {
          created_at: string | null
          equipment_id: string | null
          estimert_tid_minutter: number | null
          fullført_tid: string | null
          id: string
          kommentar: string | null
          måleverdier: Json | null
          oppgave_beskrivelse: string
          prioritet: number | null
          resultat: string | null
          status: Database["public"]["Enums"]["task_status"] | null
          updated_at: string | null
          visit_id: string | null
        }
        Insert: {
          created_at?: string | null
          equipment_id?: string | null
          estimert_tid_minutter?: number | null
          fullført_tid?: string | null
          id?: string
          kommentar?: string | null
          måleverdier?: Json | null
          oppgave_beskrivelse: string
          prioritet?: number | null
          resultat?: string | null
          status?: Database["public"]["Enums"]["task_status"] | null
          updated_at?: string | null
          visit_id?: string | null
        }
        Update: {
          created_at?: string | null
          equipment_id?: string | null
          estimert_tid_minutter?: number | null
          fullført_tid?: string | null
          id?: string
          kommentar?: string | null
          måleverdier?: Json | null
          oppgave_beskrivelse?: string
          prioritet?: number | null
          resultat?: string | null
          status?: Database["public"]["Enums"]["task_status"] | null
          updated_at?: string | null
          visit_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "maintenance_tasks_equipment_id_fkey"
            columns: ["equipment_id"]
            isOneToOne: false
            referencedRelation: "equipment"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "maintenance_tasks_visit_id_fkey"
            columns: ["visit_id"]
            isOneToOne: false
            referencedRelation: "service_visits"
            referencedColumns: ["id"]
          },
        ]
      }
      notification_settings: {
        Row: {
          created_at: string
          email_enabled: boolean
          id: string
          overdue_alerts: boolean
          reminder_frequency: number
          status_updates: boolean
          supplier_responses: boolean
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          email_enabled?: boolean
          id?: string
          overdue_alerts?: boolean
          reminder_frequency?: number
          status_updates?: boolean
          supplier_responses?: boolean
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          email_enabled?: boolean
          id?: string
          overdue_alerts?: boolean
          reminder_frequency?: number
          status_updates?: boolean
          supplier_responses?: boolean
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      notifications: {
        Row: {
          claim_id: string | null
          created_at: string
          id: string
          is_read: boolean
          message: string
          metadata: Json | null
          scheduled_for: string | null
          title: string
          type: string
          user_id: string
        }
        Insert: {
          claim_id?: string | null
          created_at?: string
          id?: string
          is_read?: boolean
          message: string
          metadata?: Json | null
          scheduled_for?: string | null
          title: string
          type: string
          user_id: string
        }
        Update: {
          claim_id?: string | null
          created_at?: string
          id?: string
          is_read?: boolean
          message?: string
          metadata?: Json | null
          scheduled_for?: string | null
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_claim_id_fkey"
            columns: ["claim_id"]
            isOneToOne: false
            referencedRelation: "claims"
            referencedColumns: ["id"]
          },
        ]
      }
      ocr_analytics: {
        Row: {
          claim_id: string | null
          confidence_score: number | null
          created_at: string
          fields_extracted: Json | null
          id: string
          processing_time_ms: number | null
          success: boolean
          user_corrections: Json | null
          user_id: string
        }
        Insert: {
          claim_id?: string | null
          confidence_score?: number | null
          created_at?: string
          fields_extracted?: Json | null
          id?: string
          processing_time_ms?: number | null
          success?: boolean
          user_corrections?: Json | null
          user_id: string
        }
        Update: {
          claim_id?: string | null
          confidence_score?: number | null
          created_at?: string
          fields_extracted?: Json | null
          id?: string
          processing_time_ms?: number | null
          success?: boolean
          user_corrections?: Json | null
          user_id?: string
        }
        Relationships: []
      }
      parts: {
        Row: {
          category: string | null
          created_at: string
          created_by: string
          description: string
          id: string
          is_active: boolean
          part_number: string
          supplier_name: string | null
          unit_price: number | null
        }
        Insert: {
          category?: string | null
          created_at?: string
          created_by: string
          description: string
          id?: string
          is_active?: boolean
          part_number: string
          supplier_name?: string | null
          unit_price?: number | null
        }
        Update: {
          category?: string | null
          created_at?: string
          created_by?: string
          description?: string
          id?: string
          is_active?: boolean
          part_number?: string
          supplier_name?: string | null
          unit_price?: number | null
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
      service_visits: {
        Row: {
          anbefalinger: string | null
          avtale_id: string | null
          beskrivelse: string | null
          bilder: Json | null
          created_at: string | null
          deler_kostnad: number | null
          faktisk_slutttid: string | null
          faktisk_starttid: string | null
          funn: string | null
          id: string
          km_reise: number | null
          planlagt_tid: string
          rapport_pdf_url: string | null
          signatur_kunde: string | null
          signatur_tekniker: string | null
          status: Database["public"]["Enums"]["maintenance_status"] | null
          tekniker_id: string | null
          tekniker_navn: string | null
          timer_arbeid: number | null
          timer_reise: number | null
          total_kostnad: number | null
          updated_at: string | null
          utført_arbeid: string | null
          visit_type: Database["public"]["Enums"]["visit_type"] | null
        }
        Insert: {
          anbefalinger?: string | null
          avtale_id?: string | null
          beskrivelse?: string | null
          bilder?: Json | null
          created_at?: string | null
          deler_kostnad?: number | null
          faktisk_slutttid?: string | null
          faktisk_starttid?: string | null
          funn?: string | null
          id?: string
          km_reise?: number | null
          planlagt_tid: string
          rapport_pdf_url?: string | null
          signatur_kunde?: string | null
          signatur_tekniker?: string | null
          status?: Database["public"]["Enums"]["maintenance_status"] | null
          tekniker_id?: string | null
          tekniker_navn?: string | null
          timer_arbeid?: number | null
          timer_reise?: number | null
          total_kostnad?: number | null
          updated_at?: string | null
          utført_arbeid?: string | null
          visit_type?: Database["public"]["Enums"]["visit_type"] | null
        }
        Update: {
          anbefalinger?: string | null
          avtale_id?: string | null
          beskrivelse?: string | null
          bilder?: Json | null
          created_at?: string | null
          deler_kostnad?: number | null
          faktisk_slutttid?: string | null
          faktisk_starttid?: string | null
          funn?: string | null
          id?: string
          km_reise?: number | null
          planlagt_tid?: string
          rapport_pdf_url?: string | null
          signatur_kunde?: string | null
          signatur_tekniker?: string | null
          status?: Database["public"]["Enums"]["maintenance_status"] | null
          tekniker_id?: string | null
          tekniker_navn?: string | null
          timer_arbeid?: number | null
          timer_reise?: number | null
          total_kostnad?: number | null
          updated_at?: string | null
          utført_arbeid?: string | null
          visit_type?: Database["public"]["Enums"]["visit_type"] | null
        }
        Relationships: [
          {
            foreignKeyName: "service_visits_avtale_id_fkey"
            columns: ["avtale_id"]
            isOneToOne: false
            referencedRelation: "maintenance_agreements"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "service_visits_tekniker_id_fkey"
            columns: ["tekniker_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      supplier_refund_profiles: {
        Row: {
          created_at: string | null
          id: string
          notes: string | null
          refunds_parts: boolean | null
          refunds_travel: boolean | null
          refunds_vehicle: boolean | null
          refunds_work: boolean | null
          supplier_name: string
          travel_limit_km: number | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          notes?: string | null
          refunds_parts?: boolean | null
          refunds_travel?: boolean | null
          refunds_vehicle?: boolean | null
          refunds_work?: boolean | null
          supplier_name: string
          travel_limit_km?: number | null
        }
        Update: {
          created_at?: string | null
          id?: string
          notes?: string | null
          refunds_parts?: boolean | null
          refunds_travel?: boolean | null
          refunds_vehicle?: boolean | null
          refunds_work?: boolean | null
          supplier_name?: string
          travel_limit_km?: number | null
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
      user_consent: {
        Row: {
          consent_date: string
          consent_given: boolean
          consent_type: string
          id: string
          ip_address: unknown | null
          user_id: string
          withdrawn_date: string | null
        }
        Insert: {
          consent_date?: string
          consent_given?: boolean
          consent_type: string
          id?: string
          ip_address?: unknown | null
          user_id: string
          withdrawn_date?: string | null
        }
        Update: {
          consent_date?: string
          consent_given?: boolean
          consent_type?: string
          id?: string
          ip_address?: unknown | null
          user_id?: string
          withdrawn_date?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      anonymize_user_data: {
        Args: { p_user_id: string }
        Returns: boolean
      }
      calculate_supplier_scorecards: {
        Args: Record<PropertyKey, never>
        Returns: {
          supplier_name: string
          total_claims: number
          active_claims: number
          resolved_claims: number
          avg_response_time_days: number
          total_cost: number
          total_refunded: number
          refund_rate: number
          score: number
        }[]
      }
      check_overdue_claims: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      create_notification: {
        Args: {
          p_user_id: string
          p_claim_id: string
          p_type: string
          p_title: string
          p_message: string
          p_scheduled_for?: string
          p_metadata?: Json
        }
        Returns: string
      }
      export_user_data: {
        Args: { p_user_id: string }
        Returns: Json
      }
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
      generate_agreement_number: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      generate_claim_number: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      get_budget_progress: {
        Args: {
          p_year: number
          p_department?: Database["public"]["Enums"]["department"]
          p_supplier_name?: string
        }
        Returns: {
          target_amount: number
          actual_refunded: number
          progress_percentage: number
          remaining_amount: number
        }[]
      }
      get_current_user_role: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      log_data_access: {
        Args: {
          p_table_name: string
          p_operation: string
          p_record_id?: string
          p_old_values?: Json
          p_new_values?: Json
        }
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
        | "vestfold"
        | "agder"
        | "ekstern"
      issue_type:
        | "warranty"
        | "claim"
        | "service_callback"
        | "extended_warranty"
      maintenance_status: "planlagt" | "pågår" | "fullført" | "avbrutt"
      refund_status:
        | "pending"
        | "received"
        | "rejected"
        | "completed"
        | "partial"
      task_status: "avventer" | "fullført" | "utsatt"
      urgency_level: "low" | "normal" | "high" | "critical"
      user_role: "technician" | "admin" | "saksbehandler"
      visit_type: "rutine" | "reparasjon" | "installasjon" | "inspeksjon"
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
        "vestfold",
        "agder",
        "ekstern",
      ],
      issue_type: [
        "warranty",
        "claim",
        "service_callback",
        "extended_warranty",
      ],
      maintenance_status: ["planlagt", "pågår", "fullført", "avbrutt"],
      refund_status: [
        "pending",
        "received",
        "rejected",
        "completed",
        "partial",
      ],
      task_status: ["avventer", "fullført", "utsatt"],
      urgency_level: ["low", "normal", "high", "critical"],
      user_role: ["technician", "admin", "saksbehandler"],
      visit_type: ["rutine", "reparasjon", "installasjon", "inspeksjon"],
    },
  },
} as const
