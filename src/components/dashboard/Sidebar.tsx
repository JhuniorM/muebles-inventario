'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
    LayoutDashboard,
    ShoppingCart,
    Package,
    BarChart3,
    Users,
    Settings,
    ChevronLeft,
    X,
    Plus
} from 'lucide-react'

interface SidebarProps {
    open: boolean
    onClose: () => void
}

export default function Sidebar({ open, onClose }: SidebarProps) {
    const pathname = usePathname()

    const menuItems = [
        { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
        { name: 'Inventario', href: '/inventario', icon: Package },
        { name: 'Ventas', href: '/ventas', icon: ShoppingCart },
        { name: 'Compras', href: '/compras', icon: ShoppingCart },
        { name: 'Reportes', href: '/reportes', icon: BarChart3 },
        { name: 'Usuarios', href: '/usuarios', icon: Users },
    ]

    const isActive = (path: string) => pathname.startsWith(path)

    return (
        <>
            {/* Overlay mobile */}
            {open && (
                <div
                    className="fixed inset-0 z-40 bg-black/50 lg:hidden backdrop-blur-sm transition-opacity"
                    onClick={onClose}
                />
            )}

            {/* Sidebar Container */}
            <aside className={`
        fixed top-0 left-0 z-50 h-full w-64 bg-white border-r border-gray-200 transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0
        ${open ? 'translate-x-0' : '-translate-x-full'}
      `}>
                <div className="flex flex-col h-full">
                    {/* Header */}
                    <div className="h-16 flex items-center justify-between px-6 border-b border-gray-100">
                        <div className="flex items-center gap-2">
                            <div className="h-8 w-8 bg-blue-600 rounded-lg flex items-center justify-center">
                                <Package className="h-5 w-5 text-white" />
                            </div>
                            <span className="font-bold text-gray-900 text-lg tracking-tight">Inventario</span>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-1 rounded-lg hover:bg-gray-100 lg:hidden"
                        >
                            <X className="h-5 w-5 text-gray-500" />
                        </button>
                    </div>

                    {/* Navigation */}
                    <nav className="flex-1 overflow-y-auto py-6 px-3 space-y-1">
                        {menuItems.map((item) => {
                            const active = isActive(item.href)
                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    onClick={() => {
                                        if (window.innerWidth < 1024) onClose()
                                    }}
                                    className={`
                    flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-all group
                    ${active
                                            ? 'bg-blue-50 text-blue-600 shadow-sm border border-blue-100'
                                            : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}
                  `}
                                >
                                    <item.icon className={`
                    h-5 w-5 transition-colors
                    ${active ? 'text-blue-600' : 'text-gray-400 group-hover:text-gray-600'}
                  `} />
                                    {item.name}
                                </Link>
                            )
                        })}
                    </nav>

                    {/* Footer / Quick Action */}
                    <div className="p-4 border-t border-gray-100">
                        <Link
                            href="/configuracion"
                            className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors"
                        >
                            <Settings className="h-5 w-5 text-gray-400" />
                            Configuración
                        </Link>
                        <div className="mt-4 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl p-4 text-white shadow-lg shadow-blue-200">
                            <p className="text-xs font-medium text-blue-100 opacity-80 mb-1">Necesitas ayuda?</p>
                            <p className="text-sm font-bold mb-3">Guía de Usuario</p>
                            <button className="w-full bg-white/20 hover:bg-white/30 py-2 rounded-lg text-xs font-bold transition-colors">
                                Ver Documentación
                            </button>
                        </div>
                    </div>
                </div>
            </aside>
        </>
    )
}
