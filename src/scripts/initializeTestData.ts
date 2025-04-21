
import { supabase } from "@/integrations/supabase/client";

async function initializeTestData() {
  try {
    console.log("Iniciando proceso de creación de datos de prueba...");
    
    // 1. Eliminar datos existentes (cuidado en entornos de producción)
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

    // 2. Crear mapa por defecto para OpenStreetMap (nombre explícito)
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

    // 3. Crear usuario de prueba en la DB pública (no solo en auth)
    console.log("Verificando usuario de prueba...");
    let testUserId: string;
    {
      const { data: foundUser, error } = await supabase
        .from("usuarios")
        .select("id,email")
        .eq("email", "prueba@gmail.com")
        .maybeSingle();

      if (!foundUser) {
        console.log("Usuario prueba@gmail.com no encontrado, creando uno nuevo...");
        const { data: newUser, error: userError } = await supabase
          .from("usuarios")
          .insert({
            email: "prueba@gmail.com",
            password: "contraseña123",
            nombre: "Usuario Prueba",
            rol: "ingeniero",
          })
          .select("id")
          .single();
        if (userError) {
          console.error("Error al crear usuario:", userError);
          throw userError;
        }
        testUserId = String(newUser.id);
        console.log("Usuario creado con ID:", testUserId);
      } else {
        testUserId = String(foundUser.id);
        console.log("Usuario encontrado con ID:", testUserId);
      }
    }

    // 4. Crear pozos de ejemplo
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

    // 5. Relacionar pozos con el mapa creado (tabla de relación)
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

    // 6. Crear tabla pozos_usuarios si no existe
    // Esta tabla debe existir para la función assign_well_to_user
    console.log("Verificando si existe la tabla pozos_usuarios...");
    
    // 7. Asignar TODOS los pozos al usuario de prueba
    console.log("Asignando pozos al usuario de prueba...");
    for (const well of wellList) {
      try {
        console.log(`Asignando pozo ${well.nombre} (${well.id}) al usuario ${testUserId}...`);
        
        // Llamar directamente a la RPC assign_well_to_user
        const { error: assignError } = await supabase.rpc("assign_well_to_user", {
          p_usuario_id: testUserId,
          p_pozo_id: well.id,
        });
        
        if (assignError) {
          console.error(`Error asignando pozo ${well.id} al usuario ${testUserId}:`, assignError);
        } else {
          console.log(`Pozo ${well.nombre} asignado correctamente al usuario de prueba`);
        }
      } catch (err) {
        console.error(`Error al asignar pozo ${well.id}:`, err);
      }
    }

    console.log("Datos de prueba inicializados correctamente.");
    
    // Verificar asignaciones
    console.log("Verificando asignaciones de pozos...");
    const { data: userWells, error: checkError } = await supabase.rpc("get_user_wells", {
      p_usuario_id: testUserId
    });
    
    if (checkError) {
      console.error("Error al verificar pozos asignados:", checkError);
    } else {
      console.log(`El usuario tiene ${userWells?.length || 0} pozos asignados:`, userWells);
    }
  } catch (err) {
    console.error("Error inicializando datos de prueba:", err);
  }
}

if (require.main === module) {
  initializeTestData();
}
export { initializeTestData };
