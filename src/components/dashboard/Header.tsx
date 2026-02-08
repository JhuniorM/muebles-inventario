'use client'

import { useState, useEffect, useRef } from 'react'
import { Search, Bell, User, Menu, X, Package, Users, ArrowRight, Loader2 } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { usePathname, useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase/client'

interface HeaderProps {
    onMenuToggle?: () => void
    sidebarOpen?: boolean
}

export default function Header({ onMenuToggle, sidebarOpen = false }: HeaderProps) {
    const { profile, logout } = useAuth()
    const pathname = usePathname()
    const router = useRouter()
    const dropdownRef = useRef<HTMLDivElement>(null)

    const [showUserMenu, setShowUserMenu] = useState(false)
    const [notifications] = useState(3)

    // Estados para búsqueda global
    const [searchQuery, setSearchQuery] = useState('')
    const [searchResults, setSearchResults] = useState<{
        productos: any[],
        clientes: any[]
    }>({ productos: [], clientes: [] })
    const [isSearching, setIsSearching] = useState(false)
    const [showResults, setShowResults] = useState(false)

    // Cerrar menús al hacer clic fuera
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setShowResults(false)
            }
        }
        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    // Lógica de búsqueda con Debounce
    useEffect(() => {
        const timer = setTimeout(() => {
            if (searchQuery.trim().length > 1) {
                performSearch()
            } else {
                setSearchResults({ productos: [], clientes: [] })
                setShowResults(false)
            }
        }, 400)

        return () => clearTimeout(timer)
    }, [searchQuery])

    const performSearch = async () => {
        setIsSearching(true)
        setShowResults(true)

        try {
            // Búsqueda en paralelo de productos y clientes
            const [prodRes, cliRes] = await Promise.all([
                supabase
                    .from('productos')
                    .select('id, nombre, tipo')
                    .ilike('nombre', `%${searchQuery}%`)
                    .limit(5),
                supabase
                    .from('clientes')
                    .select('id, nombre, email')
                    .ilike('nombre', `%${searchQuery}%`)
                    .limit(5)
            ])

            setSearchResults({
                productos: prodRes.data || [],
                clientes: cliRes.data || []
            })
        } catch (error) {
            console.error('Search error:', error)
        } finally {
            setIsSearching(false)
        }
    }

    const getPageTitle = () => {
        const path = pathname.split('/')[1] || 'dashboard'
        const titles: Record<string, string> = {
            dashboard: 'Dashboard',
            ventas: 'Ventas',
            compras: 'Compras',
            inventario: 'Inventario',
            reportes: 'Reportes',
            usuarios: 'Usuarios',
            perfil: 'Perfil',
            configuracion: 'Configuración'
        }
        return titles[path] || 'Dashboard'
    }

    const getUserInitials = () => {
        if (!profile?.nombre_completo) return 'U'
        return profile.nombre_completo
            .split(' ')
            .map(n => n[0])
            .join('')
            .toUpperCase()
            .slice(0, 2)
    }

    return (
        <header className="sticky top-0 z-30 glass border-b border-gray-200">
            <div className="px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    {/* Left side */}
                    <div className="flex items-center">
                        <button
                            onClick={onMenuToggle}
                            className="p-2 rounded-lg text-gray-600 hover:bg-gray-100 lg:hidden"
                        >
                            {sidebarOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                        </button>

                        <div className="ml-4">
                            <h1 className="text-xl font-semibold text-gray-900 leading-tight">
                                {getPageTitle()}
                            </h1>
                            <p className="text-[10px] font-black uppercase tracking-tighter text-blue-600 hidden sm:block">
                                Muebles & Estilos Inventario
                            </p>
                        </div>
                    </div>

                    {/* Right side */}
                    <div className="flex items-center gap-3">
                        {/* Search Container */}
                        <div className="hidden md:block relative" ref={dropdownRef}>
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                {isSearching ? (
                                    <Loader2 className="h-4 w-4 text-blue-500 animate-spin" />
                                ) : (
                                    <Search className="h-4 w-4 text-gray-400" />
                                )}
                            </div>
                            <input
                                type="search"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                onFocus={() => searchQuery.length > 1 && setShowResults(true)}
                                placeholder="Productos, clientes..."
                                className="pl-10 pr-4 py-2 border border-gray-200 bg-gray-50/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:bg-white focus:border-blue-500 w-64 text-sm transition-all"
                            />

                            {/* Resultados de búsqueda */}
                            {showResults && (
                                <div className="absolute top-full right-0 mt-2 w-80 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2">
                                    <div className="max-h-[400px] overflow-y-auto">
                                        {/* Sección Productos */}
                                        {searchResults.productos.length > 0 && (
                                            <div className="p-2">
                                                <p className="px-3 py-1 text-[10px] font-black text-gray-400 uppercase tracking-widest">Productos</p>
                                                {searchResults.productos.map(p => (
                                                    <button
                                                        key={p.id}
                                                        onClick={() => {
                                                            router.push(`/inventario?search=${p.nombre}`)
                                                            setShowResults(false)
                                                            setSearchQuery('')
                                                        }}
                                                        className="w-full flex items-center justify-between p-3 hover:bg-blue-50/50 rounded-xl transition-colors group"
                                                    >
                                                        <div className="flex items-center gap-3">
                                                            <div className="p-2 bg-blue-50 rounded-lg group-hover:bg-blue-100 transition-colors">
                                                                <Package className="h-4 w-4 text-blue-600" />
                                                            </div>
                                                            <div className="text-left">
                                                                <p className="text-sm font-bold text-gray-900">{p.nombre}</p>
                                                                <p className="text-xs text-gray-500 capitalize">{p.tipo}</p>
                                                            </div>
                                                        </div>
                                                        <ArrowRight className="h-4 w-4 text-gray-300 opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all" />
                                                    </button>
                                                ))}
                                            </div>
                                        )}

                                        {/* Sección Clientes */}
                                        {searchResults.clientes.length > 0 && (
                                            <div className="p-2 border-t border-gray-50">
                                                <p className="px-3 py-1 text-[10px] font-black text-gray-400 uppercase tracking-widest">Clientes</p>
                                                {searchResults.clientes.map(c => (
                                                    <button
                                                        key={c.id}
                                                        className="w-full flex items-center justify-between p-3 hover:bg-green-50/50 rounded-xl transition-colors group"
                                                    >
                                                        <div className="flex items-center gap-3">
                                                            <div className="p-2 bg-green-50 rounded-lg group-hover:bg-green-100 transition-colors">
                                                                <Users className="h-4 w-4 text-green-600" />
                                                            </div>
                                                            <div className="text-left">
                                                                <p className="text-sm font-bold text-gray-900">{c.nombre}</p>
                                                                <p className="text-xs text-gray-500 truncate w-40">{c.email || 'Sin correo'}</p>
                                                            </div>
                                                        </div>
                                                        <ArrowRight className="h-4 w-4 text-gray-300 opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all" />
                                                    </button>
                                                ))}
                                            </div>
                                        )}

                                        {searchResults.productos.length === 0 && searchResults.clientes.length === 0 && !isSearching && (
                                            <div className="p-8 text-center">
                                                <p className="text-sm text-gray-500 italic">No se encontraron resultados para "{searchQuery}"</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Notifications */}
                        <button className="relative p-2 text-gray-500 hover:bg-gray-100 rounded-xl transition-colors">
                            <Bell className="h-5 w-5" />
                            {notifications > 0 && (
                                <span className="absolute top-1.5 right-1.5 bg-red-500 text-white text-[10px] font-black rounded-full h-4 w-4 flex items-center justify-center border-2 border-white">
                                    {notifications}
                                </span>
                            )}
                        </button>

                        {/* User Menu */}
                        <div className="relative">
                            <button
                                onClick={() => setShowUserMenu(!showUserMenu)}
                                className="flex items-center gap-2 p-1 pl-2 hover:bg-gray-100 rounded-xl transition-all border border-transparent hover:border-gray-200"
                            >
                                <div className="hidden md:block text-right">
                                    <div className="text-xs font-black text-gray-900 line-clamp-1">
                                        {profile?.nombre_completo || 'Usuario'}
                                    </div>
                                    <div className="text-[10px] font-bold text-gray-500 uppercase tracking-tighter">
                                        {profile?.rol || 'Sin rol'}
                                    </div>
                                </div>
                                <div className="h-9 w-9 bg-gradient-to-br from-blue-500 to-indigo-600 text-white rounded-lg flex items-center justify-center font-black shadow-sm">
                                    {getUserInitials()}
                                </div>
                            </button>

                            {showUserMenu && (
                                <>
                                    <div className="fixed inset-0 z-10" onClick={() => setShowUserMenu(false)}></div>
                                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-2xl border border-gray-100 py-2 z-20 animate-in fade-in slide-in-from-top-2">
                                        <div className="px-4 py-2 border-b border-gray-50 mb-1">
                                            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Mi Cuenta</p>
                                        </div>
                                        <Link
                                            href="/perfil"
                                            className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-blue-50 transition-colors mx-2 rounded-xl"
                                            onClick={() => setShowUserMenu(false)}
                                        >
                                            <User className="h-4 w-4" />
                                            <span>Mi perfil</span>
                                        </Link>
                                        <Link
                                            href="/configuracion"
                                            className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-blue-50 transition-colors mx-2 rounded-xl"
                                            onClick={() => setShowUserMenu(false)}
                                        >
                                            <Settings2 className="h-4 w-4" />
                                            <span>Configuración</span>
                                        </Link>
                                        <div className="border-t border-gray-50 my-2 mx-2"></div>
                                        <button
                                            onClick={() => {
                                                logout()
                                                setShowUserMenu(false)
                                            }}
                                            className="flex items-center gap-3 w-[calc(100%-16px)] mx-2 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors rounded-xl font-bold"
                                        >
                                            <X className="h-4 w-4" />
                                            <span>Cerrar sesión</span>
                                        </button>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </header>
    )
}

function Settings2({ className }: { className?: string }) {
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
            <path d="M20 7h-9" />
            <path d="M14 17H5" />
            <circle cx="17" cy="17" r="3" />
            <circle cx="7" cy="7" r="3" />
        </svg>
    )
}
