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

        // 2. Obtener el producto para saber su nombre y tipo
        const { data: originalProd, error: prodError } = await supabase
            .from('productos')
            .select('nombre, tipo, stock')
            .eq('id', transaction.producto_id)
            .single()

        if (prodError || !originalProd) {
            throw new Error('No se pudo encontrar el producto asociado')
        }

        // 3. Determinar qué producto actualizar (Mueble -> busca Casco)
        let targetProdId = transaction.producto_id
        let stockActual = originalProd.stock

        if (originalProd.tipo === 'mueble') {
            const { data: casco } = await supabase
                .from('productos')
                .select('id, stock')
                .eq('tipo', 'casco')
                .ilike('nombre', originalProd.nombre)
                .single()

            if (casco) {
                targetProdId = casco.id
                stockActual = casco.stock
            }
        }

        // 4. Calcular el nuevo stock (Reversión)
        let nuevoStock = stockActual
        if (transaction.tipo === 'venta') {
            nuevoStock += transaction.cantidad
        } else if (transaction.tipo === 'compra') {
            nuevoStock -= transaction.cantidad
        }

        // 5. Ejecutar actualizaciones
        const { error: updateError } = await supabase
            .from('productos')
            .update({ stock: nuevoStock })
            .eq('id', targetProdId)

        if (updateError) throw new Error('Error al revertir el stock')

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

        // 2. REVERSIÓN: Devolver el stock a su estado previo
        const { data: oldProd } = await supabase.from('productos').select('nombre, tipo, stock').eq('id', oldTx.producto_id).single()
        if (oldProd) {
            let targetRevertId = oldTx.producto_id
            let currentStock = oldProd.stock

            if (oldProd.tipo === 'mueble') {
                const { data: casco } = await supabase.from('productos').select('id, stock').eq('tipo', 'casco').ilike('nombre', oldProd.nombre).single()
                if (casco) {
                    targetRevertId = casco.id
                    currentStock = casco.stock
                }
            }

            const revertedStock = oldTx.tipo === 'venta'
                ? currentStock + oldTx.cantidad
                : currentStock - oldTx.cantidad
            await supabase.from('productos').update({ stock: revertedStock }).eq('id', targetRevertId)
        }

        // 3. APLICACIÓN: Aplicar el nuevo cambio de stock
        let targetProdId = newData.producto_id || oldTx.producto_id
        const { data: newProd } = await supabase.from('productos').select('nombre, tipo, stock').eq('id', targetProdId).single()

        if (newProd) {
            let targetApplyId = targetProdId
            let currentStock = newProd.stock

            if (newProd.tipo === 'mueble') {
                const { data: casco } = await supabase.from('productos').select('id, stock').eq('tipo', 'casco').ilike('nombre', newProd.nombre).single()
                if (casco) {
                    targetApplyId = casco.id
                    currentStock = casco.stock
                }
            }

            const newStock = newData.tipo === 'venta'
                ? currentStock - newData.cantidad
                : currentStock + newData.cantidad
            await supabase.from('productos').update({ stock: newStock }).eq('id', targetApplyId)
        }

        // 4. Actualizar el registro
        const { error: updateErr } = await supabase
            .from('transacciones')
            .update(newData)
            .eq('id', id)

        if (updateErr) throw updateErr

        return { success: true }
    }
}
