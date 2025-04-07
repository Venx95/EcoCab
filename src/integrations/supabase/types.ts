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
      conversations: {
        Row: {
          id: string
          last_message: string | null
          last_message_time: string | null
          user1_id: string
          user2_id: string
        }
        Insert: {
          id?: string
          last_message?: string | null
          last_message_time?: string | null
          user1_id: string
          user2_id: string
        }
        Update: {
          id?: string
          last_message?: string | null
          last_message_time?: string | null
          user1_id?: string
          user2_id?: string
        }
        Relationships: []
      }
      messages: {
        Row: {
          conversation_id: string
          id: string
          read: boolean | null
          receiver_id: string
          sender_id: string
          text: string
          timestamp: string | null
        }
        Insert: {
          conversation_id: string
          id?: string
          read?: boolean | null
          receiver_id: string
          sender_id: string
          text: string
          timestamp?: string | null
        }
        Update: {
          conversation_id?: string
          id?: string
          read?: boolean | null
          receiver_id?: string
          sender_id?: string
          text?: string
          timestamp?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          email: string
          id: string
          name: string
          phone_number: string | null
          photo_url: string | null
        }
        Insert: {
          email: string
          id: string
          name: string
          phone_number?: string | null
          photo_url?: string | null
        }
        Update: {
          email?: string
          id?: string
          name?: string
          phone_number?: string | null
          photo_url?: string | null
        }
        Relationships: []
      }
      rides: {
        Row: {
          car_name: string
          created_at: string | null
          destination: string
          driver_id: string
          fare: number
          id: string
          is_courier_available: boolean | null
          luggage_capacity: number | null
          pickup_date: string
          pickup_point: string
          pickup_time_end: string
          pickup_time_start: string
          seats: number
        }
        Insert: {
          car_name: string
          created_at?: string | null
          destination: string
          driver_id: string
          fare: number
          id?: string
          is_courier_available?: boolean | null
          luggage_capacity?: number | null
          pickup_date: string
          pickup_point: string
          pickup_time_end: string
          pickup_time_start: string
          seats: number
        }
        Update: {
          car_name?: string
          created_at?: string | null
          destination?: string
          driver_id?: string
          fare?: number
          id?: string
          is_courier_available?: boolean | null
          luggage_capacity?: number | null
          pickup_date?: string
          pickup_point?: string
          pickup_time_end?: string
          pickup_time_start?: string
          seats?: number
        }
        Relationships: []
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

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never
