
import { supabase } from "@/integrations/supabase/client";

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

async function assignWellsToUser() {
  try {
    console.log("Iniciando proceso de asignación de pozos...");
    
    const userEmail = 'prueba@gmail.com';
    console.log(`Buscando usuario con email: ${userEmail}`);

    // Obtener el usuario por email
    const { data: users, error: userError } = await supabase
      .from('usuarios')
      .select('id')
      .eq('email', userEmail)
      .limit(1);
      
    if (userError) {
      console.error("Error al buscar usuario:", userError);
      throw userError;
    }
    
    if (!users || users.length === 0) {
      console.error(`Usuario con email ${userEmail} no encontrado.`);
      return;
    }

    const userId = String(users[0].id); // Convert to string to match the expected type
    console.log(`Usuario encontrado con ID: ${userId}`);
    
    // Buscar todos los pozos disponibles
    const { data: availableWells, error: wellsError } = await supabase
      .from('pozos')
      .select('id,nombre');
      
    if (wellsError) {
      console.error("Error al buscar pozos:", wellsError);
      throw wellsError;
    }
    
    if (!availableWells || availableWells.length === 0) {
      console.error("No hay pozos disponibles para asignar.");
      return;
    }
    
    console.log(`Se encontraron ${availableWells.length} pozos disponibles.`);

    // Asignar todos los pozos al usuario con SQL directo
    for (const well of availableWells) {
      console.log(`Asignando pozo ${well.id} (${well.nombre || 'Sin nombre'}) al usuario...`);
      
      // Use SQL to insert directly since the table is not in the types
      await runSQL(`
        INSERT INTO public.pozos_usuarios (usuario_id, pozo_id)
        VALUES ('${userId}', '${well.id}')
        ON CONFLICT (usuario_id, pozo_id) DO NOTHING
      `);
      
      console.log(`Pozo ${well.id} asignado al usuario ${userEmail} correctamente.`);
    }
    
    // Verificar asignaciones con SQL
    console.log("Verificando asignaciones de pozos...");
    const userWells = await runSQL(`
      SELECT pozo_id FROM public.pozos_usuarios 
      WHERE usuario_id = '${userId}'
    `);
    
    console.log(`El usuario tiene ${userWells?.length || 0} pozos asignados:`, userWells);
  } catch (error) {
    console.error('Error ejecutando la asignación:', error);
  }
}

// Ejecutar la función si se ejecuta directamente
if (require.main === module) {
  assignWellsToUser();
}

// Exportar por si quieres importar para test u otro uso
export { assignWellsToUser };
