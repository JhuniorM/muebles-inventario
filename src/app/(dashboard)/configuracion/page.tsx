'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/Card'
import {
    Building2,
    Settings2,
    Bell,
    Save,
    ShieldCheck,
    Smartphone,
    Mail,
    MapPin,
    Hash,
    AlertCircle
} from 'lucide-react'

export default function ConfiguracionPage() {
    // Estados para los datos de la empresa
    const [empresa, setEmpresa] = useState({
        nombre: 'Muebles & Estilos',
        ruc: '20123456789',
        direccion: 'Av. Las Gardenias 123, Lima',
        telefono: '987 654 321',
        email: 'contacto@mueblesestilos.com'
    })

    // Estados para las preferencias del sistema
    const [preferencias, setPreferencias] = useState({
        umbralStockBajo: 5,
        moneda: 'PEN (S/.)',
        notificacionesEmail: true,
        notificacionesStock: true
    })

    const handleSave = () => {
        // En el futuro esto guardará en la base de datos o LocalStorage
        alert('Configuración guardada correctamente (Simulación)')
    }

    return (
        <div className="space-y-6 max-w-5xl mx-auto pb-10">
            <div>
                <h2 className="text-2xl font-bold text-gray-900">Configuración</h2>
                <p className="text-gray-500">Ajusta los detalles de tu negocio y preferencias del sistema</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Columna Izquierda: Listado de Secciones */}
                <div className="md:col-span-1 space-y-2">
                    <button className="w-full flex items-center gap-3 px-4 py-3 bg-blue-50 text-blue-700 rounded-xl font-bold text-sm border border-blue-100 transition-all">
                        <Building2 className="h-5 w-5" />
                        Perfil de Empresa
                    </button>
                    <button className="w-full flex items-center gap-3 px-4 py-3 text-gray-600 hover:bg-gray-50 rounded-xl font-medium text-sm transition-all border border-transparent">
                        <Settings2 className="h-5 w-5" />
                        Preferencias del Sistema
                    </button>
                    <button className="w-full flex items-center gap-3 px-4 py-3 text-gray-600 hover:bg-gray-50 rounded-xl font-medium text-sm transition-all border border-transparent">
                        <Bell className="h-5 w-5" />
                        Notificaciones
                    </button>
                    <button className="w-full flex items-center gap-3 px-4 py-3 text-gray-600 hover:bg-gray-50 rounded-xl font-medium text-sm transition-all border border-transparent">
                        <ShieldCheck className="h-5 w-5" />
                        Seguridad
                    </button>
                </div>

                {/* Columna Derecha: Formularios */}
                <div className="md:col-span-2 space-y-6">
                    {/* Sección 1: Perfil de Empresa */}
                    <Card>
                        <div className="flex items-center gap-3 mb-6 border-b border-gray-100 pb-4">
                            <div className="p-2 bg-blue-50 rounded-lg">
                                <Building2 className="h-5 w-5 text-blue-600" />
                            </div>
                            <h3 className="text-lg font-bold text-gray-900">Datos del Negocio</h3>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-1.5 sm:col-span-2">
                                <label className="text-xs font-black text-gray-500 uppercase tracking-wider flex items-center gap-1">
                                    Nombre de la Empresa
                                </label>
                                <div className="relative">
                                    <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                    <input
                                        type="text"
                                        value={empresa.nombre}
                                        onChange={(e) => setEmpresa({ ...empresa, nombre: e.target.value })}
                                        className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all font-medium"
                                    />
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-xs font-black text-gray-500 uppercase tracking-wider flex items-center gap-1">
                                    <Hash className="h-3 w-3" /> RUC / Identificación
                                </label>
                                <input
                                    type="text"
                                    value={empresa.ruc}
                                    onChange={(e) => setEmpresa({ ...empresa, ruc: e.target.value })}
                                    className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all font-medium"
                                />
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-xs font-black text-gray-500 uppercase tracking-wider flex items-center gap-1">
                                    <Smartphone className="h-3 w-3" /> Teléfono de Contacto
                                </label>
                                <input
                                    type="text"
                                    value={empresa.telefono}
                                    onChange={(e) => setEmpresa({ ...empresa, telefono: e.target.value })}
                                    className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all font-medium"
                                />
                            </div>

                            <div className="space-y-1.5 sm:col-span-2">
                                <label className="text-xs font-black text-gray-500 uppercase tracking-wider flex items-center gap-1">
                                    <MapPin className="h-3 w-3" /> Dirección Fiscal
                                </label>
                                <input
                                    type="text"
                                    value={empresa.direccion}
                                    onChange={(e) => setEmpresa({ ...empresa, direccion: e.target.value })}
                                    className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all font-medium"
                                />
                            </div>
                        </div>
                    </Card>

                    {/* Sección 2: Preferencias de Inventario */}
                    <Card>
                        <div className="flex items-center gap-3 mb-6 border-b border-gray-100 pb-4">
                            <div className="p-2 bg-amber-50 rounded-lg">
                                <Settings2 className="h-5 w-5 text-amber-600" />
                            </div>
                            <h3 className="text-lg font-bold text-gray-900">Ajustes de Inventario</h3>
                        </div>

                        <div className="space-y-6">
                            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100">
                                <div className="space-y-0.5">
                                    <p className="text-sm font-bold text-gray-900">Umbral de Stock Bajo</p>
                                    <p className="text-xs text-gray-500">Mínimo de unidades para alertar reabastecimiento</p>
                                </div>
                                <div className="flex items-center gap-3">
                                    <input
                                        type="number"
                                        value={preferencias.umbralStockBajo}
                                        onChange={(e) => setPreferencias({ ...preferencias, umbralStockBajo: parseInt(e.target.value) })}
                                        className="w-16 px-2 py-1 bg-white border border-gray-300 rounded-lg text-center font-bold text-blue-600 focus:ring-2 focus:ring-blue-500 outline-none"
                                    />
                                    <span className="text-xs font-bold text-gray-400 uppercase">Unds</span>
                                </div>
                            </div>

                            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100">
                                <div className="space-y-0.5">
                                    <p className="text-sm font-bold text-gray-900">Moneda del Sistema</p>
                                    <p className="text-xs text-gray-500">Moneda usada en ventas y compras</p>
                                </div>
                                <select
                                    className="bg-white border border-gray-300 rounded-lg px-3 py-1.5 text-xs font-bold text-gray-700 outline-none focus:ring-2 focus:ring-blue-500"
                                    value={preferencias.moneda}
                                    onChange={(e) => setPreferencias({ ...preferencias, moneda: e.target.value })}
                                >
                                    <option>PEN (S/.)</option>
                                    <option>USD ($)</option>
                                </select>
                            </div>

                            <div className="flex items-center gap-3 p-3 bg-blue-50/50 rounded-lg border border-blue-100/50">
                                <AlertCircle className="h-5 w-5 text-blue-600" />
                                <p className="text-xs text-blue-800 leading-relaxed font-medium">
                                    Estos ajustes afectan a todos los cálculos visuales en el Dashboard y Tablas.
                                </p>
                            </div>
                        </div>
                    </Card>

                    {/* Botón Guardar */}
                    <div className="flex justify-end gap-3 pt-4">
                        <button className="px-6 py-2.5 text-sm font-bold text-gray-600 hover:bg-gray-100 rounded-xl transition-all">
                            Descartar
                        </button>
                        <button
                            onClick={handleSave}
                            className="flex items-center gap-2 px-8 py-2.5 bg-blue-600 text-white rounded-xl font-bold text-sm hover:bg-blue-700 shadow-lg shadow-blue-200 transition-all transform active:scale-95"
                        >
                            <Save className="h-4 w-4" />
                            Guardar Cambios
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}
