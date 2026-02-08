'use client'

import { useAuth } from '@/hooks/useAuth'
import { Card } from '@/components/ui/Card'
import { User, Mail, Shield, Phone, Calendar, LogOut, Loader2 } from 'lucide-react'

export default function PerfilPage() {
    const { profile, loading, logout } = useAuth()

    if (loading) {
        return (
            <div className="flex h-[80vh] items-center justify-center">
                <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
            </div>
        )
    }

    if (!profile) {
        return (
            <div className="flex h-[80vh] items-center justify-center">
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-gray-900">No se encontró el perfil</h2>
                    <p className="text-gray-500 mt-2">Por favor, inicia sesión de nuevo.</p>
                </div>
            </div>
        )
    }

    const getUserInitials = () => {
        if (!profile.nombre_completo) return 'U'
        return profile.nombre_completo
            .split(' ')
            .map(n => n[0])
            .join('')
            .toUpperCase()
            .slice(0, 2)
    }

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">Mi Perfil</h2>
                    <p className="text-gray-500">Gestiona tu información personal y configuraciones de cuenta</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Profile Card */}
                <Card className="lg:col-span-1 flex flex-col items-center text-center py-8">
                    <div className="h-24 w-24 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-3xl font-bold mb-4 shadow-inner">
                        {getUserInitials()}
                    </div>
                    <h3 className="text-xl font-bold text-gray-900">{profile.nombre_completo}</h3>
                    <div className="mt-2 inline-flex items-center px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-blue-100 text-blue-700">
                        <Shield className="h-3 w-3 mr-1" />
                        {profile.rol || 'Usuario'}
                    </div>
                    <p className="text-sm text-gray-500 mt-4 px-4">
                        Sistema de Inventario • Muebles & Cía.
                    </p>
                    <button
                        onClick={() => logout()}
                        className="mt-8 flex items-center gap-2 text-red-600 hover:text-red-700 font-medium transition-colors"
                    >
                        <LogOut className="h-4 w-4" />
                        Cerrar sesión
                    </button>
                </Card>

                {/* Details Card */}
                <Card className="lg:col-span-2" title="Información de la Cuenta">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                        <div className="space-y-1">
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                                <User className="h-3 w-3" /> Nombre Completo
                            </p>
                            <p className="text-gray-900 font-medium">{profile.nombre_completo || 'No especificado'}</p>
                        </div>
                        <div className="space-y-1">
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                                <Mail className="h-3 w-3" /> Correo Electrónico
                            </p>
                            <p className="text-gray-900 font-medium">{profile.email || 'No especificado'}</p>
                        </div>
                        <div className="space-y-1">
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                                <Shield className="h-3 w-3" /> Rol del Sistema
                            </p>
                            <p className="text-gray-900 font-medium capitalize">{profile.rol || 'Usuario Estándar'}</p>
                        </div>
                        <div className="space-y-1">
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                                <Phone className="h-3 w-3" /> Teléfono de Contacto
                            </p>
                            <p className="text-gray-900 font-medium">{profile.telefono || 'No especificado'}</p>
                        </div>
                        <div className="space-y-1">
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                                <Calendar className="h-3 w-3" /> Miembro desde
                            </p>
                            <p className="text-gray-900 font-medium">
                                {profile.created_at ? new Date(profile.created_at).toLocaleDateString('es-ES', {
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric'
                                }) : 'N/A'}
                            </p>
                        </div>
                        <div className="space-y-1">
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                                <Calendar className="h-3 w-3" /> Último acceso
                            </p>
                            <p className="text-gray-900 font-medium">
                                {profile.updated_at ? new Date(profile.updated_at).toLocaleString('es-ES') : 'Recientemente'}
                            </p>
                        </div>
                    </div>

                    <div className="mt-10 pt-6 border-t border-gray-100">
                        <div className="bg-blue-50 border border-blue-100 rounded-lg p-4">
                            <h4 className="text-sm font-bold text-blue-900 flex items-center gap-2 mb-1">
                                <Shield className="h-4 w-4" /> Tip sobre Permisos
                            </h4>
                            <p className="text-xs text-blue-700 leading-relaxed">
                                Como <strong>{profile.rol}</strong>, tienes acceso a {profile.rol === 'admin' ? 'todas las funciones del sistema, incluyendo gestión de usuarios y reportes financieros completos.' : 'las funciones de registro de ventas, compras y gestión de inventario básico.'}
                            </p>
                        </div>
                    </div>
                </Card>
            </div>
        </div>
    )
}
