
import { supabase } from "@/integrations/supabase/client";
import { ensureTestUser } from "./ensureTestUser";

// Helper function to run SQL directly for database operations not in the API
async function runSQL(query: string, params?: Record<string, any>) {
  try {
    const { data, error } = await supabase.functions.invoke('execute-sql', {
      body: { 
        sql_query: query,
        params: params || {}
      }
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
    const result = await runSQL(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = '${tableName}'
      )
    `);
    
    if (!result || !Array.isArray(result) || result.length === 0) {
      return false;
    }
    
    return result[0]?.exists === true;
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
    let testUserId: number;
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

      // Usar número ya que usuarios.id es integer
      testUserId = foundUser.id;
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

    // 4. Crear mapa centrado en Añelo (Neuquén)
    console.log("Creando mapa por defecto en Añelo...");
    let mapId: string;
    {
      const { data: mapa, error: mapaError } = await supabase
        .from("pozos_mapa")
        .insert({
          nombre: "Mapa Añelo OpenStreetMap",
          centro_latitud: -38.6228,
          centro_longitud: -68.5738,
          zoom_inicial: 12,
        })
        .select("id")
        .single();
      if (mapaError) {
        console.error("Error al crear mapa:", mapaError);
        throw mapaError;
      }
      mapId = mapa.id;
      console.log("Mapa Añelo creado con ID:", mapId);
    }

    // 5. Crear 3 pozos de ejemplo (usando coordenadas alrededor de Añelo)
    console.log("Creando pozos de ejemplo en Añelo...");
    const exampleWells = [
      {
        nombre: "Añelo Norte",
        latitud: -38.6128,
        longitud: -68.5680,
        estado: "activo",
        produccion_diaria: 1900,
        temperatura: 83,
        presion: 2400,
        flujo: 510,
        nivel: 77,
      },
      {
        nombre: "Añelo Centro",
        latitud: -38.6225,
        longitud: -68.5738,
        estado: "advertencia",
        produccion_diaria: 1620,
        temperatura: 91,
        presion: 1850,
        flujo: 385,
        nivel: 62,
      },
      {
        nombre: "Añelo Sur",
        latitud: -38.6320,
        longitud: -68.5850,
        estado: "fuera_de_servicio",
        produccion_diaria: 0,
        temperatura: 70,
        presion: 980,
        flujo: 0,
        nivel: 19,
      },
    ];

    let wellList: { id: string; nombre: string }[] = [];
    for (const wellData of exampleWells) {
      const { data: well, error: wellError } = await supabase
        .from("pozos")
        .insert(wellData)
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

    // 7. Asociar el usuario con el mapa (usuarios.id es integer)
    console.log("Asociando usuario con mapa...");
    const { error: userMapError } = await supabase
      .from("usuarios")
      .update({ pozos_mapa_id: mapId })
      .eq("id", testUserId);

    if (userMapError) {
      console.error("Error asociando usuario con mapa:", userMapError);
    } else {
      console.log(`Usuario ${testUserId} asociado con mapa ${mapId}`);
    }

    // 8. Verificar si existe la tabla pozos_usuarios y crear si falta
    console.log("Verificando si existe la tabla pozos_usuarios...");
    const tableExists = await checkTableExists("pozos_usuarios");

    if (!tableExists) {
      console.log("La tabla pozos_usuarios no existe. Creándola...");
      await runSQL(`
        CREATE TABLE IF NOT EXISTS public.pozos_usuarios (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          usuario_id INT NOT NULL,
          pozo_id UUID NOT NULL,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
          UNIQUE(usuario_id, pozo_id)
        );

        COMMENT ON TABLE public.pozos_usuarios IS 'Tabla de relación entre usuarios y pozos';

        CREATE INDEX IF NOT EXISTS idx_pozos_usuarios_usuario_id ON public.pozos_usuarios(usuario_id);
        CREATE INDEX IF NOT EXISTS idx_pozos_usuarios_pozo_id ON public.pozos_usuarios(pozo_id);
      `);
      console.log("Tabla pozos_usuarios creada correctamente");
    } else {
      console.log("La tabla pozos_usuarios ya existe");
    }

    // 9. Asignar TODOS los pozos al usuario de prueba mediante SQL directa
    console.log("Asignando pozos al usuario de prueba (Añelo)...");
    for (const well of wellList) {
      try {
        console.log(`Asignando pozo ${well.nombre} (${well.id}) al usuario ${testUserId}...`);
        await runSQL(`
          INSERT INTO public.pozos_usuarios (usuario_id, pozo_id)
          VALUES (${testUserId}, '${well.id}')
          ON CONFLICT (usuario_id, pozo_id) DO NOTHING
        `);
        console.log(`Pozo ${well.nombre} asignado correctamente mediante SQL directa`);
      } catch (err) {
        console.error(`Error al asignar pozo ${well.id}:`, err);
      }
    }

    // Simular algunos datos adicionales para los pozos creados (presion_historial, tareas, alertas, etc.)
    console.log("Simulando datos adicionales para los pozos...");
    for (const well of wellList) {
      // Get the example well data that corresponds to this well
      const wellData = exampleWells.find((x) => x.nombre === well.nombre);
      if (!wellData) {
        console.warn(`No se encontraron datos de ejemplo para el pozo ${well.nombre}`);
        continue;
      }

      // Crear historial de presión de 24 horas (hora a hora) para cada pozo
      for (let i = 0; i < 24; i++) {
        const fecha = new Date();
        fecha.setHours(fecha.getHours() - i);
        // Simulación: presión base +-10%
        const base = wellData.presion || 2000;
        const variance = base * 0.1;
        const presion = base + (Math.random() * variance * 2 - variance);

        await supabase.from("presion_historial").insert({
          pozo_id: well.id,
          fecha: fecha.toISOString(),
          valor: presion,
        });
      }
      // Crear alerta simulada
      await supabase.from("alertas").insert({
        pozo_id: well.id,
        mensaje: "Presión alta detectada",
        tipo: wellData.estado === "fuera_de_servicio" ? "critica" : "advertencia",
        valor: (wellData.presion || 2000) + 250,
        unidad: "psi",
        resuelto: false,
      });
      // Crear tarea simulada
      await supabase.from("tareas").insert({
        titulo: "Verificación de sensores",
        pozo_id: well.id,
        asignado_a: "prueba@gmail.com",
        fecha_limite: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
        es_critica: wellData.estado === "fuera_de_servicio",
        estado: "pendiente",
      });
    }

    console.log("Datos de prueba inicializados correctamente (Añelo, 3 pozos, datos simulados).");

    // Verificar asignaciones con SQL
    console.log("Verificando asignaciones de pozos...");
    try {
      const result = await runSQL(`
        SELECT pozo_id FROM public.pozos_usuarios 
        WHERE usuario_id = ${testUserId}
      `);

      const wellsCount = result && Array.isArray(result) ? result.length : 0;
      console.log(`El usuario tiene ${wellsCount} pozos asignados:`, result);
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
