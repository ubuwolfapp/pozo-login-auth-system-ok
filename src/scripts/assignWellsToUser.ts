
import { supabase } from "@/integrations/supabase/client";

async function assignWellsToUser() {
  try {
    const userEmail = 'prueba@gmail.com';

    // Obtener el usuario por email
    const { data: users, error: userError } = await supabase
      .from('usuarios')
      .select('id')
      .eq('email', userEmail)
      .limit(1);
    if (userError) throw userError;
    if (!users || users.length === 0) {
      console.error(`Usuario con email ${userEmail} no encontrado.`);
      return;
    }

    const userId = users[0].id;
    const wellsToAssign = [
      '00000000-0000-0000-0000-000000000001', // Suponiendo que este es el ID del Pozo #1
      '00000000-0000-0000-0000-000000000003'  // Suponiendo que este es el ID del Pozo #3
    ];

    for (const wellId of wellsToAssign) {
      const { error: assignError } = await supabase.rpc(
        'assign_well_to_user' as any,
        { p_usuario_id: userId, p_pozo_id: wellId }
      );
      if (assignError) {
        console.error(`Error asignando el pozo ${wellId} al usuario:`, assignError);
      } else {
        console.log(`Pozo ${wellId} asignado al usuario ${userEmail} correctamente.`);
      }
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
