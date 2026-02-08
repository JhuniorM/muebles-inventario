'use client'

import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/Card'
import { Plus, Search, Filter, User, Mail, Shield, Circle, Loader2 } from 'lucide-react'
import { supabase } from '@/lib/supabase/client'
import { Profile } from '@/types/database'

export default function UsuariosPage() {
    const [profiles, setProfiles] = useState<Profile[]>([]) // Lista de perfiles de usuario
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState('')

    useEffect(() => {
        fetchProfiles()
    }, [])

    // Función para obtener todos los perfiles de la base de datos
    const fetchProfiles = async () => {
        setLoading(true)
        try {
            const { data, error } = await supabase
                .from('perfiles')
                .select('*')
                .order('created_at', { ascending: false })

            if (error) throw error
            setProfiles(data || [])
        } catch (error) {
            console.error('Error fetching profiles:', error)
        } finally {
            setLoading(false)
        }
    }

    // Filtrado dinámico por nombre o email
    const filteredProfiles = profiles.filter(p =>
        p.nombre_completo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.email?.toLowerCase().includes(searchTerm.toLowerCase())
    )

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">Gestión de Usuarios</h2>
                    <p className="text-gray-500">Administra los accesos y roles del personal</p>
                </div>
                <button className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700 transition-colors shadow-sm">
                    <Plus className="h-5 w-5" />
                    Nuevo Usuario
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="bg-white border-blue-100">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-blue-50 rounded-xl">
                            <Users className="h-6 w-6 text-blue-600" />
                        </div>
                        <div>
                            <p className="text-gray-500 text-sm font-medium">Total Usuarios</p>
                            <h3 className="text-2xl font-bold text-gray-900">{profiles.length}</h3>
                        </div>
                    </div>
                </Card>

                <Card className="bg-white border-green-100">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-green-50 rounded-xl">
                            <Shield className="h-6 w-6 text-green-600" />
                        </div>
                        <div>
                            <p className="text-gray-500 text-sm font-medium">Administradores</p>
                            <h3 className="text-2xl font-bold text-gray-900">
                                {profiles.filter(p => p.rol === 'admin').length}
                            </h3>
                        </div>
                    </div>
                </Card>

                <Card className="bg-white border-amber-100">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-amber-50 rounded-xl">
                            <Circle className="h-6 w-6 text-amber-600 fill-amber-600" />
                        </div>
                        <div>
                            <p className="text-gray-500 text-sm font-medium">Usuarios Activos</p>
                            <h3 className="text-2xl font-bold text-gray-900">
                                {profiles.filter(p => p.activo).length}
                            </h3>
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
                            placeholder="Buscar por nombre o correo..."
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
                                <th className="px-6 py-4">Usuario</th>
                                <th className="px-6 py-4">Rol</th>
                                <th className="px-6 py-4 text-center">Estado</th>
                                <th className="px-6 py-4">Última Sesión</th>
                                <th className="px-6 py-4 text-right">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {loading ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                                        <div className="flex flex-col items-center gap-2">
                                            <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
                                            Cargando perfiles...
                                        </div>
                                    </td>
                                </tr>
                            ) : filteredProfiles.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-8 text-center text-gray-500 italic">
                                        No se encontraron usuarios.
                                    </td>
                                </tr>
                            ) : (
                                filteredProfiles.map((p) => (
                                    <tr key={p.id} className="hover:bg-gray-50/50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center">
                                                    <User className="h-5 w-5 text-gray-500" />
                                                </div>
                                                <div>
                                                    <p className="font-bold text-gray-900">{p.nombre_completo || 'Sin nombre'}</p>
                                                    <p className="text-xs text-gray-500 flex items-center gap-1">
                                                        <Mail className="h-3 w-3" />
                                                        {p.email}
                                                    </p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-1 rounded-lg text-[10px] font-black uppercase border ${p.rol === 'admin'
                                                    ? 'bg-purple-50 text-purple-700 border-purple-100'
                                                    : 'bg-blue-50 text-blue-700 border-blue-100'
                                                }`}>
                                                {p.rol}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <div className="flex items-center justify-center gap-1.5">
                                                <div className={`h-2 w-2 rounded-full ${p.activo ? 'bg-green-500 animate-pulse' : 'bg-gray-300'}`} />
                                                <span className={`text-xs font-medium ${p.activo ? 'text-green-700' : 'text-gray-500'}`}>
                                                    {p.activo ? 'Activo' : 'Inactivo'}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-gray-500 text-xs">
                                            {p.ultima_sesion
                                                ? new Date(p.ultima_sesion).toLocaleString('es-PE')
                                                : 'Nunca'}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <button className="text-blue-600 hover:text-blue-800 font-bold text-xs">Editar</button>
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

function Users({ className }: { className?: string }) {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={className}
        >
            <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
            <circle cx="9" cy="7" r="4" />
            <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
            <path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
    )
}
