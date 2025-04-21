
import { supabase } from "@/integrations/supabase/client";
import { ensureTestUser } from "./ensureTestUser";

// Helper function to run SQL directly for database operations not in the API
async function runSQL(query: string, params?: Record<string, any>) {
  try {
    const { data, error } = await supabase.rpc('run_sql', { 
      sql_query: query,
      params: params || {}
    });
    
    if (error) {
      console.error("SQL error:", error);
      return null;
    }
    return data;
  } catch (e) {
    console.error("SQL execution error:", e);
    return null;
  }
}

// Check if a table exists using direct SQL
async function checkTableExists(tableName: string): Promise<boolean> {
  try {
    const { data, error } = await supabase.rpc('run_sql', {
      sql_query: `
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_schema = 'public' 
          AND table_name = '${tableName}'
        )
      `
    });
    
    if (error) {
      console.error("Error checking table:", error);
      return false;
    }
    
    // Fix: Check if data is an array and has elements before accessing properties
    // Also ensure we're safely accessing the 'exists' property which might be of different types
    if (Array.isArray(data) && data.length > 0) {
      // Handle the case where exists might be represented as boolean, string 'true'/'false', or other formats
      const existsValue = data[0]?.exists;
      return existsValue === true || existsValue === 'true' || existsValue === 't';
    }
    return false;
  } catch (e) {
    console.error("Error in checkTableExists:", e);
    return false;
  }
}

async function initializeTestData() {
  try {
    console.log("Iniciando proceso de creación de datos de prueba...");
    
    // 1. Make sure we have a test user in both Auth and custom table
    await ensureTestUser();
    
    // 2. Get the test user ID from the custom table
    console.log("Obteniendo ID del usuario de prueba...");
    let testUserId: string;
    {
      const { data: foundUser, error } = await supabase
        .from("usuarios")
        .select("id")
        .eq("email", "prueba@gmail.com")
        .maybeSingle();

      if (!foundUser) {
        console.error("Usuario prueba@gmail.com no encontrado, no se pueden asignar pozos.");
        return;
      }
      
      // Convert ID to string if it's a number
      testUserId = String(foundUser.id);
      console.log("Usuario encontrado con ID:", testUserId);
    }
    
    // 3. Eliminar datos existentes (cuidado en entornos de producción)
    console.log("Eliminando datos existentes...");
    await supabase.from("fotos_pozos").delete().neq("id", "0");
    await supabase.from("presion_historial").delete().neq("id", 0);
    await supabase.from("alertas").delete().neq("id", "0");
    await supabase.from("tareas").delete().neq("id", "0");
    await supabase.from("camaras_pozos").delete().neq("id", "0");
    await supabase.from("pozos_mapas_relacion").delete().neq("id", "0");
    await supabase.from("pozos").delete().neq("id", "0");
    await supabase.from("pozos_mapa").delete().neq("id", "0");
    console.log("Datos existentes eliminados correctamente.");

    // 4. Crear mapa por defecto para OpenStreetMap (nombre explícito)
    console.log("Creando mapa por defecto...");
    let mapId: string;
    {
      const { data: mapa, error: mapaError } = await supabase
        .from("pozos_mapa")
        .insert({
          nombre: "Mapa de prueba OpenStreetMap",
          centro_latitud: 19.4326,
          centro_longitud: -99.1332,
          zoom_inicial: 5,
        })
        .select("id")
        .single();
      if (mapaError) {
        console.error("Error al crear mapa:", mapaError);
        throw mapaError;
      }
      mapId = mapa.id;
      console.log("Mapa creado con ID:", mapId);
    }

    // 5. Crear pozos de ejemplo
    console.log("Creando pozos de ejemplo...");
    const exampleWells = [
      {
        nombre: "Pozo Alpha",
        latitud: 19.4326,
        longitud: -99.1332,
        estado: "activo",
        produccion_diaria: 1250,
        temperatura: 85,
        presion: 2100,
        flujo: 450,
        nivel: 75,
      },
      {
        nombre: "Pozo Beta",
        latitud: 19.4526,
        longitud: -99.1532,
        estado: "advertencia",
        produccion_diaria: 980,
        temperatura: 92,
        presion: 1950,
        flujo: 380,
        nivel: 65,
      },
      {
        nombre: "Pozo Gamma",
        latitud: 19.4126,
        longitud: -99.1132,
        estado: "fuera_de_servicio",
        produccion_diaria: 0,
        temperatura: 65,
        presion: 850,
        flujo: 0,
        nivel: 20,
      },
    ];

    let wellList: { id: string; nombre: string }[] = [];
    for (const w of exampleWells) {
      const { data: well, error: wellError } = await supabase
        .from("pozos")
        .insert(w)
        .select("id,nombre")
        .single();
      if (wellError) {
        console.error("Error al crear pozo:", wellError);
        throw wellError;
      }
      wellList.push({ id: well.id, nombre: well.nombre });
      console.log(`Pozo ${well.nombre} creado con ID: ${well.id}`);
    }

    // 6. Relacionar pozos con el mapa creado (tabla de relación)
    console.log("Relacionando pozos con el mapa...");
    for (const well of wellList) {
      const { error: relError } = await supabase.from("pozos_mapas_relacion").insert({
        pozo_id: well.id,
        pozos_mapa_id: mapId,
      });
      
      if (relError) {
        console.error(`Error al relacionar pozo ${well.id} con mapa:`, relError);
      } else {
        console.log(`Pozo ${well.nombre} relacionado con mapa ${mapId}`);
      }
    }
    
    // 7. Asociar el usuario con el mapa
    console.log("Asociando usuario con mapa...");
    // Fix: Explicitly convert mapId to number if needed for type compatibility
    const { error: userMapError } = await supabase
      .from("usuarios")
      .update({ pozos_mapa_id: mapId })
      .eq("id", testUserId);
      
    if (userMapError) {
      console.error("Error asociando usuario con mapa:", userMapError);
    } else {
      console.log(`Usuario ${testUserId} asociado con mapa ${mapId}`);
    }

    // 8. Verificar si existe la tabla pozos_usuarios
    console.log("Verificando si existe la tabla pozos_usuarios...");
    const tableExists = await checkTableExists('pozos_usuarios');
    
    if (!tableExists) {
      console.log("La tabla pozos_usuarios no existe. Creándola...");
      
      // Crear tabla directamente con SQL ya que no tenemos la función RPC
      await runSQL(`
        CREATE TABLE IF NOT EXISTS public.pozos_usuarios (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          usuario_id UUID NOT NULL,
          pozo_id UUID NOT NULL,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
          UNIQUE(usuario_id, pozo_id)
        );
        
        COMMENT ON TABLE public.pozos_usuarios IS 'Tabla de relación entre usuarios y pozos';
        
        -- Add indexes for better performance
        CREATE INDEX IF NOT EXISTS idx_pozos_usuarios_usuario_id ON public.pozos_usuarios(usuario_id);
        CREATE INDEX IF NOT EXISTS idx_pozos_usuarios_pozo_id ON public.pozos_usuarios(pozo_id);
      `);
      
      console.log("Tabla pozos_usuarios creada correctamente");
    } else {
      console.log("La tabla pozos_usuarios ya existe");
    }
    
    // 9. Asignar TODOS los pozos al usuario de prueba directamente con SQL
    console.log("Asignando pozos al usuario de prueba...");
    for (const well of wellList) {
      try {
        console.log(`Asignando pozo ${well.nombre} (${well.id}) al usuario ${testUserId}...`);
        
        // Use SQL to insert directly since the table is not in the types
        await runSQL(`
          INSERT INTO public.pozos_usuarios (usuario_id, pozo_id)
          VALUES ('${testUserId}', '${well.id}')
          ON CONFLICT (usuario_id, pozo_id) DO NOTHING
        `);
        
        console.log(`Pozo ${well.nombre} asignado correctamente mediante SQL directa`);
      } catch (err) {
        console.error(`Error al asignar pozo ${well.id}:`, err);
      }
    }

    console.log("Datos de prueba inicializados correctamente.");
    
    // Verificar asignaciones con SQL
    console.log("Verificando asignaciones de pozos...");
    try {
      const result = await runSQL(`
        SELECT pozo_id FROM public.pozos_usuarios 
        WHERE usuario_id = '${testUserId}'
      `);
      
      // Fix: Check if result is an array before accessing length
      const assignedCount = Array.isArray(result) ? result.length : 0;
      console.log(`El usuario tiene ${assignedCount} pozos asignados:`, result);
    } catch (e) {
      console.error("Error al verificar asignaciones:", e);
    }
  } catch (err) {
    console.error("Error inicializando datos de prueba:", err);
  }
}

if (require.main === module) {
  initializeTestData();
}

export { initializeTestData };
