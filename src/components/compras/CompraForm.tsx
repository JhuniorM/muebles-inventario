'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase/client'
import { Producto, Proveedor, ProductoTipo } from '@/types/database'
import { Loader2, Layers, Box, Hash, Hammer, Plus, Square, Check } from 'lucide-react'
import { transactionService } from '@/lib/services/transactionService'

// Map categories to icons
const CATEGORIES = [
    { id: 'tela', name: 'Tela', icon: Layers, color: 'text-pink-600', bg: 'bg-pink-50', border: 'border-pink-200' },
    { id: 'espuma', name: 'Espuma', icon: Square, color: 'text-orange-600', bg: 'bg-orange-50', border: 'border-orange-200' },
    { id: 'suministro', name: 'Clavo', icon: Hammer, color: 'text-gray-600', bg: 'bg-gray-100', border: 'border-gray-300' },
    { id: 'plicas', name: 'Plicas', icon: Hash, color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-200' },
    { id: 'casco', name: 'Casco', icon: Box, color: 'text-amber-700', bg: 'bg-amber-50', border: 'border-amber-200' },
    { id: 'madera', name: 'Madera', icon: Hammer, color: 'text-orange-900', bg: 'bg-orange-100', border: 'border-orange-300' },
    { id: 'accesorio', name: 'Accesorios', icon: Plus, color: 'text-purple-600', bg: 'bg-purple-50', border: 'border-purple-200' },
]

interface CompraFormProps {
    initialData?: any
    onSuccess?: () => void
    onCancel?: () => void
}

export default function CompraForm({ initialData, onSuccess, onCancel }: CompraFormProps) {
    // Listas globales y filtradas para productos y proveedores
    const [allProductos, setAllProductos] = useState<Producto[]>([])
    const [filteredProductos, setFilteredProductos] = useState<Producto[]>([])
    const [proveedores, setProveedores] = useState<Proveedor[]>([])
    const [loading, setLoading] = useState(true) // Carga inicial
    const [submitting, setSubmitting] = useState(false) // Enviando datos

    // Estados básicos del formulario
    const [selectedCategory, setSelectedCategory] = useState<string>('') // Filtro de categoría visual
    const [productoId, setProductoId] = useState('')
    const [selectedTipo, setSelectedTipo] = useState('') // Tipo del producto seleccionado
    const [proveedorId, setProveedorId] = useState('')
    const [cantidad, setCantidad] = useState<string>('1')
    const [precioUnitario, setPrecioUnitario] = useState<string>('0')
    const [fecha, setFecha] = useState(new Date().toISOString().split('T')[0])
    const [notas, setNotas] = useState('')

    // Campos dinámicos según el tipo de material
    const [colorMarca, setColorMarca] = useState('') // Para Telas/Madera
    const [pulgadas, setPulgadas] = useState('') // Para Espumas/Plicas/Cascos
    const [kilos, setKilos] = useState('') // Para Suministros (clavos)

    // Estados para el registro rápido de nuevos elementos
    const [isQuickAddProduct, setIsQuickAddProduct] = useState(false)
    const [quickAddProductName, setQuickAddProductName] = useState('')
    const [isQuickAddProvider, setIsQuickAddProvider] = useState(false)
    const [quickAddProviderName, setQuickAddProviderName] = useState('')

    // Cálculos de total
    const numCantidad = parseFloat(cantidad) || 0
    const numPrecio = parseFloat(precioUnitario) || 0
    const total = numCantidad * numPrecio

    useEffect(() => {
        const init = async () => {
            const prodData = await fetchData()
            if (initialData && prodData) {
                setProductoId(initialData.producto_id)
                setProveedorId(initialData.proveedor_id)
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

    // Lógica para filtrar los productos según la categoría seleccionada visualmente
    useEffect(() => {
        if (selectedCategory) {
            setFilteredProductos(allProductos.filter(p => p.tipo === selectedCategory))
            setSelectedTipo(selectedCategory)

            // Reset del producto seleccionado si ya no pertenece a la nueva categoría
            const currentProd = allProductos.find(p => p.id === productoId)
            if (currentProd && currentProd.tipo !== selectedCategory && !initialData) {
                setProductoId('')
            }
        } else {
            setFilteredProductos(allProductos)
        }
    }, [selectedCategory, allProductos])

    // Obtener los datos base desde Supabase
    const fetchData = async () => {
        setLoading(true)
        try {
            const { data: prodData } = await supabase
                .from('productos')
                .select('*')
                .neq('tipo', 'mueble')

            const { data: provData } = await supabase
                .from('proveedores')
                .select('*')
                .order('nombre')

            setAllProductos(prodData || [])
            setFilteredProductos(prodData || [])
            setProveedores(provData || [])
            return prodData
        } finally {
            setLoading(false)
        }
    }

    // Al seleccionar un producto, actualizamos el precio y tipo
    const handleProductoChange = (id: string) => {
        setProductoId(id)
        const prod = allProductos.find(p => p.id === id)
        if (prod) {
            setPrecioUnitario(prod.precio_unitario.toString())
            setSelectedTipo(prod.tipo)
        }
    }

    // Función de ayuda para validar números en los inputs
    const handleNumericInput = (value: string, setter: (v: string) => void) => {
        if (value === '' || value === '.' || !isNaN(parseFloat(value))) {
            const formatted = value.replace(/^0+(?=\d)/, '')
            setter(formatted)
        }
    }

    // Función principal para registrar la compra de materiales
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        // Validaciones preventivas
        if (!isQuickAddProduct && !productoId) return
        if (!isQuickAddProvider && !proveedorId) return
        if (isQuickAddProduct && !quickAddProductName) return
        if (isQuickAddProvider && !quickAddProviderName) return

        setSubmitting(true)
        try {
            let finalProductoId = productoId
            let finalProveedorId = proveedorId

            // PASO 1: Crear Producto nuevo si se activó el registro rápido
            if (isQuickAddProduct) {
                const { data: newProd, error: prodErr } = await supabase
                    .from('productos')
                    .insert({
                        nombre: quickAddProductName,
                        tipo: selectedCategory || 'accesorio',
                        precio_unitario: numPrecio,
                        stock: 0,
                        atributos: {}
                    })
                    .select()
                    .single()

                if (prodErr) throw prodErr
                finalProductoId = newProd.id
            }

            // PASO 2: Crear Proveedor nuevo if necesario
            if (isQuickAddProvider) {
                const { data: newProv, error: provErr } = await supabase
                    .from('proveedores')
                    .insert({
                        nombre: quickAddProviderName
                    })
                    .select()
                    .single()

                if (provErr) throw provErr
                finalProveedorId = newProv.id
            }

            // PASO 3: Construir notas de descripción con campos dinámicos
            let finalNotas = notas
            const details = []
            if (colorMarca) details.push(`Color/Marca: ${colorMarca}`)
            if (pulgadas) details.push(`Medidas: ${pulgadas}"`)
            if (kilos) details.push(`Peso: ${kilos}kg`)

            if (details.length > 0) {
                finalNotas = details.join(' | ') + (notas ? ` - ${notas}` : '')
            }

            // PASO 4: Guardar o Actualizar la transacción
            const txData = {
                tipo: 'compra',
                producto_id: finalProductoId,
                proveedor_id: finalProveedorId,
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

                // PASO 5: Actualizar el Stock sumando lo comprado (solo para nuevas compras)
                const targetProdId = isQuickAddProduct ? finalProductoId : productoId
                const prod = allProductos.find(p => p.id === targetProdId)
                const currentStock = prod ? prod.stock : 0

                await supabase
                    .from('productos')
                    .update({ stock: currentStock + numCantidad })
                    .eq('id', targetProdId)
            }

            if (onSuccess) onSuccess()
        } catch (error) {
            console.error('Error registering purchase:', error)
            alert('Error al registrar la compra')
        } finally {
            setSubmitting(false)
        }
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center p-12">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            </div>
        )
    }

    const toggleCategory = (catId: string) => {
        if (selectedCategory === catId) {
            setSelectedCategory('')
        } else {
            setSelectedCategory(catId)
        }
    }

    const currentCategoryName = CATEGORIES.find(c => c.id === selectedCategory)?.name || 'material'
    const hasProductsInCategory = filteredProductos.length > 0

    return (
        <form onSubmit={handleSubmit} className="space-y-8">
            {/* Visual Category Selector */}
            <div className="space-y-3">
                <div className="flex justify-between items-center">
                    <label className="text-sm font-bold text-gray-700 uppercase tracking-wider">
                        1. Elegir Tipo de Material
                    </label>
                    {selectedCategory && (
                        <button
                            type="button"
                            onClick={() => setSelectedCategory('')}
                            className="text-xs text-blue-600 hover:underline font-medium"
                        >
                            Ver todos los productos
                        </button>
                    )}
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                    {CATEGORIES.map((cat) => (
                        <button
                            key={cat.id}
                            type="button"
                            onClick={() => toggleCategory(cat.id)}
                            className={`
                                relative p-4 rounded-xl border-2 transition-all flex flex-col items-center gap-2 group
                                ${selectedCategory === cat.id
                                    ? `${cat.border} ${cat.bg} ring-2 ring-offset-1 ring-blue-500 shadow-md scale-[1.02]`
                                    : 'border-gray-100 bg-white hover:border-gray-300 hover:shadow-md'}
                            `}
                        >
                            <cat.icon className={`h-8 w-8 transition-transform group-hover:scale-110 ${cat.color}`} />
                            <span className={`text-xs font-bold ${selectedCategory === cat.id ? 'text-gray-900' : 'text-gray-500'}`}>
                                {cat.name}
                            </span>
                            {selectedCategory === cat.id && (
                                <div className="absolute top-1 right-1 h-5 w-5 bg-blue-600 rounded-full flex items-center justify-center shadow-sm animate-in zoom-in duration-200">
                                    <Check className="h-3 w-3 text-white" />
                                </div>
                            )}
                        </button>
                    ))}
                </div>
            </div>

            <div className="space-y-6 bg-gray-50 p-6 rounded-2xl border border-gray-100 shadow-inner">
                <label className="text-sm font-bold text-gray-700 uppercase tracking-wider block">
                    2. Detalles de la Compra
                </label>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Material / Producto Dropdown */}
                    <div className="space-y-1">
                        <label className="text-sm font-medium text-gray-700 flex justify-between">
                            <span>Producto / Item Específico</span>
                            <button
                                type="button"
                                onClick={() => {
                                    setIsQuickAddProduct(!isQuickAddProduct)
                                    setProductoId('')
                                }}
                                className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded transition-colors ${isQuickAddProduct ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'}`}
                            >
                                {isQuickAddProduct ? '✕ Cancelar Nuevo' : '+ Crear Nuevo'}
                            </button>
                        </label>

                        {isQuickAddProduct ? (
                            <input
                                type="text"
                                required
                                value={quickAddProductName}
                                onChange={(e) => setQuickAddProductName(e.target.value)}
                                placeholder="Nombre del nuevo producto..."
                                className="w-full p-2.5 border-2 border-blue-500 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white shadow-sm font-bold"
                            />
                        ) : (
                            <select
                                required
                                value={productoId}
                                onChange={(e) => handleProductoChange(e.target.value)}
                                className={`w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 bg-white shadow-sm transition-colors ${!productoId ? 'border-orange-300 bg-orange-50/30' : 'border-gray-300'}`}
                            >
                                <option value="">{selectedCategory ? `Seleccionar ${currentCategoryName.toLowerCase()}...` : 'Haga clic en un icono arriba...'}</option>
                                {filteredProductos.map(p => (
                                    <option key={p.id} value={p.id}>{p.nombre}</option>
                                ))}
                            </select>
                        )}

                        {!hasProductsInCategory && selectedCategory && !isQuickAddProduct && (
                            <div className="flex flex-col gap-2 mt-2">
                                <p className="text-xs text-orange-600 font-medium">
                                    ⚠️ No hay productos registrados como "{currentCategoryName}".
                                </p>
                                <button
                                    type="button"
                                    onClick={() => setIsQuickAddProduct(true)}
                                    className="text-xs bg-orange-100 text-orange-700 p-2 rounded-lg border border-orange-200 hover:bg-orange-200 font-bold transition-colors text-center"
                                >
                                    ¿Crear "{currentCategoryName}" ahora mismo? (Clic aquí)
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Proveedor */}
                    <div className="space-y-1">
                        <label className="text-sm font-medium text-gray-700 flex justify-between">
                            <span>Proveedor</span>
                            <button
                                type="button"
                                onClick={() => {
                                    setIsQuickAddProvider(!isQuickAddProvider)
                                    setProveedorId('')
                                }}
                                className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded transition-colors ${isQuickAddProvider ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'}`}
                            >
                                {isQuickAddProvider ? '✕ Cancelar Nuevo' : '+ Crear Nuevo'}
                            </button>
                        </label>

                        {isQuickAddProvider ? (
                            <input
                                type="text"
                                required
                                value={quickAddProviderName}
                                onChange={(e) => setQuickAddProviderName(e.target.value)}
                                placeholder="Nombre del nuevo proveedor..."
                                className="w-full p-2.5 border-2 border-blue-500 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white shadow-sm font-bold"
                            />
                        ) : (
                            <select
                                required
                                value={proveedorId}
                                onChange={(e) => setProveedorId(e.target.value)}
                                className={`w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 bg-white shadow-sm transition-colors ${!proveedorId ? 'border-orange-300 bg-orange-50/30' : 'border-gray-300'}`}
                            >
                                <option value="">Seleccionar proveedor...</option>
                                {proveedores.map(p => (
                                    <option key={p.id} value={p.id}>{p.nombre}</option>
                                ))}
                            </select>
                        )}
                    </div>

                    {/* Dynamic Fields Section */}
                    {(selectedTipo === 'tela' || selectedTipo === 'madera' || selectedTipo === 'accesorio') && (
                        <div className="space-y-1">
                            <label className="text-sm font-medium text-gray-700">Color / Marca / Detalle</label>
                            <input
                                type="text"
                                value={colorMarca}
                                onChange={(e) => setColorMarca(e.target.value)}
                                placeholder="Ej: Moro, Velvet, Iker..."
                                className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white shadow-sm"
                            />
                        </div>
                    )}

                    {(selectedTipo === 'espuma' || selectedTipo === 'suministro' || selectedTipo === 'plicas' || selectedTipo === 'casco' || selectedTipo === 'madera') && (
                        <div className="space-y-1">
                            <label className="text-sm font-medium text-gray-700">Medida (Pulgadas / Tamaño)</label>
                            <input
                                type="text"
                                value={pulgadas}
                                onChange={(e) => setPulgadas(e.target.value)}
                                placeholder='Ej: 4", 5", 3x3...'
                                className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white shadow-sm"
                            />
                        </div>
                    )}

                    {selectedTipo === 'suministro' && (
                        <div className="space-y-1">
                            <label className="text-sm font-medium text-gray-700">Peso Aproximado (Kilos)</label>
                            <input
                                type="text"
                                value={kilos}
                                onChange={(e) => handleNumericInput(e.target.value, setKilos)}
                                placeholder="0.0"
                                className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white shadow-sm"
                            />
                        </div>
                    )}

                    {/* Cantidad */}
                    <div className="space-y-1">
                        <label className="text-sm font-medium text-gray-700">
                            {selectedTipo === 'tela' ? 'Cantidad de Metros' : 'Cantidad Unidades'}
                        </label>
                        <input
                            type="text"
                            required
                            value={cantidad}
                            onChange={(e) => handleNumericInput(e.target.value, setCantidad)}
                            className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white shadow-sm font-bold"
                        />
                    </div>

                    {/* Precio Unitario */}
                    <div className="space-y-1">
                        <label className="text-sm font-medium text-gray-700 text-blue-700 font-bold">Precio Unitario (S/.)</label>
                        <div className="relative">
                            <span className="absolute left-3 top-2.5 text-blue-400 font-bold">S/</span>
                            <input
                                type="text"
                                required
                                value={precioUnitario}
                                onChange={(e) => handleNumericInput(e.target.value, setPrecioUnitario)}
                                className="w-full pl-8 pr-4 py-2.5 border-2 border-blue-400 bg-white rounded-lg focus:ring-2 focus:ring-blue-500 font-bold text-blue-600 shadow-sm"
                            />
                        </div>
                    </div>

                    {/* Fecha */}
                    <div className="space-y-1">
                        <label className="text-sm font-medium text-gray-700">Fecha de compra</label>
                        <input
                            type="date"
                            required
                            value={fecha}
                            onChange={(e) => setFecha(e.target.value)}
                            className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white shadow-sm"
                        />
                    </div>

                    {/* Total Display */}
                    <div className="flex items-end pb-1">
                        <div className="bg-blue-600 border border-blue-700 rounded-2xl px-6 py-3 w-full flex justify-between items-center text-white shadow-lg shadow-blue-200">
                            <span className="font-bold text-blue-100">TOTAL:</span>
                            <span className="text-3xl font-black">S/. {total.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                        </div>
                    </div>

                    {/* Notas / Descripción */}
                    <div className="md:col-span-2 space-y-1">
                        <label className="text-sm font-medium text-gray-700">Observaciones Adicionales</label>
                        <textarea
                            rows={2}
                            value={notas}
                            onChange={(e) => setNotas(e.target.value)}
                            placeholder="Cualquier otro detalle relevante..."
                            className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white shadow-sm"
                        />
                    </div>
                </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 pt-4 border-t border-gray-100">
                <button
                    type="submit"
                    disabled={submitting}
                    className="flex-[2] bg-blue-600 text-white font-black py-4 rounded-2xl hover:bg-blue-700 transform transition-all active:scale-95 flex flex-col items-center justify-center gap-1 disabled:opacity-50 shadow-xl shadow-blue-200 uppercase tracking-widest text-sm"
                >
                    <div className="flex items-center gap-2">
                        {submitting && <Loader2 className="h-5 w-5 animate-spin" />}
                        {initialData ? 'Confirmar Edición de Compra' : 'Confirmar Registro de Compra'}
                    </div>
                    {(!isQuickAddProduct && !productoId || !isQuickAddProvider && !proveedorId) && (
                        <span className="text-[10px] lowercase font-normal opacity-80">Debe seleccionar (o crear) producto y proveedor</span>
                    )}
                    {(isQuickAddProduct && !quickAddProductName || isQuickAddProvider && !quickAddProviderName) && (
                        <span className="text-[10px] lowercase font-normal opacity-80">Debe escribir el nombre del nuevo item/proveedor</span>
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
