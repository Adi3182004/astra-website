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
  public: {
    Tables: {
      abandoned_carts: {
        Row: {
          contact_name: string | null
          created_at: string
          email: string | null
          id: string
          items: Json
          phone: string | null
          recovered: boolean
          reminded_at: string | null
          session_key: string
          subtotal: number
          updated_at: string
          user_id: string | null
        }
        Insert: {
          contact_name?: string | null
          created_at?: string
          email?: string | null
          id?: string
          items?: Json
          phone?: string | null
          recovered?: boolean
          reminded_at?: string | null
          session_key: string
          subtotal?: number
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          contact_name?: string | null
          created_at?: string
          email?: string | null
          id?: string
          items?: Json
          phone?: string | null
          recovered?: boolean
          reminded_at?: string | null
          session_key?: string
          subtotal?: number
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      admin_audit_log: {
        Row: {
          action: string
          actor_email: string | null
          actor_id: string | null
          after_data: Json | null
          before_data: Json | null
          created_at: string
          id: string
          label: string | null
          record_id: string | null
          rolled_back: boolean
          section: string
          table_name: string
        }
        Insert: {
          action: string
          actor_email?: string | null
          actor_id?: string | null
          after_data?: Json | null
          before_data?: Json | null
          created_at?: string
          id?: string
          label?: string | null
          record_id?: string | null
          rolled_back?: boolean
          section: string
          table_name: string
        }
        Update: {
          action?: string
          actor_email?: string | null
          actor_id?: string | null
          after_data?: Json | null
          before_data?: Json | null
          created_at?: string
          id?: string
          label?: string | null
          record_id?: string | null
          rolled_back?: boolean
          section?: string
          table_name?: string
        }
        Relationships: []
      }
      banners: {
        Row: {
          created_at: string
          cta_label: string | null
          cta_link: string | null
          id: string
          image_url: string
          is_active: boolean
          position: Database["public"]["Enums"]["banner_position"]
          sort_order: number
          subtitle: string | null
          text_style: Json
          title: string | null
          updated_at: string
          video_url: string | null
        }
        Insert: {
          created_at?: string
          cta_label?: string | null
          cta_link?: string | null
          id?: string
          image_url: string
          is_active?: boolean
          position?: Database["public"]["Enums"]["banner_position"]
          sort_order?: number
          subtitle?: string | null
          text_style?: Json
          title?: string | null
          updated_at?: string
          video_url?: string | null
        }
        Update: {
          created_at?: string
          cta_label?: string | null
          cta_link?: string | null
          id?: string
          image_url?: string
          is_active?: boolean
          position?: Database["public"]["Enums"]["banner_position"]
          sort_order?: number
          subtitle?: string | null
          text_style?: Json
          title?: string | null
          updated_at?: string
          video_url?: string | null
        }
        Relationships: []
      }
      categories: {
        Row: {
          created_at: string
          id: string
          image_url: string | null
          is_active: boolean
          name: string
          show_in_menu: boolean
          slug: string
          sort_order: number
          text_style: Json
          updated_at: string
          video_url: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          image_url?: string | null
          is_active?: boolean
          name: string
          show_in_menu?: boolean
          slug: string
          sort_order?: number
          text_style?: Json
          updated_at?: string
          video_url?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          image_url?: string | null
          is_active?: boolean
          name?: string
          show_in_menu?: boolean
          slug?: string
          sort_order?: number
          text_style?: Json
          updated_at?: string
          video_url?: string | null
        }
        Relationships: []
      }
      info_pages: {
        Row: {
          content: string
          created_at: string
          hero_image_url: string | null
          hero_video_url: string | null
          id: string
          is_active: boolean
          slug: string
          sort_order: number
          text_style: Json
          title: string
          updated_at: string
        }
        Insert: {
          content?: string
          created_at?: string
          hero_image_url?: string | null
          hero_video_url?: string | null
          id?: string
          is_active?: boolean
          slug: string
          sort_order?: number
          text_style?: Json
          title: string
          updated_at?: string
        }
        Update: {
          content?: string
          created_at?: string
          hero_image_url?: string | null
          hero_video_url?: string | null
          id?: string
          is_active?: boolean
          slug?: string
          sort_order?: number
          text_style?: Json
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      orders: {
        Row: {
          address: string | null
          contact_name: string
          created_at: string
          email: string | null
          id: string
          items: Json
          notes: string | null
          phone: string
          status: Database["public"]["Enums"]["order_status"]
          subtotal: number
          updated_at: string
          user_id: string | null
        }
        Insert: {
          address?: string | null
          contact_name: string
          created_at?: string
          email?: string | null
          id?: string
          items?: Json
          notes?: string | null
          phone: string
          status?: Database["public"]["Enums"]["order_status"]
          subtotal?: number
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          address?: string | null
          contact_name?: string
          created_at?: string
          email?: string | null
          id?: string
          items?: Json
          notes?: string | null
          phone?: string
          status?: Database["public"]["Enums"]["order_status"]
          subtotal?: number
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      product_images: {
        Row: {
          created_at: string
          id: string
          product_id: string
          sort_order: number
          url: string
        }
        Insert: {
          created_at?: string
          id?: string
          product_id: string
          sort_order?: number
          url: string
        }
        Update: {
          created_at?: string
          id?: string
          product_id?: string
          sort_order?: number
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_images_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          category_id: string | null
          compare_at_price: number | null
          created_at: string
          description: string | null
          id: string
          is_active: boolean
          is_featured: boolean
          name: string
          out_of_stock: boolean
          price: number
          show_stock: boolean
          slug: string
          sort_order: number
          stock: number
          stock_prefix: string | null
          stock_suffix: string | null
          text_style: Json
          updated_at: string
          video_url: string | null
        }
        Insert: {
          category_id?: string | null
          compare_at_price?: number | null
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          is_featured?: boolean
          name: string
          out_of_stock?: boolean
          price?: number
          show_stock?: boolean
          slug: string
          sort_order?: number
          stock?: number
          stock_prefix?: string | null
          stock_suffix?: string | null
          text_style?: Json
          updated_at?: string
          video_url?: string | null
        }
        Update: {
          category_id?: string | null
          compare_at_price?: number | null
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          is_featured?: boolean
          name?: string
          out_of_stock?: boolean
          price?: number
          show_stock?: boolean
          slug?: string
          sort_order?: number
          stock?: number
          stock_prefix?: string | null
          stock_suffix?: string | null
          text_style?: Json
          updated_at?: string
          video_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "products_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          address: string | null
          city: string | null
          created_at: string
          email: string | null
          full_name: string | null
          id: string
          phone: string | null
          pincode: string | null
          state: string | null
          updated_at: string
        }
        Insert: {
          address?: string | null
          city?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id: string
          phone?: string | null
          pincode?: string | null
          state?: string | null
          updated_at?: string
        }
        Update: {
          address?: string | null
          city?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          phone?: string | null
          pincode?: string | null
          state?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      reviews: {
        Row: {
          author: string
          body: string
          created_at: string
          id: string
          image_url: string | null
          is_active: boolean
          product_id: string | null
          rating: number
          sort_order: number
          text_style: Json
          updated_at: string
          video_url: string | null
        }
        Insert: {
          author: string
          body: string
          created_at?: string
          id?: string
          image_url?: string | null
          is_active?: boolean
          product_id?: string | null
          rating?: number
          sort_order?: number
          text_style?: Json
          updated_at?: string
          video_url?: string | null
        }
        Update: {
          author?: string
          body?: string
          created_at?: string
          id?: string
          image_url?: string | null
          is_active?: boolean
          product_id?: string | null
          rating?: number
          sort_order?: number
          text_style?: Json
          updated_at?: string
          video_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "reviews_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      seo_overrides: {
        Row: {
          canonical: string | null
          created_at: string
          description: string | null
          id: string
          json_ld: Json | null
          no_index: boolean
          og_description: string | null
          og_image: string | null
          og_title: string | null
          route: string
          title: string | null
          twitter_card: string | null
          updated_at: string
        }
        Insert: {
          canonical?: string | null
          created_at?: string
          description?: string | null
          id?: string
          json_ld?: Json | null
          no_index?: boolean
          og_description?: string | null
          og_image?: string | null
          og_title?: string | null
          route: string
          title?: string | null
          twitter_card?: string | null
          updated_at?: string
        }
        Update: {
          canonical?: string | null
          created_at?: string
          description?: string | null
          id?: string
          json_ld?: Json | null
          no_index?: boolean
          og_description?: string | null
          og_image?: string | null
          og_title?: string | null
          route?: string
          title?: string | null
          twitter_card?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      service_areas: {
        Row: {
          city: string
          created_at: string
          delivery_days: number
          id: string
          is_active: boolean
          pincode: string
          state: string
          updated_at: string
        }
        Insert: {
          city?: string
          created_at?: string
          delivery_days?: number
          id?: string
          is_active?: boolean
          pincode: string
          state?: string
          updated_at?: string
        }
        Update: {
          city?: string
          created_at?: string
          delivery_days?: number
          id?: string
          is_active?: boolean
          pincode?: string
          state?: string
          updated_at?: string
        }
        Relationships: []
      }
      site_settings: {
        Row: {
          announcement: string | null
          brand_tagline: string
          contact_email: string
          id: number
          pincode_images: string[]
          search_placeholders: string[]
          theme: Json
          updated_at: string
          whatsapp_number: string
        }
        Insert: {
          announcement?: string | null
          brand_tagline?: string
          contact_email?: string
          id?: number
          pincode_images?: string[]
          search_placeholders?: string[]
          theme?: Json
          updated_at?: string
          whatsapp_number?: string
        }
        Update: {
          announcement?: string | null
          brand_tagline?: string
          contact_email?: string
          id?: number
          pincode_images?: string[]
          search_placeholders?: string[]
          theme?: Json
          updated_at?: string
          whatsapp_number?: string
        }
        Relationships: []
      }
      site_videos: {
        Row: {
          created_at: string
          id: string
          is_active: boolean
          poster_url: string | null
          sort_order: number
          subtitle: string | null
          text_style: Json
          title: string | null
          updated_at: string
          video_url: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_active?: boolean
          poster_url?: string | null
          sort_order?: number
          subtitle?: string | null
          text_style?: Json
          title?: string | null
          updated_at?: string
          video_url: string
        }
        Update: {
          created_at?: string
          id?: string
          is_active?: boolean
          poster_url?: string | null
          sort_order?: number
          subtitle?: string | null
          text_style?: Json
          title?: string | null
          updated_at?: string
          video_url?: string
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
          role: Database["public"]["Enums"]["app_role"]
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
      wishlists: {
        Row: {
          created_at: string
          id: string
          product_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          product_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          product_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "wishlists_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_staff: { Args: { _user_id: string }; Returns: boolean }
    }
    Enums: {
      app_role: "admin" | "user" | "editor"
      banner_position: "hero" | "strip" | "collection"
      order_status: "new" | "confirmed" | "shipped" | "delivered" | "cancelled"
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
      app_role: ["admin", "user", "editor"],
      banner_position: ["hero", "strip", "collection"],
      order_status: ["new", "confirmed", "shipped", "delivered", "cancelled"],
    },
  },
} as const
