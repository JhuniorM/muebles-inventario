'use client'

import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/Card'
import { Plus, Search, Trash2, Package, Loader2, Pencil } from 'lucide-react'
import VentaForm from '@/components/ventas/VentaForm'
import { supabase } from '@/lib/supabase/client'
import { transactionService } from '@/lib/services/transactionService'
import { useAuth } from '@/hooks/useAuth'

export default function VentasPage() {
    const { profile } = useAuth()
    const [showForm, setShowForm] = useState(false)
    const [ventas, setVentas] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [deletingId, setDeletingId] = useState<string | null>(null)
    const [editingTransaction, setEditingTransaction] = useState<any>(null)
    const [searchTerm, setSearchTerm] = useState('')

    useEffect(() => {
        fetchVentas()
    }, [])

    const fetchVentas = async () => {
        setLoading(true)
        const { data } = await supabase
            .from('transacciones')
            .select(`
                *,
                productos (nombre),
                clientes (nombre)
            `)
            .eq('tipo', 'venta')
            .order('fecha', { ascending: false })

        setVentas(data || [])
        setLoading(false)
    }

    const handleDelete = async (id: string) => {
        if (!confirm('¿Estás seguro de eliminar esta venta? El stock del producto se devolverá automáticamente.')) return

        setDeletingId(id)
        try {
            await transactionService.deleteTransaction(id)
            setVentas(ventas.filter(v => v.id !== id)) // Update local list
            alert('Venta eliminada y stock revertido correctamente.')
        } catch (error) {
            console.error(error)
            alert('Error al intentar eliminar la venta.')
        } finally {
            setDeletingId(null)
        }
    }

    const filteredVentas = ventas.filter(v => {
        const search = searchTerm.toLowerCase()
        const clienteNom = v.clientes?.nombre?.toLowerCase() || ''
        const productoNom = v.productos?.nombre?.toLowerCase() || ''
        return clienteNom.includes(search) || productoNom.includes(search)
    })

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">Ventas</h2>
                    <p className="text-gray-500">Gestión y registro de ventas de muebles</p>
                </div>
                <button
                    onClick={() => setShowForm(true)}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700 transition-all font-bold text-sm shadow-lg shadow-blue-200"
                >
                    <Plus className="h-4 w-4" />
                    Registrar Venta
                </button>
            </div>

            {(showForm || editingTransaction) && (
                <Card title={editingTransaction ? "Editar Venta" : "Nueva Venta"}>
                    <VentaForm
                        initialData={editingTransaction}
                        onSuccess={() => {
                            setShowForm(false)
                            setEditingTransaction(null)
                            fetchVentas()
                        }}
                        onCancel={() => {
                            setShowForm(false)
                            setEditingTransaction(null)
                        }}
                    />
                </Card>
            )}

            <Card>
                <div className="flex items-center gap-4 mb-6">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Buscar por cliente o producto..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10 pr-4 py-2 w-full border border-gray-200 bg-gray-50 rounded-xl focus:ring-2 focus:ring-blue-500/20 outline-none transition-all text-sm"
                        />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="text-[10px] font-black text-gray-400 uppercase tracking-widest bg-gray-50/50 border-y border-gray-100">
                            <tr>
                                <th className="px-6 py-4">Fecha</th>
                                <th className="px-6 py-4">Cliente / Producto</th>
                                <th className="px-6 py-4 text-center">Cant.</th>
                                <th className="px-6 py-4 text-right">Total</th>
                                <th className="px-6 py-4 text-right">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {loading ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center text-gray-400 italic">Cargando historial...</td>
                                </tr>
                            ) : ventas.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center text-gray-400 italic">No hay ventas registradas</td>
                                </tr>
                            ) : (
                                filteredVentas.map((v) => (
                                    <tr key={v.id} className="hover:bg-gray-50/50 transition-colors group">
                                        <td className="px-6 py-4 whitespace-nowrap text-xs font-medium text-gray-500">
                                            {new Date(v.fecha).toLocaleDateString('es-PE', {
                                                timeZone: 'UTC',
                                                day: '2-digit',
                                                month: '2-digit',
                                                year: 'numeric'
                                            })}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col">
                                                <span className="font-bold text-gray-900">{v.clientes?.nombre}</span>
                                                <span className="text-[11px] text-gray-500 flex items-center gap-1">
                                                    <Package className="h-3 w-3" />
                                                    {v.productos?.nombre}
                                                </span>
                                                {v.notas && (
                                                    <span className="text-[10px] text-gray-400 italic mt-1 bg-gray-50 px-2 py-0.5 rounded border border-gray-100 w-fit">
                                                        "{v.notas}"
                                                    </span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-center font-bold text-gray-700">{v.cantidad}</td>
                                        <td className="px-6 py-4 text-right font-black text-green-600">S/. {Number(v.total).toLocaleString()}</td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex justify-end gap-2">
                                                <button
                                                    onClick={() => setEditingTransaction(v)}
                                                    className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                                                    title="Editar venta"
                                                >
                                                    <Pencil className="h-4 w-4" />
                                                </button>

                                                {profile?.rol === 'admin' && (
                                                    <button
                                                        onClick={() => handleDelete(v.id)}
                                                        disabled={deletingId === v.id}
                                                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                                                        title="Eliminar venta y devolver a stock"
                                                    >
                                                        {deletingId === v.id ? (
                                                            <Loader2 className="h-4 w-4 animate-spin" />
                                                        ) : (
                                                            <Trash2 className="h-4 w-4" />
                                                        )}
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </Card>
        </div>
    )
}
