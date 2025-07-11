import FileSaver from 'file-saver'
import { valueMapper } from './export'
import { Alignment, Borders, Fill, Workbook, Worksheet } from 'exceljs'
import { DateFormat } from '@interfaces/date'
import { TableWidgetField } from '@interfaces/widget'
import { interfaces } from '@cxbox-ui/core'

const maxDigitWidthPx = 7 // Calibri 11 point font

// Cell formats in Excel
const excelFormatText = '@'
const excelFormatPercent = '0%'

const cellBorder = {
    top: { style: 'thin' },
    left: { style: 'thin' },
    bottom: { style: 'thin' },
    right: { style: 'thin' }
}

export const exportXlsx = (
    columns: interfaces.DataItem[],
    filteredFieldsMeta: TableWidgetField[],
    keys: string[],
    fileName: string,
    bcName: string,
    currentDate?: string,
    reuseWorkbook?: Workbook,
    sheetName?: string
) => {
    return import('exceljs').then(Excel => {
        const workbook1 = reuseWorkbook || new Excel.Workbook()
        // Default sheet name, because a long name leads to errors when opening the table in native Excel
        const sheet = workbook1.addWorksheet(sheetName || 'Sheet1')
        setColumnWidths(sheet, filteredFieldsMeta)

        const headerRowIndex = buildHeader(sheet, filteredFieldsMeta, columns, currentDate)

        columns.forEach(item => {
            let col = 0
            const row = []
            for (const key of keys) {
                row[col] = valueMapper(
                    item[key],
                    true,
                    filteredFieldsMeta.find((field: TableWidgetField) => field.key === key)
                )
                col++
            }
            sheet.addRow(row)
        })
        setStyles(sheet, filteredFieldsMeta, columns, headerRowIndex)
        buildFooter(sheet)

        if (reuseWorkbook) {
            return workbook1
        }

        !reuseWorkbook &&
            workbook1.xlsx.writeBuffer().then(buffer => {
                const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
                FileSaver.saveAs(blob, `${fileName}.xlsx`)
            })
    })
}

/**
 * Sets the width of columns
 * Excel does not store the width in pixels, but in the number of characters of the widest digit of the font used
 * The formula is given in ECMA-376, Fifth Edition Part 1 page 1601-1602
 * If the width in pixels doesn't come in (like on pivots), then just by the length of the header
 */
function setColumnWidths(sheet: Worksheet, columns: TableWidgetField[]) {
    sheet.columns = columns.map(column => {
        const widthPx = column.excelWidth

        const width = widthPx
            ? (((widthPx - 5) / maxDigitWidthPx) * 100 + 0.5) / 100
            : column.title
            ? Math.max(column.title.length + 2, 12)
            : 12
        return { id: column.key, width }
    })
}

const { FieldType } = interfaces

/**
 * Inserts a cap into the sheet: top stamp, column groups, columns
 *
 * @param sheet
 * @param filteredFieldsMeta
 * @param data
 * @param currentDate
 */
function buildHeader(sheet: Worksheet, filteredFieldsMeta: TableWidgetField[], data: interfaces.DataItem[], currentDate?: string) {
    if (currentDate) {
        const mergeLength = filteredFieldsMeta.length ? filteredFieldsMeta.length : 1
        const rowIndex = 2
        sheet.addRow([`Date of upload: ${currentDate}`])
        sheet.mergeCells(rowIndex, 1, rowIndex, mergeLength)
        sheet.getRow(rowIndex).getCell(1).alignment = {
            wrapText: true,
            horizontal: 'right'
        }
    }
    const headers: string[] = filteredFieldsMeta.map(column => column.title || '')
    sheet.addRow(headers)
    const headerFont = { bold: true }
    const headerRowIndex = sheet.rowCount
    headers.forEach((item, index) => {
        const cell = sheet.getRow(headerRowIndex).getCell(index + 1)
        const value = cell.value
        cell.value = value
        cell.alignment = { vertical: 'middle', horizontal: 'center' }
        cell.font = headerFont
        cell.border = cellBorder as Partial<Borders>
    })

    return sheet.rowCount
}

function buildFooter(sheet: Worksheet) {
    return sheet.rowCount
}

function setStyles(
    sheet: Worksheet, // Excel.Worksheet
    fieldsMeta: TableWidgetField[],
    items: interfaces.DataItem[],
    offset: number
) {
    const alignment = {
        vertical: 'middle',
        horizontal: 'center',
        wrapText: true
    }
    fieldsMeta.forEach((meta, index) => {
        const numberFormat = getNumberFormat(meta.type)
        items.forEach((item, rowIndex) => {
            const cell = sheet.getCell(offset + rowIndex + 1, index + 1)
            const currentFormat = item.type ? getNumberFormat(item.type as interfaces.FieldType) : numberFormat
            cell.numFmt = currentFormat
            cell.alignment = alignment as Partial<Alignment>
            cell.border = cellBorder as Partial<Borders>
            const bgColor = ((meta.bgColorKey && item[meta.bgColorKey]) || meta.bgColor) as string
            const argb = getColor(bgColor)
            const fill = {
                type: 'pattern',
                pattern: 'solid',
                fgColor: { argb }
            }
            if (bgColor) {
                cell.fill = fill as Fill
            }
        })
    })
}

/**
 * Sets the format of numeric fields (and dates, which can be stored as numbers in Excel)
 */
function getNumberFormat(type: interfaces.FieldType) {
    switch (type) {
        case FieldType.date: {
            return DateFormat.outputDateFormat
        }
        case FieldType.dateTime: {
            return DateFormat.outputDateTimeFormat
        }
        case FieldType.dateTimeWithSeconds: {
            return DateFormat.outputDateTimeWithSecondsFormat
        }
        case FieldType.input: {
            return excelFormatText
        }
        case FieldType.percent: {
            return excelFormatPercent
        }
        default: {
            return ''
        }
    }
}

/**
 * Converts a string with CSS color to a string to pass to the argb property of exceljs
 *
 * Supported input formats:
 * `#RRGGBB`
 * `#RRGGBBAA`
 * `rgb(r, g, b)`
 * `rgb(r, g, b, a)`
 *
 * @param color String with color from field description in widget meta
 */
function getColor(color: string) {
    if (color?.startsWith('rgb')) {
        const rgba: string[] = color
            .split('(')[1]
            .split(')')[0]
            .split(',')
            .map(item => Number.parseInt(item, 10).toString(16))
        const [red, green, blue, alpha] = rgba
        return `${alpha || 'FF'}${red}${green}${blue}`
    }
    if (color?.startsWith('#')) {
        const hex = color.substr(1)
        const rgb = hex.substr(0, 6)
        const alpha = hex.substr(6) || 'FF'
        return `${alpha}${rgb}`
    }
    return color
}
