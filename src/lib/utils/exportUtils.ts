import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import * as XLSX from 'xlsx'

interface ReportData {
    mes: string
    año: number
    ventas: string
    compras: string
    ganancia: string
    transacciones: number
}

/**
 * Genera un archivo PDF profesional con la tabla de reportes
 */
export const exportToPDF = (data: ReportData[], businessName: string = 'Muebles & Estilos') => {
    const doc = new jsPDF()

    // Encabezado
    doc.setFontSize(20)
    doc.setTextColor(37, 99, 235) // Azul principal
    doc.text('Reporte Mensual de Inventario', 14, 22)

    doc.setFontSize(10)
    doc.setTextColor(100)
    doc.text(`Empresa: ${businessName}`, 14, 30)
    doc.text(`Fecha de generación: ${new Date().toLocaleString('es-PE')}`, 14, 35)

    // Tabla de datos
    const tableColumn = ["Mes / Año", "Ventas", "Compras", "Ganancia Neta", "Transacciones"]
    const tableRows = data.map(item => [
        `${item.mes} ${item.año}`,
        item.ventas,
        item.compras,
        item.ganancia,
        item.transacciones
    ])

    // Generar tabla usando la función autoTable directamente
    autoTable(doc, {
        head: [tableColumn],
        body: tableRows,
        startY: 45,
        theme: 'striped',
        headStyles: { fillColor: [37, 99, 235], textColor: [255, 255, 255], fontStyle: 'bold' },
        styles: { fontSize: 9, cellPadding: 3 },
        columnStyles: {
            1: { halign: 'right' },
            2: { halign: 'right' },
            3: { halign: 'right' },
            4: { halign: 'center' }
        }
    })

    doc.save(`reporte_inventario_${Date.now()}.pdf`)
}

/**
 * Genera un archivo Excel (.xlsx) con los datos del reporte
 */
export const exportToExcel = (data: ReportData[]) => {
    // Preparar los datos para Excel (aplanar el formato si es necesario)
    const excelData = data.map(item => ({
        'Mes': item.mes,
        'Año': item.año,
        'Ventas (S/.)': item.ventas.replace('S/. ', '').replace(',', ''),
        'Compras (S/.)': item.compras.replace('S/. ', '').replace(',', ''),
        'Ganancia Neta (S/.)': item.ganancia.replace('S/. ', '').replace(',', ''),
        'Total Transacciones': item.transacciones
    }))

    const worksheet = XLSX.utils.json_to_sheet(excelData)
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, "Reporte Mensual")

    // Ajustar ancho de columnas automáticamente
    const maxWidths = Object.keys(excelData[0] || {}).map(() => ({ wch: 20 }))
    worksheet['!cols'] = maxWidths

    XLSX.writeFile(workbook, `reporte_inventario_${Date.now()}.xlsx`)
}
