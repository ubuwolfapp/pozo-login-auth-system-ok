
import { supabase } from "@/integrations/supabase/client";

async function initializeTestData() {
  try {
    // 1. Eliminar datos existentes (cuidado en entornos de producción)
    await supabase.from("fotos_pozos").delete().neq("id", 0);
    await supabase.from("presion_historial").delete().neq("id", 0);
    await supabase.from("alertas").delete().neq("id", 0);
    await supabase.from("tareas").delete().neq("id", 0);
    await supabase.from("camaras_pozos").delete().neq("id", 0);
    await supabase.from("pozos_mapas_relacion").delete().neq("id", 0);
    await supabase.from("pozos").delete().neq("id", 0);
    await supabase.from("pozos_mapa").delete().neq("id", 0);

    // 2. Crear mapa por defecto
    let mapId: string;
    {
      const { data: mapa, error: mapaError } = await supabase
        .from("pozos_mapa")
        .insert({
          nombre: "Mapa de prueba",
          centro_latitud: 19.4326,
          centro_longitud: -99.1332,
          zoom_inicial: 5,
        })
        .select("id")
        .single();
      if (mapaError) throw mapaError;
      mapId = mapa.id;
    }

    // 3. Crear usuarios de prueba
    const exampleUsers = [
      { email: "prueba@gmail.com", password: "contraseña123", nombre: "Usuario Prueba", rol: "ingeniero" },
      { email: "demo2@pozos.com", password: "test456", nombre: "Jane Demo", rol: "supervisor" },
    ];

    let userList: { id: any; email: string }[] = [];
    for (const u of exampleUsers) {
      // Busca si el usuario existe
      const { data: userExists } = await supabase
        .from("usuarios")
        .select("id")
        .eq("email", u.email)
        .maybeSingle();

      if (!userExists) {
        const { data: newUser, error: userError } = await supabase
          .from("usuarios")
          .insert({
            email: u.email,
            password: u.password,
            nombre: u.nombre,
            rol: u.rol,
          })
          .select("id,email")
          .single();
        if (userError) throw userError;
        userList.push({ id: newUser.id, email: newUser.email });
      } else {
        userList.push({ id: userExists.id, email: u.email });
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

    // Insertar y recuperar IDs
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

    // 5. Relacionar pozos con mapa y usuarios (RPC)
    for (const well of wellList) {
      // Relación con mapa
      const { error: relError } = await supabase.rpc(
        "assign_well_to_map",
        { p_pozo_id: well.id, p_pozos_mapa_id: mapId }
      );
      if (relError) {
        console.error(`Error relacionando pozo ${well.nombre} con mapa:`, relError);
      }

      // Asignación a usuarios demo
      for (const u of userList) {
        // Asignar solo los dos primeros pozos al primer usuario
        if (
          (u.email === "prueba@gmail.com" &&
            (well.nombre === "Pozo Alpha" || well.nombre === "Pozo Gamma")) ||
          (u.email === "demo2@pozos.com" && well.nombre === "Pozo Beta")
        ) {
          const { error: assignError } = await supabase.rpc(
            "assign_well_to_user",
            { p_usuario_id: u.id, p_pozo_id: well.id }
          );
          if (assignError) {
            console.error(`Error asignando pozo a usuario demo:`, assignError);
          }
        }
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
