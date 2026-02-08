'use client'

import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/Card'
import { BarChart3, Download, Calendar, ChevronDown, FileText, Table as TableIcon } from 'lucide-react'
import { supabase } from '@/lib/supabase/client'
import { exportToPDF, exportToExcel } from '@/lib/utils/exportUtils'
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    Filler
} from 'chart.js'
import { Line } from 'react-chartjs-2'

// Registrar componentes de Chart.js
ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    Filler
)

export default function ReportesPage() {
    const [reportes, setReportes] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [showExportMenu, setShowExportMenu] = useState(false)

    useEffect(() => {
        fetchReportes()
    }, [])

    const fetchReportes = async () => {
        setLoading(true)
        const { data } = await supabase
            .from('reportes_mensuales')
            .select('*')
            .order('año', { ascending: true })
            .order('mes', { ascending: true })

        setReportes(data || [])
        setLoading(false)
    }

    const getMesNombre = (mes: number) => {
        const meses = [
            'Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun',
            'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'
        ]
        return meses[mes - 1]
    }

    // Configuración del gráfico
    const chartData = {
        labels: reportes.map(r => `${getMesNombre(r.mes)} ${r.año}`),
        datasets: [
            {
                label: 'Ventas Totales',
                data: reportes.map(r => r.total_ventas),
                borderColor: 'rgb(34, 197, 94)',
                backgroundColor: 'rgba(34, 197, 94, 0.1)',
                fill: true,
                tension: 0.4,
            },
            {
                label: 'Compras Totales',
                data: reportes.map(r => r.total_compras),
                borderColor: 'rgb(239, 68, 68)',
                backgroundColor: 'rgba(239, 68, 68, 0.1)',
                fill: true,
                tension: 0.4,
            }
        ],
    }

    const chartOptions = {
        responsive: true,
        plugins: {
            legend: {
                position: 'top' as const,
            },
        },
        scales: {
            y: {
                beginAtZero: true,
                ticks: {
                    callback: (value: any) => `S/. ${value.toLocaleString()}`
                }
            }
        }
    }

    // Preparar los datos para las funciones de exportación
    const prepareExportData = () => {
        return [...reportes].reverse().map(r => ({
            mes: getMesNombre(r.mes),
            año: r.año,
            ventas: `S/. ${Number(r.total_ventas).toLocaleString()}`,
            compras: `S/. ${Number(r.total_compras).toLocaleString()}`,
            ganancia: `S/. ${Number(r.ganancia_neta).toLocaleString()}`,
            transacciones: r.transacciones_count
        }))
    }

    const handleExportPDF = () => {
        exportToPDF(prepareExportData())
        setShowExportMenu(false)
    }

    const handleExportExcel = () => {
        exportToExcel(prepareExportData())
        setShowExportMenu(false)
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">Reportes</h2>
                    <p className="text-gray-500">Análisis y estadísticas mensuales del negocio</p>
                </div>

                {/* Menú de Exportación Mejorado */}
                <div className="relative">
                    <button
                        onClick={() => setShowExportMenu(!showExportMenu)}
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700 transition-all shadow-sm shadow-blue-200 font-bold text-sm"
                    >
                        <Download className="h-4 w-4" />
                        Exportar
                        <ChevronDown className={`h-4 w-4 transition-transform ${showExportMenu ? 'rotate-180' : ''}`} />
                    </button>

                    {showExportMenu && (
                        <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-gray-100 py-2 z-50 animate-in fade-in slide-in-from-top-2">
                            <button
                                onClick={handleExportPDF}
                                className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-3 transition-colors"
                            >
                                <div className="p-1.5 bg-red-50 rounded-lg">
                                    <FileText className="h-4 w-4 text-red-600" />
                                </div>
                                <span className="font-medium">Descargar PDF</span>
                            </button>
                            <button
                                onClick={handleExportExcel}
                                className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-3 transition-colors"
                            >
                                <div className="p-1.5 bg-green-50 rounded-lg">
                                    <TableIcon className="h-4 w-4 text-green-600" />
                                </div>
                                <span className="font-medium">Descargar Excel</span>
                            </button>
                        </div>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Card className="lg:col-span-2" title="Progreso de Ventas vs Compras">
                    <div className="h-80 flex items-center justify-center bg-white p-2">
                        {loading ? (
                            <div className="text-gray-400">Cargando gráfico...</div>
                        ) : reportes.length > 0 ? (
                            <Line data={chartData} options={chartOptions} />
                        ) : (
                            <div className="text-center">
                                <BarChart3 className="h-12 w-12 text-gray-300 mx-auto mb-2" />
                                <p className="text-gray-400 font-medium italic">Sin datos suficientes para el gráfico</p>
                            </div>
                        )}
                    </div>
                </Card>

                <Card title="Filtros de Reporte">
                    <div className="space-y-4">
                        <div>
                            <label className="text-sm font-medium text-gray-700 mb-1 block">Año</label>
                            <select className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white">
                                <option>2026</option>
                                <option>2025</option>
                            </select>
                        </div>
                        <button className="w-full bg-blue-600 text-white font-medium py-2 rounded-lg hover:bg-blue-700 transition-colors">
                            Generar Reporte
                        </button>
                    </div>
                </Card>
            </div>

            <Card title="Resumen Mensual">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="text-xs text-gray-700 uppercase bg-gray-50 border-y border-gray-200">
                            <tr>
                                <th className="px-6 py-3">Mes / Año</th>
                                <th className="px-6 py-3 text-right">Ventas</th>
                                <th className="px-6 py-3 text-right">Compras</th>
                                <th className="px-6 py-3 text-right">Ganancia Neta</th>
                                <th className="px-6 py-3 text-center">Transacciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {loading ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-4 text-center text-gray-500">Cargando reportes...</td>
                                </tr>
                            ) : reportes.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-4 text-center text-gray-500">No hay datos históricos aún</td>
                                </tr>
                            ) : (
                                reportes.map((r) => (
                                    <tr key={r.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4 flex items-center gap-2 font-medium text-gray-900">
                                            <Calendar className="h-4 w-4 text-gray-400" />
                                            {getMesNombre(r.mes)} {r.año}
                                        </td>
                                        <td className="px-6 py-4 text-right text-green-600 font-medium">S/. {Number(r.total_ventas).toLocaleString()}</td>
                                        <td className="px-6 py-4 text-right text-red-600">S/. {Number(r.total_compras).toLocaleString()}</td>
                                        <td className="px-6 py-4 text-right font-bold text-blue-600">S/. {Number(r.ganancia_neta).toLocaleString()}</td>
                                        <td className="px-6 py-4 text-center">{r.transacciones_count}</td>
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
