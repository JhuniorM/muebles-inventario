// Inicialización del cliente de Supabase para su uso en el navegador
import { createBrowserClient } from '@supabase/ssr'

// Se crea una única instancia del cliente utilizando las variables de entorno
// Estas variables se encuentran en el archivo .env.local
export const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)
