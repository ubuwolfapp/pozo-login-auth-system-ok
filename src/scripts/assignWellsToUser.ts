
import { supabase } from "@/integrations/supabase/client";

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

    // Asignar todos los pozos al usuario
    for (const well of availableWells) {
      console.log(`Asignando pozo ${well.id} (${well.nombre || 'Sin nombre'}) al usuario...`);
      
      const { error: assignError } = await supabase.rpc(
        'assign_well_to_user',
        { p_usuario_id: userId, p_pozo_id: well.id }
      );
      
      if (assignError) {
        console.error(`Error asignando el pozo ${well.id} al usuario:`, assignError);
      } else {
        console.log(`Pozo ${well.id} asignado al usuario ${userEmail} correctamente.`);
      }
    }
    
    // Verificar asignaciones
    console.log("Verificando asignaciones de pozos...");
    const { data: userWells, error: checkError } = await supabase.rpc(
      "get_user_wells",
      { p_usuario_id: userId }
    );
    
    if (checkError) {
      console.error("Error al verificar pozos asignados:", checkError);
    } else {
      console.log(`El usuario tiene ${userWells?.length || 0} pozos asignados:`, userWells);
    }
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
