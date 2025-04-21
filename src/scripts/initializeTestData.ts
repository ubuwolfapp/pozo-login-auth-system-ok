
import { supabase } from "@/integrations/supabase/client";

async function initializeTestData() {
  try {
    // 1. Eliminar datos existentes (cuidado en entornos de producción)
    await supabase.from("fotos_pozos").delete().neq("id", "0");
    await supabase.from("presion_historial").delete().neq("id", 0);
    await supabase.from("alertas").delete().neq("id", "0");
    await supabase.from("tareas").delete().neq("id", "0");
    await supabase.from("camaras_pozos").delete().neq("id", "0");
    await supabase.from("pozos_mapas_relacion").delete().neq("id", "0");
    await supabase.from("pozos").delete().neq("id", "0");
    await supabase.from("pozos_mapa").delete().neq("id", "0");

    // 2. Crear mapa por defecto para OpenStreetMap (nombre genérico)
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
      if (mapaError) throw mapaError;
      mapId = mapa.id;
    }

    // 3. Crear usuario de prueba en la DB pública (no solo en auth)
    let testUserId: string;  // <- Changed from number to string
    {
      const { data: foundUser, error } = await supabase
        .from("usuarios")
        .select("id,email")
        .eq("email", "prueba@gmail.com")
        .maybeSingle();

      if (!foundUser) {
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
        if (userError) throw userError;
        testUserId = String(newUser.id);  // <- Convert to string
      } else {
        testUserId = String(foundUser.id);  // <- Convert to string
      }
    }

    // 4. Crear pozos de ejemplo
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
      if (wellError) throw wellError;
      wellList.push({ id: well.id, nombre: well.nombre });
    }

    // 5. Relacionar pozos con el mapa creado (tabla de relación)
    for (const well of wellList) {
      await supabase.from("pozos_mapas_relacion").insert({
        pozo_id: well.id,
        pozos_mapa_id: mapId,
      });
    }

    // 6. Asignar dos pozos al usuario de prueba (usuarios-pozos)
    // Suponiendo existe una tabla de relación (por la función assign_well_to_user de Supabase)
    // Asignar Alpha y Gamma al usuario de prueba
    for (const well of wellList) {
      if (
        well.nombre === "Pozo Alpha" ||
        well.nombre === "Pozo Gamma"
      ) {
        // Llama función RPC assign_well_to_user
        await supabase.rpc("assign_well_to_user", {
          p_usuario_id: testUserId,  // Now testUserId is a string
          p_pozo_id: well.id,
        });
      }
    }

    console.log("Datos de prueba inicializados correctamente.");
  } catch (err) {
    console.error("Error inicializando datos de prueba:", err);
  }
}

if (require.main === module) {
  initializeTestData();
}
export { initializeTestData };
