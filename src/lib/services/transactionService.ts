import { supabase } from '@/lib/supabase/client'

/**
 * Servicio para gestionar la eliminación de transacciones con reversión de stock
 */
export const transactionService = {
    /**
     * Elimina una transacción y revierte el cambio en el inventario
     * @param transactionId ID de la transacción a eliminar
     */
    async deleteTransaction(transactionId: string) {
        // 1. Obtener los detalles de la transacción antes de borrarla
        const { data: transaction, error: fetchError } = await supabase
            .from('transacciones')
            .select('producto_id, cantidad, tipo')
            .eq('id', transactionId)
            .single()

        if (fetchError || !transaction) {
            throw new Error('No se pudo encontrar la transacción')
        }

        // 2. Obtener el stock actual del producto
        const { data: producto, error: prodError } = await supabase
            .from('productos')
            .select('stock')
            .eq('id', transaction.producto_id)
            .single()

        if (prodError || !producto) {
            throw new Error('No se pudo encontrar el producto asociado')
        }

        // 3. Calcular el nuevo stock (Reversión)
        // Si fue VENTA: sumamos lo que se quitó
        // Si fue COMPRA: restamos lo que se aumentó
        let nuevoStock = producto.stock
        if (transaction.tipo === 'venta') {
            nuevoStock += transaction.cantidad
        } else if (transaction.tipo === 'compra') {
            nuevoStock -= transaction.cantidad
        }

        // 4. Ejecutar actualizaciones en secuencia (Idealmente sería una transacción SQL)
        // Primero actualizamos el stock
        const { error: updateError } = await supabase
            .from('productos')
            .update({ stock: nuevoStock })
            .eq('id', transaction.producto_id)

        if (updateError) throw new Error('Error al revertir el stock')

        // Finalmente borramos la transacción
        const { error: deleteError } = await supabase
            .from('transacciones')
            .delete()
            .eq('id', transactionId)

        if (deleteError) throw new Error('Error al borrar el registro')
        return { success: true }
    },

    /**
     * Actualiza una transacción existente y ajusta el stock de forma inteligente.
     * 1. Revierte el efecto del stock original (Paso 1 y 2).
     * 2. Aplica el nuevo efecto de stock con los datos actualizados (Paso 3).
     * 3. Permite incluso cambiar de producto, manteniendo el inventario íntegro.
     */
    async updateTransaction(id: string, newData: any) {
        // 1. Obtener datos originales de la transacción
        const { data: oldTx, error: fetchErr } = await supabase
            .from('transacciones')
            .select('*')
            .eq('id', id)
            .single()

        if (fetchErr || !oldTx) throw new Error('No se encontró la transacción original')

        // 2. REVERSIÓN: Devolver el stock a su estado previo como si la transacción nunca hubiera ocurrido
        const { data: oldProd } = await supabase.from('productos').select('stock').eq('id', oldTx.producto_id).single()
        if (oldProd) {
            const revertedStock = oldTx.tipo === 'venta'
                ? oldProd.stock + oldTx.cantidad  // Si fue venta, devolvemos lo quitado
                : oldProd.stock - oldTx.cantidad  // Si fue compra, restamos lo aumentado
            await supabase.from('productos').update({ stock: revertedStock }).eq('id', oldTx.producto_id)
        }

        // 3. APLICACIÓN: Calcular el nuevo stock con los datos actualizados
        // Consideramos que el ID del producto puede haber cambiado también
        let targetProdId = newData.producto_id || oldTx.producto_id
        const { data: newProd } = await supabase.from('productos').select('stock').eq('id', targetProdId).single()

        if (newProd) {
            // Calculamos el stock final basado en el tipo de transacción
            const newStock = newData.tipo === 'venta'
                ? newProd.stock - newData.cantidad // Venta: quitamos stock
                : newProd.stock + newData.cantidad // Compra: añadimos stock
            await supabase.from('productos').update({ stock: newStock }).eq('id', targetProdId)
        }

        // 4. Actualizar el registro de la transacción en la base de datos
        const { error: updateErr } = await supabase
            .from('transacciones')
            .update(newData)
            .eq('id', id)

        if (updateErr) throw updateErr

        return { success: true }
    }
}
