'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase/client'
import { Card, StatCard } from '@/components/ui/Card'
import { TrendingUp, ShoppingCart, DollarSign, Package, Loader2 } from 'lucide-react'
import { ReporteMensual, Transaccion, Producto } from '@/types/database'

export default function DashboardPage() {
    const [stats, setStats] = useState<any[]>([]) // Tarjetas de métricas superiores
    const [lastTransactions, setLastTransactions] = useState<any[]>([]) // Lista de últimas 5 acciones
    const [criticalStock, setCriticalStock] = useState<Producto[]>([]) // Productos con stock < 5
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetchDashboardData()
    }, [])

    // Función principal para recolectar datos desde Supabase
    const fetchDashboardData = async () => {
        setLoading(true)
        try {
            const now = new Date()
            const currentMonth = now.getMonth() + 1
            const currentYear = now.getFullYear()

            // 1. Obtener estadísticas del mes actual (Resumen mensual)
            const { data: reportData } = await supabase
                .from('reportes_mensuales')
                .select('*')
                .eq('mes', currentMonth)
                .eq('año', currentYear)
                .single()

            const currentStats = reportData as ReporteMensual

            // Construir el array de tarjetas para el grid superior
            setStats([
                {
                    title: 'Ventas Totales',
                    value: `S/. ${Number(currentStats?.total_ventas || 0).toLocaleString()}`,
                    change: 'N/A',
                    trend: 'up' as const,
                    icon: TrendingUp,
                    color: 'bg-green-500'
                },
                {
                    title: 'Compras Totales',
                    value: `S/. ${Number(currentStats?.total_compras || 0).toLocaleString()}`,
                    change: 'N/A',
                    trend: 'down' as const,
                    icon: ShoppingCart,
                    color: 'bg-red-500'
                },
                {
                    title: 'Ganancia Neta',
                    value: `S/. ${Number(currentStats?.ganancia_neta || 0).toLocaleString()}`,
                    change: 'N/A',
                    trend: 'up' as const,
                    icon: DollarSign,
                    color: 'bg-blue-500'
                },
                {
                    title: 'Muebles Vendidos',
                    value: currentStats?.muebles_vendidos || 0,
                    change: 'N/A',
                    trend: 'up' as const,
                    icon: Package,
                    color: 'bg-indigo-500'
                }
            ])

            // 2. Obtener las últimas 5 transacciones realizadas
            const { data: txData } = await supabase
                .from('transacciones')
                .select(`
          id,
          tipo,
          total,
          fecha,
          productos (nombre)
        `)
                .order('created_at', { ascending: false })
                .limit(5)

            setLastTransactions(txData || [])

            // 3. Identificar productos con Stock Crítico (menos de 5 unidades)
            const { data: prodData } = await supabase
                .from('productos')
                .select('*')
                .lt('stock', 5)
                .order('stock', { ascending: true })
                .limit(4)

            setCriticalStock(prodData || [])

        } catch (error) {
            console.error('Error fetching dashboard data:', error)
        } finally {
            setLoading(false)
        }
    }

    if (loading) {
        return (
            <div className="flex h-[80vh] items-center justify-center">
                <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-bold text-gray-900">Dashboard</h2>
                <p className="text-gray-500">Resumen general del inventario y finanzas (Datos Reales)</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {stats.map((stat, idx) => (
                    <StatCard key={idx} {...stat} />
                ))}
            </div>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                <Card title="Comparativa Mensual">
                    <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">
                        <div className="text-center">
                            <p className="text-gray-400 font-medium italic">Gráfico de barras (Ventas vs Compras)</p>
                            <p className="text-xs text-gray-400 mt-1">Sincronizado con Supabase</p>
                        </div>
                    </div>
                </Card>

                <Card title="Últimas Transacciones">
                    <div className="space-y-4">
                        {lastTransactions.length === 0 ? (
                            <p className="text-center text-gray-500 py-4">No hay transacciones recientes</p>
                        ) : (
                            lastTransactions.map((tx) => (
                                <div key={tx.id} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors border border-transparent hover:border-gray-100">
                                    <div className="flex items-center gap-3">
                                        <div className={`h-10 w-10 rounded-full flex items-center justify-center ${tx.tipo === 'venta' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                                            {tx.tipo === 'venta' ? 'V' : 'C'}
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-gray-900">{tx.productos?.nombre || 'Producto'}</p>
                                            <p className="text-xs text-gray-500 capitalize">{tx.tipo} • {new Date(tx.fecha).toLocaleDateString()}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm font-bold text-gray-900">S/. {Number(tx.total).toLocaleString()}</p>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </Card>
            </div>

            <Card title="Stock Crítico">
                {criticalStock.length === 0 ? (
                    <p className="text-center text-gray-500 py-4">Todo el inventario está en niveles óptimos</p>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        {criticalStock.map((item) => (
                            <div key={item.id} className="p-4 border border-gray-100 rounded-lg flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-900">{item.nombre}</p>
                                    <p className="text-xs text-gray-500 capitalize">{item.tipo}</p>
                                </div>
                                <div className="text-right">
                                    <p className={`text-xs font-medium ${item.stock === 0 ? 'text-red-600' : 'text-orange-600'}`}>
                                        {item.stock} unidades
                                    </p>
                                    <button className="text-[10px] text-blue-600 hover:underline font-bold mt-1">Reabastecer</button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </Card>
        </div>
    )
}
