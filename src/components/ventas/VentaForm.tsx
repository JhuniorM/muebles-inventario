'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase/client'
import { Producto, Cliente } from '@/types/database'
import { Loader2, Sofa, Layers, UserPlus, Check } from 'lucide-react'
import { transactionService } from '@/lib/services/transactionService'

// Map categories to icons
const CATEGORIES = [
    { id: 'mueble', name: 'Mueble', icon: Sofa, color: 'text-indigo-600', bg: 'bg-indigo-50', border: 'border-indigo-200' },
    { id: 'tela', name: 'Tela', icon: Layers, color: 'text-pink-600', bg: 'bg-pink-50', border: 'border-pink-200' },
]

interface VentaFormProps {
    initialData?: any
    onSuccess?: () => void
    onCancel?: () => void
}

export default function VentaForm({ initialData, onSuccess, onCancel }: VentaFormProps) {
    // Listas de productos y clientes desde la base de datos
    const [productos, setProductos] = useState<Producto[]>([])
    const [clientes, setClientes] = useState<Cliente[]>([])
    const [loading, setLoading] = useState(true) // Estado de carga inicial
    const [submitting, setSubmitting] = useState(false) // Estado durante el envío

    // Estados del formulario (IDs y valores básicos)
    const [productoId, setProductoId] = useState('')
    const [clienteId, setClienteId] = useState('')
    const [cantidad, setCantidad] = useState<string>('1') // Se usa string para facilitar el manejo del imput
    const [precioUnitario, setPrecioUnitario] = useState<string>('0')
    const [fecha, setFecha] = useState(new Date().toISOString().split('T')[0]) // Fecha actual por defecto
    const [notas, setNotas] = useState('')

    // Estados para la personalización y "Registro Rápido"
    const [selectedCategory, setSelectedCategory] = useState<string>('') // Categoría visual (Mueble/Tela)
    const [colorMarca, setColorMarca] = useState('') // Detalle específico para telas
    const [unidadMedida, setUnidadMedida] = useState<'unidad' | 'juego'>('unidad') // Tipo de venta para muebles
    const [isQuickAddClient, setIsQuickAddClient] = useState(false) // Toggle para crear cliente nuevo
    const [quickAddClientName, setQuickAddClientName] = useState('')
    const [isQuickAddProduct, setIsQuickAddProduct] = useState(false) // Toggle para crear producto nuevo
    const [quickAddProductName, setQuickAddProductName] = useState('')

    // Cálculos en tiempo real para la interfaz
    const numCantidad = parseFloat(cantidad) || 0
    const numPrecio = parseFloat(precioUnitario) || 0
    const total = numCantidad * numPrecio

    useEffect(() => {
        const init = async () => {
            const prodData = await fetchData()
            if (initialData && prodData) {
                setProductoId(initialData.producto_id)
                setClienteId(initialData.cliente_id)
                setCantidad(initialData.cantidad.toString())
                setPrecioUnitario(initialData.precio_unitario.toString())
                setFecha(initialData.fecha)
                setNotas(initialData.notas || '')

                const prod = prodData.find((p: any) => p.id === initialData.producto_id)
                if (prod) setSelectedCategory(prod.tipo)
            }
        }
        init()
    }, [initialData])

    // Función para obtener productos y clientes desde Supabase
    const fetchData = async () => {
        setLoading(true)
        try {
            // Solo traemos productos que tengan stock disponible
            const { data: prodData } = await supabase
                .from('productos')
                .select('*')
                .in('tipo', ['mueble', 'tela'])
                .gt('stock', 0)

            const { data: cliData } = await supabase
                .from('clientes')
                .select('*')
                .order('nombre')

            setProductos(prodData || [])
            setClientes(cliData || [])
            return prodData
        } finally {
            setLoading(false)
        }
    }

    // Al cambiar de producto, actualizamos automáticamente el precio sugerido
    const handleProductoChange = (id: string) => {
        setProductoId(id)
        const prod = productos.find(p => p.id === id)
        if (prod) {
            setPrecioUnitario(prod.precio_unitario.toString())
        }
    }

    // Validador de entrada numérica (evita caracteres no deseados)
    const handleNumericInput = (value: string, setter: (v: string) => void) => {
        if (value === '' || value === '.' || !isNaN(parseFloat(value))) {
            const formatted = value.replace(/^0+(?=\d)/, '')
            setter(formatted)
        }
    }

    // Función principal para registrar la venta
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        // Validaciones básicas de seguridad
        if (!isQuickAddProduct && !productoId) return
        if (!isQuickAddClient && !clienteId) return
        if (isQuickAddProduct && !quickAddProductName) return
        if (isQuickAddClient && !quickAddClientName) return

        setSubmitting(true)
        try {
            let finalProductoId = productoId
            let finalClienteId = clienteId

            // PASO 1: Crear el Producto si es un registro nuevo (On-the-fly)
            if (isQuickAddProduct) {
                const { data: newProd, error: prodErr } = await supabase
                    .from('productos')
                    .insert({
                        nombre: quickAddProductName,
                        tipo: selectedCategory || 'mueble',
                        precio_unitario: numPrecio,
                        stock: 0,
                        atributos: {}
                    })
                    .select()
                    .single()

                if (prodErr) throw prodErr
                finalProductoId = newProd.id
            }

            // PASO 2: Crear el Cliente si es nuevo
            if (isQuickAddClient) {
                const { data: newCli, error: cliErr } = await supabase
                    .from('clientes')
                    .insert({ nombre: quickAddClientName })
                    .select()
                    .single()

                if (cliErr) throw cliErr
                finalClienteId = newCli.id
            }

            // PASO 3: Preparar notas combinando los detalles dinámicos
            let finalNotas = notas
            const details = []
            if (selectedCategory === 'tela' && colorMarca) details.push(`Detalle: ${colorMarca}`)
            if (selectedCategory === 'mueble') details.push(`Venta por: ${unidadMedida}`)

            if (details.length > 0) {
                finalNotas = details.join(' | ') + (notas ? ` - ${notas}` : '')
            }

            // PASO 4: Insertar o Actualizar la transacción
            const txData = {
                tipo: 'venta',
                producto_id: finalProductoId,
                cliente_id: finalClienteId,
                cantidad: numCantidad,
                precio_unitario: numPrecio,
                total,
                fecha,
                notas: finalNotas
            }

            if (initialData?.id) {
                await transactionService.updateTransaction(initialData.id, txData)
            } else {
                const { error: txError } = await supabase
                    .from('transacciones')
                    .insert(txData)

                if (txError) throw txError

                // PASO 5: Actualizar el stock del producto (solo para nuevas ventas, updateTransaction ya maneja stock)
                const targetProdId = isQuickAddProduct ? finalProductoId : productoId
                const prod = productos.find(p => p.id === targetProdId)
                const currentStock = prod ? prod.stock : 0

                await supabase
                    .from('productos')
                    .update({ stock: currentStock - numCantidad })
                    .eq('id', targetProdId)
            }

            if (onSuccess) onSuccess()
        } catch (error) {
            console.error('Error registering sale:', error)
            alert(initialData ? 'Error al actualizar la venta' : 'Error al registrar la venta')
        } finally {
            setSubmitting(false)
        }
    }

    const filteredProductos = selectedCategory
        ? productos.filter(p => p.tipo === selectedCategory)
        : productos

    const currentCategoryName = CATEGORIES.find(c => c.id === selectedCategory)?.name || 'producto'

    if (loading) {
        return (
            <div className="flex items-center justify-center p-12">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            </div>
        )
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-8">
            {/* 1. Categoría Visual */}
            <div className="space-y-3">
                <label className="text-sm font-bold text-gray-700 uppercase tracking-wider block">
                    1. ¿Qué está vendiendo?
                </label>
                <div className="grid grid-cols-2 gap-4">
                    {CATEGORIES.map((cat) => (
                        <button
                            key={cat.id}
                            type="button"
                            onClick={() => setSelectedCategory(cat.id === selectedCategory ? '' : cat.id)}
                            className={`
                                relative p-6 rounded-2xl border-2 transition-all flex flex-col items-center gap-3 group
                                ${selectedCategory === cat.id
                                    ? `${cat.border} ${cat.bg} ring-2 ring-offset-1 ring-green-500 shadow-md scale-[1.02]`
                                    : 'border-gray-100 bg-white hover:border-gray-300 hover:shadow-md'}
                            `}
                        >
                            <cat.icon className={`h-10 w-10 transition-transform group-hover:scale-110 ${cat.color}`} />
                            <span className={`text-sm font-black ${selectedCategory === cat.id ? 'text-gray-900' : 'text-gray-500'}`}>
                                {cat.name.toUpperCase()}
                            </span>
                            {selectedCategory === cat.id && (
                                <div className="absolute top-2 right-2 h-6 w-6 bg-green-600 rounded-full flex items-center justify-center shadow-sm animate-in zoom-in duration-200">
                                    <Check className="h-4 w-4 text-white" />
                                </div>
                            )}
                        </button>
                    ))}
                </div>
            </div>

            {/* 2. Detalles */}
            <div className="space-y-6 bg-gray-50 p-6 rounded-2xl border border-gray-100 shadow-inner">
                <label className="text-sm font-bold text-gray-700 uppercase tracking-wider block">
                    2. Detalles de la Venta
                </label>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Producto */}
                    <div className="space-y-1">
                        <div className="flex justify-between items-center mb-1">
                            <label className="text-sm font-medium text-gray-700">Producto / Modelo</label>
                            <button
                                type="button"
                                onClick={() => {
                                    setIsQuickAddProduct(!isQuickAddProduct)
                                    setProductoId('')
                                }}
                                className={`text-[10px] uppercase font-extrabold px-2 py-1 rounded transition-colors ${isQuickAddProduct ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-600'}`}
                            >
                                {isQuickAddProduct ? '✕ Cancelar' : '+ Nuevo Item'}
                            </button>
                        </div>
                        {isQuickAddProduct ? (
                            <input
                                type="text"
                                required
                                value={quickAddProductName}
                                onChange={(e) => setQuickAddProductName(e.target.value)}
                                placeholder="Nombre del nuevo producto..."
                                className="w-full p-2.5 border-2 border-indigo-500 rounded-lg focus:ring-2 focus:ring-indigo-500 bg-white shadow-sm font-bold"
                            />
                        ) : (
                            <select
                                required
                                value={productoId}
                                onChange={(e) => handleProductoChange(e.target.value)}
                                className={`w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-green-500 bg-white shadow-sm transition-colors ${!productoId ? 'border-orange-300 bg-orange-50/30' : 'border-gray-300'}`}
                            >
                                <option value="">{selectedCategory ? `Seleccionar ${currentCategoryName.toLowerCase()}...` : 'Elija una categoría arriba...'}</option>
                                {filteredProductos.map(p => (
                                    <option key={p.id} value={p.id}>{p.nombre} (Stock: {p.stock})</option>
                                ))}
                            </select>
                        )}
                    </div>

                    {/* Cliente con Quick Add */}
                    <div className="space-y-1">
                        <div className="flex justify-between items-center mb-1">
                            <label className="text-sm font-medium text-gray-700">Cliente</label>
                            <button
                                type="button"
                                onClick={() => {
                                    setIsQuickAddClient(!isQuickAddClient)
                                    setClienteId('')
                                }}
                                className={`text-[10px] uppercase font-extrabold px-2 py-1 rounded transition-colors ${isQuickAddClient ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-600'}`}
                            >
                                {isQuickAddClient ? '✕ Cancelar Nuevo' : '+ Nuevo Cliente'}
                            </button>
                        </div>
                        {isQuickAddClient ? (
                            <div className="relative">
                                <UserPlus className="absolute left-3 top-2.5 h-4 w-4 text-green-500" />
                                <input
                                    type="text"
                                    required
                                    value={quickAddClientName}
                                    onChange={(e) => setQuickAddClientName(e.target.value)}
                                    placeholder="Nombre del cliente nuevo..."
                                    className="w-full pl-10 pr-4 py-2.5 border-2 border-green-500 rounded-lg focus:ring-2 focus:ring-green-500 bg-white shadow-sm font-bold"
                                />
                            </div>
                        ) : (
                            <select
                                required
                                value={clienteId}
                                onChange={(e) => setClienteId(e.target.value)}
                                className={`w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-green-500 bg-white shadow-sm transition-colors ${!clienteId ? 'border-orange-300 bg-orange-50/30' : 'border-gray-300'}`}
                            >
                                <option value="">Seleccionar cliente...</option>
                                {clientes.map(c => (
                                    <option key={c.id} value={c.id}>{c.nombre}</option>
                                ))}
                            </select>
                        )}
                    </div>

                    {/* Dinámico: Tela */}
                    {selectedCategory === 'tela' && (
                        <div className="space-y-1 md:col-span-2">
                            <label className="text-sm font-medium text-gray-700">Color / Marca / Detalle de la Tela</label>
                            <input
                                type="text"
                                value={colorMarca}
                                onChange={(e) => setColorMarca(e.target.value)}
                                placeholder="Ej: Velvet azul, Moro oscuro, etc."
                                className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 bg-white"
                            />
                        </div>
                    )}

                    {/* Dinámico: Mueble */}
                    {selectedCategory === 'mueble' && (
                        <div className="space-y-1">
                            <label className="text-sm font-medium text-gray-700">Tipo de Venta</label>
                            <div className="grid grid-cols-2 gap-2">
                                <button
                                    type="button"
                                    onClick={() => setUnidadMedida('unidad')}
                                    className={`py-2 rounded-lg border-2 font-bold text-xs transition-all ${unidadMedida === 'unidad' ? 'border-green-600 bg-green-50 text-green-700' : 'border-gray-200 text-gray-500 hover:border-gray-300'}`}
                                >
                                    PIEZA ÚNICA
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setUnidadMedida('juego')}
                                    className={`py-2 rounded-lg border-2 font-bold text-xs transition-all ${unidadMedida === 'juego' ? 'border-green-600 bg-green-50 text-green-700' : 'border-gray-200 text-gray-500 hover:border-gray-300'}`}
                                >
                                    JUEGO COMPLETO
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Cantidad y Precio */}
                    <div className="space-y-1">
                        <label className="text-sm font-medium text-gray-700">
                            {selectedCategory === 'tela' ? 'Cantidad de Metros' : 'Cantidad Unidades'}
                        </label>
                        <input
                            type="text"
                            required
                            value={cantidad}
                            onChange={(e) => handleNumericInput(e.target.value, setCantidad)}
                            className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 font-bold"
                        />
                    </div>

                    <div className="space-y-1">
                        <label className="text-sm font-medium text-green-700 font-bold">Precio Unitario (S/.)</label>
                        <div className="relative">
                            <span className="absolute left-3 top-2.5 text-green-400 font-bold">S/</span>
                            <input
                                type="text"
                                required
                                value={precioUnitario}
                                onChange={(e) => handleNumericInput(e.target.value, setPrecioUnitario)}
                                className="w-full pl-8 pr-4 py-2.5 border-2 border-green-500 bg-white rounded-lg focus:ring-2 focus:ring-green-500 font-bold text-green-600 shadow-sm"
                            />
                        </div>
                    </div>

                    <div className="space-y-1">
                        <label className="text-sm font-medium text-gray-700">Fecha de venta</label>
                        <input
                            type="date"
                            required
                            value={fecha}
                            onChange={(e) => setFecha(e.target.value)}
                            className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 bg-white shadow-sm"
                        />
                    </div>

                    {/* Total Display */}
                    <div className="flex items-end pb-1">
                        <div className="bg-green-600 border border-green-700 rounded-2xl px-6 py-3 w-full flex justify-between items-center text-white shadow-lg shadow-green-200">
                            <span className="font-bold text-green-100 uppercase text-xs">Total Venta:</span>
                            <span className="text-3xl font-black">S/. {total.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                        </div>
                    </div>

                    {/* Notas */}
                    <div className="md:col-span-2 space-y-1">
                        <label className="text-sm font-medium text-gray-700">Notas Adicionales</label>
                        <textarea
                            rows={2}
                            value={notas}
                            onChange={(e) => setNotas(e.target.value)}
                            placeholder="Cualquier otra observación sobre esta venta..."
                            className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 bg-white shadow-sm"
                        />
                    </div>
                </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 pt-4 border-t border-gray-100">
                <button
                    type="submit"
                    disabled={submitting}
                    className="flex-[2] bg-green-600 text-white font-black py-4 rounded-2xl hover:bg-green-700 transform transition-all active:scale-95 flex flex-col items-center justify-center gap-1 disabled:opacity-50 shadow-xl shadow-green-200 uppercase tracking-widest text-sm"
                >
                    <div className="flex items-center gap-2">
                        {submitting && <Loader2 className="h-5 w-5 animate-spin" />}
                        {initialData ? 'Confirmar Edición de Venta' : 'Confirmar Registro de Venta'}
                    </div>
                    {(!productoId || (!isQuickAddClient && !clienteId)) && (
                        <span className="text-[10px] lowercase font-normal opacity-80">Seleccione producto y cliente</span>
                    )}
                </button>
                <button
                    type="button"
                    onClick={onCancel}
                    disabled={submitting}
                    className="flex-1 py-4 border-2 border-gray-200 rounded-2xl text-gray-600 hover:bg-gray-50 hover:border-gray-300 font-bold transition-all uppercase tracking-widest text-xs"
                >
                    Cancelar
                </button>
            </div>
        </form>
    )
}
