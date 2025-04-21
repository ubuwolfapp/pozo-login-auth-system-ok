
import { supabase } from "@/integrations/supabase/client";

async function ensureTestUser() {
  try {
    console.log("Ensuring test user exists...");
    
    const testEmail = 'prueba@gmail.com';
    const testPassword = 'contraseña123';
    
    // First, check if the user exists in Auth
    const { data: authUser, error: authError } = await supabase.auth.signInWithPassword({
      email: testEmail,
      password: testPassword
    });
    
    // If the user doesn't exist in Auth, create it
    if (authError && authError.message.includes('Invalid login credentials')) {
      console.log("Creating user in Auth...");
      const { data: newAuthUser, error: signUpError } = await supabase.auth.signUp({
        email: testEmail,
        password: testPassword,
        options: {
          data: {
            nombre: 'Usuario Prueba',
            rol: 'ingeniero',
          }
        }
      });
      
      if (signUpError) {
        console.error("Error creating user in Auth:", signUpError);
      } else {
        console.log("User created in Auth:", newAuthUser?.user?.email);
      }
    } else if (authError) {
      console.error("Error checking Auth user:", authError);
    } else {
      console.log("User found in Auth:", authUser?.user?.email);
    }
    
    // Check if user exists in custom table
    const { data: existingUser, error: checkError } = await supabase
      .from('usuarios')
      .select('*')
      .eq('email', testEmail)
      .maybeSingle();
    
    if (checkError) {
      console.error("Error checking user in custom table:", checkError);
      return;
    }
    
    // If user doesn't exist in custom table, create it
    if (!existingUser) {
      console.log("Creating user in custom table...");
      const { data: newUser, error: insertError } = await supabase
        .from('usuarios')
        .insert({
          email: testEmail,
          nombre: 'Usuario Prueba',
          rol: 'ingeniero',
          password: testPassword
        })
        .select()
        .single();
      
      if (insertError) {
        console.error("Error creating user in custom table:", insertError);
      } else {
        console.log("User created in custom table:", newUser);
      }
    } else {
      console.log("User found in custom table:", existingUser);
    }
    
    console.log("Test user setup complete");
    
  } catch (error) {
    console.error("Unexpected error ensuring test user:", error);
  }
}

// Execute the function if this script is run directly
if (require.main === module) {
  ensureTestUser();
}

export { ensureTestUser };
