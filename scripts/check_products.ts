import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
import * as path from 'path'

dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

const supabase = createClient(supabaseUrl, supabaseKey)

async function checkProducts() {
    const { data: productos, error } = await supabase
        .from('productos')
        .select('*')

    if (error) {
        console.error('Error fetching products:', error)
        return
    }

    console.log('--- PRODUCTOS ENCONTRADOS ---')
    productos.forEach(p => {
        console.log(`[${p.tipo}] ID: ${p.id} | Nombre: ${p.nombre} | Stock: ${p.stock}`)
    })
}

checkProducts()
