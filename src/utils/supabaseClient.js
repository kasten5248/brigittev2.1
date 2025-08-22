// src/utils/supabaseClient.js
import { createClient } from '@supabase/supabase-js';

// Las claves ahora se leen desde las variables de entorno
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY;
          
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// La función isAdmin se queda igual, pero es bueno tenerla en el mismo archivo
export const isAdmin = async (userId) => {
  if (!userId) {
    console.warn("isAdmin: userId es nulo o indefinido.");
    return false;
  }

  try {
    const { data, error } = await supabase
      .from('users')
      .select('is_admin')
      .eq('id', userId)
      .single();

    if (error) {
      // Este error es común si el usuario no está en la tabla, no es necesariamente un problema.
      // console.error('Error al verificar administrador:', error);
      return false;
    }
    return data?.is_admin === true;
  } catch (e) {
    console.error("Excepción en isAdmin:", e);
    return false;
  }
};
