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
      alertas: {
        Row: {
          created_at: string
          fecha_resolucion: string | null
          id: string
          mensaje: string
          pozo_id: string
          resolucion: string | null
          resuelto: boolean
          tipo: string
          unidad: string | null
          valor: number | null
        }
        Insert: {
          created_at?: string
          fecha_resolucion?: string | null
          id?: string
          mensaje: string
          pozo_id: string
          resolucion?: string | null
          resuelto?: boolean
          tipo: string
          unidad?: string | null
          valor?: number | null
        }
        Update: {
          created_at?: string
          fecha_resolucion?: string | null
          id?: string
          mensaje?: string
          pozo_id?: string
          resolucion?: string | null
          resuelto?: boolean
          tipo?: string
          unidad?: string | null
          valor?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "alertas_pozo_id_fkey"
            columns: ["pozo_id"]
            isOneToOne: false
            referencedRelation: "pozos"
            referencedColumns: ["id"]
          },
        ]
      }
      camaras_pozos: {
        Row: {
          descripcion: string | null
          id: string
          nombre: string
          pozo_id: string | null
          url_stream: string
        }
        Insert: {
          descripcion?: string | null
          id?: string
          nombre: string
          pozo_id?: string | null
          url_stream: string
        }
        Update: {
          descripcion?: string | null
          id?: string
          nombre?: string
          pozo_id?: string | null
          url_stream?: string
        }
        Relationships: [
          {
            foreignKeyName: "camaras_pozos_pozo_id_fkey"
            columns: ["pozo_id"]
            isOneToOne: false
            referencedRelation: "pozos"
            referencedColumns: ["id"]
          },
        ]
      }
      configuracion_usuario: {
        Row: {
          correo_activo: boolean | null
          created_at: string | null
          id: string
          idioma: string | null
          notificaciones_activas: boolean | null
          push_activo: boolean | null
          simulacion_activa: boolean | null
          sms_activo: boolean | null
          umbral_flujo: number | null
          umbral_presion: number | null
          umbral_temperatura: number | null
          usuario_id: string | null
        }
        Insert: {
          correo_activo?: boolean | null
          created_at?: string | null
          id?: string
          idioma?: string | null
          notificaciones_activas?: boolean | null
          push_activo?: boolean | null
          simulacion_activa?: boolean | null
          sms_activo?: boolean | null
          umbral_flujo?: number | null
          umbral_presion?: number | null
          umbral_temperatura?: number | null
          usuario_id?: string | null
        }
        Update: {
          correo_activo?: boolean | null
          created_at?: string | null
          id?: string
          idioma?: string | null
          notificaciones_activas?: boolean | null
          push_activo?: boolean | null
          simulacion_activa?: boolean | null
          sms_activo?: boolean | null
          umbral_flujo?: number | null
          umbral_presion?: number | null
          umbral_temperatura?: number | null
          usuario_id?: string | null
        }
        Relationships: []
      }
      fotos_pozos: {
        Row: {
          created_at: string | null
          descripcion: string | null
          id: string
          pozo_id: string | null
          url: string
          usuario: string
        }
        Insert: {
          created_at?: string | null
          descripcion?: string | null
          id?: string
          pozo_id?: string | null
          url: string
          usuario: string
        }
        Update: {
          created_at?: string | null
          descripcion?: string | null
          id?: string
          pozo_id?: string | null
          url?: string
          usuario?: string
        }
        Relationships: [
          {
            foreignKeyName: "fotos_pozos_pozo_id_fkey"
            columns: ["pozo_id"]
            isOneToOne: false
            referencedRelation: "pozos"
            referencedColumns: ["id"]
          },
        ]
      }
      pozos: {
        Row: {
          estado: string
          flujo: number
          id: string
          latitud: number
          longitud: number
          nivel: number
          nivel_porcentaje: number | null
          nombre: string
          presion: number
          produccion_diaria: number
          temperatura: number
          ultima_actualizacion: string | null
        }
        Insert: {
          estado: string
          flujo?: number
          id?: string
          latitud: number
          longitud: number
          nivel?: number
          nivel_porcentaje?: number | null
          nombre: string
          presion?: number
          produccion_diaria: number
          temperatura?: number
          ultima_actualizacion?: string | null
        }
        Update: {
          estado?: string
          flujo?: number
          id?: string
          latitud?: number
          longitud?: number
          nivel?: number
          nivel_porcentaje?: number | null
          nombre?: string
          presion?: number
          produccion_diaria?: number
          temperatura?: number
          ultima_actualizacion?: string | null
        }
        Relationships: []
      }
      pozos_mapa: {
        Row: {
          centro_latitud: number
          centro_longitud: number
          id: string
          nombre: string
          zoom_inicial: number
        }
        Insert: {
          centro_latitud: number
          centro_longitud: number
          id?: string
          nombre: string
          zoom_inicial: number
        }
        Update: {
          centro_latitud?: number
          centro_longitud?: number
          id?: string
          nombre?: string
          zoom_inicial?: number
        }
        Relationships: []
      }
      presion_historial: {
        Row: {
          fecha: string
          id: number
          pozo_id: string
          valor: number
        }
        Insert: {
          fecha?: string
          id?: number
          pozo_id: string
          valor: number
        }
        Update: {
          fecha?: string
          id?: number
          pozo_id?: string
          valor?: number
        }
        Relationships: [
          {
            foreignKeyName: "presion_historial_pozo_id_fkey"
            columns: ["pozo_id"]
            isOneToOne: false
            referencedRelation: "pozos"
            referencedColumns: ["id"]
          },
        ]
      }
      tareas: {
        Row: {
          asignado_a: string
          asignado_por: string
          created_at: string | null
          descripcion: string | null
          es_critica: boolean | null
          estado: string
          fecha_limite: string
          foto_url: string | null
          id: string
          link: string | null
          pozo_id: string | null
          titulo: string
        }
        Insert: {
          asignado_a: string
          asignado_por?: string
          created_at?: string | null
          descripcion?: string | null
          es_critica?: boolean | null
          estado: string
          fecha_limite: string
          foto_url?: string | null
          id?: string
          link?: string | null
          pozo_id?: string | null
          titulo: string
        }
        Update: {
          asignado_a?: string
          asignado_por?: string
          created_at?: string | null
          descripcion?: string | null
          es_critica?: boolean | null
          estado?: string
          fecha_limite?: string
          foto_url?: string | null
          id?: string
          link?: string | null
          pozo_id?: string | null
          titulo?: string
        }
        Relationships: [
          {
            foreignKeyName: "tareas_pozo_id_fkey"
            columns: ["pozo_id"]
            isOneToOne: false
            referencedRelation: "pozos"
            referencedColumns: ["id"]
          },
        ]
      }
      tareas_historial: {
        Row: {
          created_at: string
          id: string
          tarea_id: string
          tipo_cambio: string
          usuario_email: string
          valor_anterior: Json | null
          valor_nuevo: Json | null
        }
        Insert: {
          created_at?: string
          id?: string
          tarea_id: string
          tipo_cambio: string
          usuario_email: string
          valor_anterior?: Json | null
          valor_nuevo?: Json | null
        }
        Update: {
          created_at?: string
          id?: string
          tarea_id?: string
          tipo_cambio?: string
          usuario_email?: string
          valor_anterior?: Json | null
          valor_nuevo?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "tareas_historial_tarea_id_fkey"
            columns: ["tarea_id"]
            isOneToOne: false
            referencedRelation: "tareas"
            referencedColumns: ["id"]
          },
        ]
      }
      umbrales_pozo: {
        Row: {
          created_at: string | null
          id: string
          pozo_id: string
          umbral_flujo: number | null
          umbral_presion: number | null
          umbral_temperatura: number | null
          updated_at: string | null
          usuario_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          pozo_id: string
          umbral_flujo?: number | null
          umbral_presion?: number | null
          umbral_temperatura?: number | null
          updated_at?: string | null
          usuario_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          pozo_id?: string
          umbral_flujo?: number | null
          umbral_presion?: number | null
          umbral_temperatura?: number | null
          updated_at?: string | null
          usuario_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "umbrales_pozo_pozo_id_fkey"
            columns: ["pozo_id"]
            isOneToOne: false
            referencedRelation: "pozos"
            referencedColumns: ["id"]
          },
        ]
      }
      usuarios: {
        Row: {
          email: string
          fecha_creacion: string | null
          id: number
          nombre: string
          password: string
          rol: string
        }
        Insert: {
          email: string
          fecha_creacion?: string | null
          id?: number
          nombre: string
          password: string
          rol: string
        }
        Update: {
          email?: string
          fecha_creacion?: string | null
          id?: number
          nombre?: string
          password?: string
          rol?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      assign_well_to_user: {
        Args: { p_usuario_id: string; p_pozo_id: string }
        Returns: undefined
      }
      check_well_user_assignment: {
        Args: { p_usuario_id: string; p_pozo_id: string }
        Returns: boolean
      }
      comprobar_umbrales_pozo: {
        Args: { p_pozo_id: string; p_usuario_id: string }
        Returns: undefined
      }
      crear_pozo_completo: {
        Args: {
          p_nombre: string
          p_latitud: number
          p_longitud: number
          p_presion?: number
          p_temperatura?: number
          p_flujo?: number
          p_nivel?: number
          p_produccion_diaria?: number
          p_estado?: string
          p_usuario?: string
        }
        Returns: string
      }
      get_user_wells: {
        Args: { p_usuario_id: string }
        Returns: string[]
      }
      simular_valores_pozo: {
        Args: { p_pozo_id: string }
        Returns: undefined
      }
    }
    Enums: {
      [_ in never]: never
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
    Enums: {},
  },
} as const
