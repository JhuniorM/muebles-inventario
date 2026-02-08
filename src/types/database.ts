// Definición de roles permitidos en el sistema
export type ProfileRole = 'admin' | 'vendedor' | 'inventario'

// Interfaz para el perfil de usuario (Vinculado a la tabla 'perfiles')
export interface Profile {
    id: string
    nombre_completo: string | null
    rol: ProfileRole | null
    telefono: string | null
    email: string | null
    activo: boolean
    ultima_sesion: string | null
    created_at: string
    updated_at: string
}

// Interfaz para Clientes
export interface Cliente {
    id: string
    nombre: string
    contacto: string | null
    telefono: string | null
    email: string | null
    created_at: string
    updated_at: string
}

// Interfaz para Proveedores de materiales
export interface Proveedor {
    id: string
    nombre: string
    contacto: string | null
    telefono: string | null
    email: string | null
    created_at: string
    updated_at: string
}

// Tipos de productos permitidos
export type ProductoTipo = 'mueble' | 'tela' | 'espuma' | 'accesorio' | 'suministro' | 'madera' | 'casco' | 'plicas'

// Interfaz para Productos e Inventario
export interface Producto {
    id: string
    tipo: ProductoTipo
    nombre: string
    descripcion: string | null
    precio_unitario: number
    stock: number // Cantidad actual disponible
    atributos: any // Datos adicionales específicos según el tipo
    created_at: string
    updated_at: string
}

// Tipos de movimientos de inventario
export type TransaccionTipo = 'venta' | 'compra'

// Interfaz para Transacciones (Ventas y Compras)
export interface Transaccion {
    id: string
    tipo: TransaccionTipo
    producto_id: string
    cliente_id: string | null
    proveedor_id: string | null
    cantidad: number
    precio_unitario: number
    total: number
    fecha: string
    notas: string | null
    created_at: string
}

// Interfaz para Reportes de resumen mensual
export interface ReporteMensual {
    id: string
    mes: number
    año: number
    total_ventas: number
    total_compras: number
    ganancia_neta: number
    muebles_vendidos: number
    tela_vendida_metros: number
    transacciones_count: number
    created_at: string
    updated_at: string
}
