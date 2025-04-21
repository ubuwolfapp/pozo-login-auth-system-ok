
import { supabase } from "@/integrations/supabase/client";

/**
 * Sync all auth users to the custom usuarios table
 */
async function syncAuthUsers() {
  try {
    console.log("Iniciando sincronización de usuarios...");
    
    // Get all users from Auth
    const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers();
    
    if (authError) {
      console.error("Error obteniendo usuarios de Auth:", authError);
      return;
    }
    
    console.log(`Encontrados ${authUsers?.users?.length || 0} usuarios en Auth`);
    
    // For each auth user, ensure they exist in the custom table
    for (const authUser of (authUsers?.users || [])) {
      console.log(`Sincronizando usuario: ${authUser.email}`);
      
      // Check if user exists in custom table
      const { data: existingUser, error: checkError } = await supabase
        .from('usuarios')
        .select('id, email')
        .eq('email', authUser.email)
        .maybeSingle();
        
      if (checkError) {
        console.error(`Error verificando usuario ${authUser.email}:`, checkError);
        continue;
      }
      
      if (existingUser) {
        console.log(`Usuario ${authUser.email} ya existe en la tabla personalizada`);
      } else {
        // Create user in custom table
        const nombre = authUser.user_metadata?.nombre || authUser.email.split('@')[0];
        const rol = authUser.user_metadata?.rol || 'usuario';
        
        const { data: newUser, error: insertError } = await supabase
          .from('usuarios')
          .insert({
            email: authUser.email,
            nombre: nombre,
            rol: rol,
            password: 'created-via-sync' // Placeholder
          })
          .select('id, email')
          .single();
          
        if (insertError) {
          console.error(`Error creando usuario ${authUser.email}:`, insertError);
        } else {
          console.log(`Usuario ${authUser.email} creado en tabla personalizada con ID: ${newUser.id}`);
        }
      }
    }
    
    console.log("Sincronización completada");
  } catch (e) {
    console.error("Error general en sincronización:", e);
  }
}

// Run the function if executed directly
if (require.main === module) {
  syncAuthUsers();
}

export { syncAuthUsers };
