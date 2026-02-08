import React from 'react'

interface CardProps {
    children: React.ReactNode
    className?: string
    title?: string
}

// Componente base para tarjetas (Contenedor con bordes redondeados y sombra)
export const Card = ({ children, className = '', title }: CardProps) => {
    const hasBg = className.includes('bg-')
    const hasBorder = className.includes('border-') || className.includes('border-none')

    return (
        <div className={`rounded-xl shadow-sm card-hover ${!hasBg ? 'bg-white' : ''} ${!hasBorder ? 'border border-gray-200' : ''} ${className}`}>
            {/* Cabecera opcional si el prop 'title' está presente */}
            {title && (
                <div className="px-6 py-4 border-b border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
                </div>
            )}
            {/* Contenido principal de la tarjeta */}
            <div className="p-6">
                {children}
            </div>
        </div>
    )
}

// Interfaz para las tarjetas de estadísticas (Dashboard)
interface StatCardProps {
    title: string // Título de la métrica
    value: string // Valor principal
    change: string // Variación porcentual o texto
    trend: 'up' | 'down' // Dirección de la tendencia
    icon: React.ElementType // Icono de Lucide
    color: string // Clase de color para el icono
}

// Componente para mostrar métricas rápidas con icono y tendencia
export const StatCard = ({ title, value, change, trend, icon: Icon, color }: StatCardProps) => (
    <Card className="flex-1">
        <div className="flex items-start justify-between">
            <div>
                <p className="text-sm font-medium text-gray-500">{title}</p>
                <h4 className="mt-2 text-2xl font-bold text-gray-900">{value}</h4>
                <div className="mt-2 flex items-center">
                    {/* Indicador de tendencia (verde subida, rojo bajada) */}
                    <span className={`text-sm font-medium ${trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
                        {trend === 'up' ? '↑' : '↓'} {change}
                    </span>
                    <span className="ml-2 text-sm text-gray-500">vs mes anterior</span>
                </div>
            </div>
            {/* Contenedor del icono con color dinámico */}
            <div className={`p-3 rounded-lg ${color}`}>
                <Icon className="h-6 w-6 text-white" />
            </div>
        </div>
    </Card>
)
