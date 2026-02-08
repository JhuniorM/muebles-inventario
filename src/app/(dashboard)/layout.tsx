'use client'

import { useState } from 'react'
import Header from '@/components/dashboard/Header'
import Sidebar from '@/components/dashboard/Sidebar'

// Diseño base (Layout) para todas las páginas del Dashboard
export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    // Estado para controlar si el menú lateral (Sidebar) está abierto en móviles
    const [sidebarOpen, setSidebarOpen] = useState(false)

    return (
        <div className="flex min-h-screen bg-gray-50">
            {/* Componente de la barra lateral de navegación */}
            <Sidebar
                open={sidebarOpen}
                onClose={() => setSidebarOpen(false)}
            />

            <div className="flex flex-col flex-1 min-w-0">
                {/* Cabecera superior con botón de menú y perfil */}
                <Header
                    sidebarOpen={sidebarOpen}
                    onMenuToggle={() => setSidebarOpen(!sidebarOpen)}
                />

                {/* Contenido principal de cada página (Dashboard, Inventario, etc.) */}
                <main className="flex-1 p-4 lg:p-8 overflow-y-auto">
                    {children}
                </main>
            </div>
        </div>
    );
}
