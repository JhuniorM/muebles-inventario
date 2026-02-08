'use client'

import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/Card'
import { Search, Filter, Package, AlertTriangle, Layers, Square, Hammer, Box, Hash, Plus } from 'lucide-react'
import { supabase } from '@/lib/supabase/client'
import { Producto } from '@/types/database'

const CATEGORIES = [
    { id: 'tela', name: 'Tela', icon: Layers, color: 'text-pink-600', bg: 'bg-pink-50' },
    { id: 'espuma', name: 'Espuma', icon: Square, color: 'text-orange-600', bg: 'bg-orange-50' },
    { id: 'suministro', name: 'Clavo', icon: Hammer, color: 'text-gray-600', bg: 'bg-gray-100' },
    { id: 'plicas', name: 'Plicas', icon: Hash, color: 'text-blue-600', bg: 'bg-blue-50' },
    { id: 'casco', name: 'Casco', icon: Box, color: 'text-amber-700', bg: 'bg-amber-50' },
    { id: 'madera', name: 'Madera', icon: Hammer, color: 'text-orange-900', bg: 'bg-orange-100' },
    { id: 'accesorio', name: 'Accesorios', icon: Plus, color: 'text-purple-600', bg: 'bg-purple-50' },
    { id: 'mueble', name: 'Mueble', icon: Box, color: 'text-indigo-600', bg: 'bg-indigo-50' },
]

export default function InventarioPage() {
    const [productos, setProductos] = useState<Producto[]>([]) // Lista completa de productos
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState('') // Término de búsqueda para el filtro

    useEffect(() => {
        fetchProductos()
    }, [])

    // Obtener todos los productos ordenados alfabéticamente
    const fetchProductos = async () => {
        setLoading(true)
        const { data } = await supabase
            .from('productos')
            .select('*')
            .order('nombre')

        setProductos(data || [])
        setLoading(false)
    }

    // Lógica de filtrado dinámico por nombre o tipo de producto
    const filteredProductos = productos.filter(p =>
        p.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.tipo.toLowerCase().includes(searchTerm.toLowerCase())
    )

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">Inventario</h2>
                    <p className="text-gray-500">Control de stock de materiales y productos terminados</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="bg-blue-600 text-white border-none">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-white/20 rounded-xl">
                            <Package className="h-6 w-6 text-white" />
                        </div>
                        <div>
                            <p className="text-blue-100 text-sm font-medium">Total Productos</p>
                            <h3 className="text-2xl font-bold">{productos.length}</h3>
                        </div>
                    </div>
                </Card>

                <Card className="bg-orange-500 text-white border-none">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-white/20 rounded-xl">
                            <AlertTriangle className="h-6 w-6 text-white" />
                        </div>
                        <div>
                            <p className="text-orange-100 text-sm font-medium">Stock Bajo</p>
                            <h3 className="text-2xl font-bold">{productos.filter(p => p.stock < 5).length}</h3>
                        </div>
                    </div>
                </Card>

                <Card className="bg-emerald-600 text-white border-none">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-white/20 rounded-xl">
                            <Layers className="h-6 w-6 text-white" />
                        </div>
                        <div>
                            <p className="text-emerald-100 text-sm font-medium">Categorías</p>
                            <h3 className="text-2xl font-bold">{new Set(productos.map(p => p.tipo)).size}</h3>
                        </div>
                    </div>
                </Card>
            </div>

            <Card>
                <div className="flex items-center gap-4 mb-6">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Buscar en el inventario..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                        />
                    </div>
                    <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-gray-700 transition-colors">
                        <Filter className="h-4 w-4" />
                        Filtrar
                    </button>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="text-xs text-gray-700 uppercase bg-gray-50 border-y border-gray-200">
                            <tr>
                                <th className="px-6 py-4">Producto</th>
                                <th className="px-6 py-4">Categoría</th>
                                <th className="px-6 py-4 text-center">Stock Actual</th>
                                <th className="px-6 py-4 text-right">Precio Ref.</th>
                                <th className="px-6 py-4 text-center">Estado</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {loading ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                                        <div className="flex flex-col items-center gap-2">
                                            <div className="h-5 w-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                                            Cargando inventario...
                                        </div>
                                    </td>
                                </tr>
                            ) : filteredProductos.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center text-gray-500 italic">
                                        No se encontraron productos en el inventario.
                                    </td>
                                </tr>
                            ) : (
                                filteredProductos.map((p) => {
                                    const cat = CATEGORIES.find(c => c.id === p.tipo)
                                    const Icon = cat?.icon || Package

                                    return (
                                        <tr key={p.id} className="hover:bg-gray-50/50 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className={`p-2 rounded-lg ${cat?.bg || 'bg-gray-100'}`}>
                                                        <Icon className={`h-4 w-4 ${cat?.color || 'text-gray-500'}`} />
                                                    </div>
                                                    <span className="font-bold text-gray-900">{p.nombre}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="capitalize text-gray-600 font-medium">{p.tipo}</span>
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <span className={`font-black text-lg ${p.stock < 5 ? 'text-red-600' : 'text-gray-900'}`}>
                                                    {p.stock}
                                                </span>
                                                <span className="ml-1 text-[10px] text-gray-400 font-bold uppercase">
                                                    {p.tipo === 'tela' ? 'Mts' : 'Und'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-right font-mono font-bold text-blue-600">
                                                S/. {Number(p.precio_unitario).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                {p.stock < 5 ? (
                                                    <span className="px-2 py-1 rounded-full bg-red-100 text-red-700 text-[10px] font-black uppercase">
                                                        Stock Bajo
                                                    </span>
                                                ) : (
                                                    <span className="px-2 py-1 rounded-full bg-green-100 text-green-700 text-[10px] font-black uppercase">
                                                        Disponible
                                                    </span>
                                                )}
                                            </td>
                                        </tr>
                                    )
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </Card>
        </div>
    )
}
