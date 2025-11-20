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
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      categories: {
        Row: {
          color: string | null
          created_at: string | null
          description: string | null
          icon: string | null
          id: string
          is_archived: boolean | null
          name: string
          slug: string
          sort_order: number | null
          updated_at: string | null
        }
        Insert: {
          color?: string | null
          created_at?: string | null
          description?: string | null
          icon?: string | null
          id?: string
          is_archived?: boolean | null
          name: string
          slug: string
          sort_order?: number | null
          updated_at?: string | null
        }
        Update: {
          color?: string | null
          created_at?: string | null
          description?: string | null
          icon?: string | null
          id?: string
          is_archived?: boolean | null
          name?: string
          slug?: string
          sort_order?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      generation_logs: {
        Row: {
          created_at: string
          id: string
          input_tokens: number | null
          model_id: string | null
          output_tokens: number | null
          prompt_draft_id: string | null
          total_tokens: number | null
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          input_tokens?: number | null
          model_id?: string | null
          output_tokens?: number | null
          prompt_draft_id?: string | null
          total_tokens?: number | null
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          input_tokens?: number | null
          model_id?: string | null
          output_tokens?: number | null
          prompt_draft_id?: string | null
          total_tokens?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "generation_logs_model_id_fkey"
            columns: ["model_id"]
            isOneToOne: false
            referencedRelation: "models"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "generation_logs_prompt_draft_id_fkey"
            columns: ["prompt_draft_id"]
            isOneToOne: false
            referencedRelation: "prompt_drafts"
            referencedColumns: ["id"]
          },
        ]
      }
      guide_pages: {
        Row: {
          content_md: string | null
          created_at: string | null
          id: string
          is_published: boolean | null
          parent_id: string | null
          slug: string
          sort_order: number | null
          title: string
          updated_at: string | null
        }
        Insert: {
          content_md?: string | null
          created_at?: string | null
          id?: string
          is_published?: boolean | null
          parent_id?: string | null
          slug: string
          sort_order?: number | null
          title: string
          updated_at?: string | null
        }
        Update: {
          content_md?: string | null
          created_at?: string | null
          id?: string
          is_published?: boolean | null
          parent_id?: string | null
          slug?: string
          sort_order?: number | null
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "guide_pages_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "guide_pages"
            referencedColumns: ["id"]
          },
        ]
      }
      messages: {
        Row: {
          content: string
          created_at: string | null
          id: string
          role: Database["public"]["Enums"]["message_role"]
          session_id: string
        }
        Insert: {
          content: string
          created_at?: string | null
          id?: string
          role: Database["public"]["Enums"]["message_role"]
          session_id: string
        }
        Update: {
          content?: string
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["message_role"]
          session_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "messages_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      models: {
        Row: {
          api_key: string | null
          created_at: string | null
          description: string | null
          id: string
          max_tokens: number | null
          name: string
          provider: Database["public"]["Enums"]["model_provider"]
          provider_model: string
          status: Database["public"]["Enums"]["model_status"]
          updated_at: string | null
        }
        Insert: {
          api_key?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          max_tokens?: number | null
          name: string
          provider: Database["public"]["Enums"]["model_provider"]
          provider_model: string
          status?: Database["public"]["Enums"]["model_status"]
          updated_at?: string | null
        }
        Update: {
          api_key?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          max_tokens?: number | null
          name?: string
          provider?: Database["public"]["Enums"]["model_provider"]
          provider_model?: string
          status?: Database["public"]["Enums"]["model_status"]
          updated_at?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          full_name: string | null
          id: string
          updated_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          full_name?: string | null
          id: string
          updated_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          full_name?: string | null
          id?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      prompt_drafts: {
        Row: {
          category_id: string | null
          created_at: string | null
          description: string | null
          emoji: string | null
          id: string
          image_url: string | null
          model_id: string | null
          prompt_text: string
          title: string
          updated_at: string | null
          user_id: string | null
          variables: Json | null
        }
        Insert: {
          category_id?: string | null
          created_at?: string | null
          description?: string | null
          emoji?: string | null
          id?: string
          image_url?: string | null
          model_id?: string | null
          prompt_text: string
          title: string
          updated_at?: string | null
          user_id?: string | null
          variables?: Json | null
        }
        Update: {
          category_id?: string | null
          created_at?: string | null
          description?: string | null
          emoji?: string | null
          id?: string
          image_url?: string | null
          model_id?: string | null
          prompt_text?: string
          title?: string
          updated_at?: string | null
          user_id?: string | null
          variables?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "prompt_drafts_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "prompt_drafts_model_id_fkey"
            columns: ["model_id"]
            isOneToOne: false
            referencedRelation: "models"
            referencedColumns: ["id"]
          },
        ]
      }
      prompt_versions: {
        Row: {
          category_id: string | null
          created_at: string | null
          description: string | null
          emoji: string | null
          id: string
          image_url: string | null
          model_id: string | null
          prompt_draft_id: string
          prompt_text: string
          published_at: string | null
          published_by: string | null
          title: string
          variables: Json | null
          version_number: number
        }
        Insert: {
          category_id?: string | null
          created_at?: string | null
          description?: string | null
          emoji?: string | null
          id?: string
          image_url?: string | null
          model_id?: string | null
          prompt_draft_id: string
          prompt_text: string
          published_at?: string | null
          published_by?: string | null
          title: string
          variables?: Json | null
          version_number: number
        }
        Update: {
          category_id?: string | null
          created_at?: string | null
          description?: string | null
          emoji?: string | null
          id?: string
          image_url?: string | null
          model_id?: string | null
          prompt_draft_id?: string
          prompt_text?: string
          published_at?: string | null
          published_by?: string | null
          title?: string
          variables?: Json | null
          version_number?: number
        }
        Relationships: [
          {
            foreignKeyName: "prompt_versions_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "prompt_versions_model_id_fkey"
            columns: ["model_id"]
            isOneToOne: false
            referencedRelation: "models"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "prompt_versions_prompt_draft_id_fkey"
            columns: ["prompt_draft_id"]
            isOneToOne: false
            referencedRelation: "prompt_drafts"
            referencedColumns: ["id"]
          },
        ]
      }
      sessions: {
        Row: {
          created_at: string | null
          id: string
          model_id: string | null
          prompt_version_id: string | null
          title: string | null
          user_id: string
          variable_inputs: Json | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          model_id?: string | null
          prompt_version_id?: string | null
          title?: string | null
          user_id: string
          variable_inputs?: Json | null
        }
        Update: {
          created_at?: string | null
          id?: string
          model_id?: string | null
          prompt_version_id?: string | null
          title?: string | null
          user_id?: string
          variable_inputs?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "sessions_model_id_fkey"
            columns: ["model_id"]
            isOneToOne: false
            referencedRelation: "models"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sessions_prompt_version_id_fkey"
            columns: ["prompt_version_id"]
            isOneToOne: false
            referencedRelation: "prompt_versions"
            referencedColumns: ["id"]
          },
        ]
      }
      storage_logs: {
        Row: {
          bucket: string
          content_type: string | null
          created_at: string | null
          deleted_at: string | null
          id: string
          path: string
          size_bytes: number | null
          user_id: string | null
        }
        Insert: {
          bucket: string
          content_type?: string | null
          created_at?: string | null
          deleted_at?: string | null
          id?: string
          path: string
          size_bytes?: number | null
          user_id?: string | null
        }
        Update: {
          bucket?: string
          content_type?: string | null
          created_at?: string | null
          deleted_at?: string | null
          id?: string
          path?: string
          size_bytes?: number | null
          user_id?: string | null
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string | null
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
      has_role: {
        Args: {
          p_role: Database["public"]["Enums"]["app_role"]
          p_user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "editor" | "user"
      message_role: "user" | "assistant" | "system"
      model_provider: "openai" | "anthropic" | "google" | "perplexity"
      model_status: "active" | "deprecated" | "disabled"
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
      app_role: ["admin", "editor", "user"],
      message_role: ["user", "assistant", "system"],
      model_provider: ["openai", "anthropic", "google", "perplexity"],
      model_status: ["active", "deprecated", "disabled"],
    },
  },
} as const
