import { CellValue, Worksheet } from 'exceljs'
import { getFileExtension } from '@components/Operations/components/FileUpload/FileUpload.utils'
// import Papa from 'papaparse'

export function findColumnIndexByRow(worksheet: Worksheet, text: string, rowIndex: number = 1) {
    const row = worksheet.getRow(rowIndex)

    let columnIndex

    row.eachCell((cell, colIndex) => {
        if (cell.value === text && colIndex) {
            columnIndex = colIndex
        }
    })

    return columnIndex
}

export function findColumn(worksheet: Worksheet, text: string, rowIndex: number = 1) {
    const columnIndex = findColumnIndexByRow(worksheet, text, rowIndex)

    if (columnIndex) {
        return worksheet.getColumn(columnIndex)
    }

    return
}

export function getColumnValuesByHeader(worksheet: Worksheet, text: string) {
    const column = findColumn(worksheet, text, 1)
    const values: CellValue[] = []

    if (column) {
        column.eachCell((cell, columnIndex) => {
            if (columnIndex > 1) {
                values.push(cell.value)
            }
        })

        return values
    }

    return
}

const getColumnValuesByHeaderFromExcel = (file: File, text: string): Promise<CellValue[] | undefined> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader()

        reader.onload = e => {
            import('exceljs').then(async ExcelJS => {
                const arrayBuffer = e.target?.result
                const data = arrayBuffer instanceof ArrayBuffer ? new Uint8Array(arrayBuffer) : undefined

                if (data) {
                    try {
                        const workbook = new ExcelJS.Workbook()
                        await workbook.xlsx.load(data)

                        const firstSheet = workbook.getWorksheet(1)
                        const values = getColumnValuesByHeader(firstSheet, text)

                        resolve(values)
                    } catch (error) {
                        reject(error)
                    }
                }

                reject('Failed to read file as ArrayBuffer')
            })
        }

        reader.onerror = error => {
            reject(error)
        }

        reader.readAsArrayBuffer(file)
    })
}
// CSV files may use different encoding, but function currently only works with utf-8
// const getColumnValuesByHeaderFromCSV = (file: File, text: string): Promise<unknown[] | undefined> => {
//     return new Promise((resolve, reject) => {
//         const reader = new FileReader()
//
//         reader.onload = () => {
//             try {
//                 const arrayBuffer = reader.result instanceof ArrayBuffer ? reader.result : undefined
//                 const decoder = new TextDecoder('utf-8')
//                 const csvData = decoder.decode(arrayBuffer)
//                 const parsedData = Papa.parse(csvData, { header: true, delimiter: ';' })
//
//                 const column = parsedData.data.map(row => row[text])
//
//                 resolve(column)
//             } catch (error) {
//                 reject(error)
//             }
//         }
//
//         reader.onerror = error => {
//             reject(error)
//         }
//
//         reader.readAsArrayBuffer(file)
//     })
// }

export const AVAILABLE_FILE_EXTENSIONS = ['.xlsx'] as const

type AvailableFileExtensions = (typeof AVAILABLE_FILE_EXTENSIONS)[number]

export const getColumnValuesByHeaderFromFile = async (file: File, text: string) => {
    const extension = getFileExtension(file.name).toLowerCase() as AvailableFileExtensions

    if (!AVAILABLE_FILE_EXTENSIONS.includes(extension)) {
        throw new Error(`Unsupported file extension "${extension}"`)
    }

    // if (extension === ('.csv' as AvailableFileExtensions)) {
    //     return getColumnValuesByHeaderFromCSV(file, text)
    // }

    if (extension === '.xlsx') {
        return getColumnValuesByHeaderFromExcel(file, text)
    }
}
