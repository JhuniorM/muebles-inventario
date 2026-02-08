'use client'

import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/Card'
import { Plus, Search, Filter, Trash2, Package, Truck, Loader2, Pencil } from 'lucide-react'
import CompraForm from '@/components/compras/CompraForm'
import { supabase } from '@/lib/supabase/client'
import { transactionService } from '@/lib/services/transactionService'
import { useAuth } from '@/hooks/useAuth'

export default function ComprasPage() {
    const { profile } = useAuth()
    const [showForm, setShowForm] = useState(false)
    const [compras, setCompras] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [deletingId, setDeletingId] = useState<string | null>(null)
    const [editingTransaction, setEditingTransaction] = useState<any>(null)
    const [searchTerm, setSearchTerm] = useState('')

    useEffect(() => {
        fetchCompras()
    }, [])

    const fetchCompras = async () => {
        setLoading(true)
        const { data } = await supabase
            .from('transacciones')
            .select(`
                *,
                productos (nombre),
                proveedores (nombre)
            `)
            .eq('tipo', 'compra')
            .order('fecha', { ascending: false })

        setCompras(data || [])
        setLoading(false)
    }

    const filteredCompras = compras.filter(c => {
        const search = searchTerm.toLowerCase()
        const proveedorNom = c.proveedores?.nombre?.toLowerCase() || ''
        const productoNom = c.productos?.nombre?.toLowerCase() || ''
        return proveedorNom.includes(search) || productoNom.includes(search)
    })

    const handleDelete = async (id: string) => {
        if (!confirm('¿Estás seguro de eliminar esta compra? El stock se restará automáticamente del inventario.')) return

        setDeletingId(id)
        try {
            await transactionService.deleteTransaction(id)
            setCompras(compras.filter(c => c.id !== id))
            alert('Compra eliminada y stock ajustado correctamente.')
        } catch (error) {
            console.error(error)
            alert('Error al intentar eliminar la compra.')
        } finally {
            setDeletingId(null)
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">Compras</h2>
                    <p className="text-gray-500">Gestión de abastecimiento de materiales y productos</p>
                </div>
                <button
                    onClick={() => setShowForm(true)}
                    className="bg-indigo-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-indigo-700 transition-all font-bold text-sm shadow-lg shadow-indigo-200"
                >
                    <Plus className="h-4 w-4" />
                    Registrar Compra
                </button>
            </div>

            {(showForm || editingTransaction) && (
                <Card title={editingTransaction ? "Editar Compra" : "Nueva Compra"}>
                    <CompraForm
                        initialData={editingTransaction}
                        onSuccess={() => {
                            setShowForm(false)
                            setEditingTransaction(null)
                            fetchCompras()
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
                            placeholder="Buscar por proveedor o material..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10 pr-4 py-2 w-full border border-gray-200 bg-gray-50 rounded-xl focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all text-sm"
                        />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="text-[10px] font-black text-gray-400 uppercase tracking-widest bg-gray-50/50 border-y border-gray-200">
                            <tr>
                                <th className="px-6 py-4">Fecha</th>
                                <th className="px-6 py-4">Proveedor / Material</th>
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
                            ) : compras.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center text-gray-400 italic">No hay compras registradas</td>
                                </tr>
                            ) : (
                                filteredCompras.map((c) => (
                                    <tr key={c.id} className="hover:bg-gray-50/50 transition-colors group">
                                        <td className="px-6 py-4 whitespace-nowrap text-xs font-medium text-gray-500">
                                            {new Date(c.fecha).toLocaleDateString('es-PE', {
                                                timeZone: 'UTC',
                                                day: '2-digit',
                                                month: '2-digit',
                                                year: 'numeric'
                                            })}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col">
                                                <span className="font-bold text-gray-900">{c.proveedores?.nombre}</span>
                                                <span className="text-[11px] text-gray-500 flex items-center gap-1">
                                                    <Truck className="h-3 w-3" />
                                                    {c.productos?.nombre}
                                                </span>
                                                {c.notas && (
                                                    <span className="text-[10px] text-gray-400 italic mt-1 bg-gray-50 px-2 py-0.5 rounded border border-gray-100 w-fit">
                                                        "{c.notas}"
                                                    </span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-center font-bold text-gray-700">{c.cantidad}</td>
                                        <td className="px-6 py-4 text-right font-black text-indigo-600">S/. {Number(c.total).toLocaleString()}</td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex justify-end gap-2">
                                                <button
                                                    onClick={() => setEditingTransaction(c)}
                                                    className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"
                                                    title="Editar compra"
                                                >
                                                    <Pencil className="h-4 w-4" />
                                                </button>

                                                {profile?.rol === 'admin' && (
                                                    <button
                                                        onClick={() => handleDelete(c.id)}
                                                        disabled={deletingId === c.id}
                                                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                                                        title="Eliminar compra y restar de stock"
                                                    >
                                                        {deletingId === c.id ? (
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
