import moment from 'moment'
import { exportXlsx } from './exportExcel'
import { convertFiltersIntoObject } from './filters'
import { getCurrentDate, getFormattedDateString } from './date'
import { TableWidgetField } from '@interfaces/widget'
import { interfaces } from '@cxbox-ui/core'
import { CxBoxApiInstance } from '../api'
import { lastValueFrom, map } from 'rxjs'
import { buildBcUrl } from '@utils/buildBcUrl'

const { FieldType } = interfaces

export type ExportOptions = { page?: number; limit?: number }

export function getPaginationParamsForExportTable(pageLimit: number, currentPage: number) {
    const maxTableLimit = 500 + pageLimit
    const currentPositionForFirstRecordOnPage = (currentPage - 1) * pageLimit + 1

    return {
        _limit: maxTableLimit,
        _page: Math.ceil(currentPositionForFirstRecordOnPage / maxTableLimit)
    }
}

export async function exportTable(
    screenName: string,
    bcName: string,
    fieldsMeta: TableWidgetField[],
    fileName: string,
    withDate: boolean,
    hasData: boolean,
    filters?: interfaces.BcFilter[],
    sorters?: interfaces.BcSorter[],
    { page = 1, limit = 5 }: ExportOptions = {},
    exportType: string = 'excel'
) {
    const url = buildBcUrl(bcName)
    const filtersObj: Record<string, string> = convertFiltersIntoObject(filters)
    const sortersObj: Record<string, string> = {}
    const currentDate = withDate ? moment().format('DD.MM.YYYY HH:mm') : undefined

    sorters?.forEach((sorter, idx) => {
        const fieldString = `_sort.${idx}.${sorter.direction}`
        sortersObj[fieldString] = sorter.fieldName
    })

    let fullData: interfaces.DataItem[] = []

    if (hasData) {
        const resultData = await lastValueFrom(
            CxBoxApiInstance.fetchBcData(screenName, url, {
                ...filtersObj,
                ...sortersObj,
                _export: 'Excel',
                ...getPaginationParamsForExportTable(limit, page)
            }).pipe(map(response => response.data))
        )
        if (resultData) {
            fullData = resultData
        }
    }
    const parsedData = fullData
    const filteredFieldsMeta = filterFieldsMeta(fieldsMeta)
    const keys: string[] = getKeyArray(filteredFieldsMeta)
    const dateFileName = fileName + ' ' + getCurrentDate()
    switch (exportType) {
        case 'excel': {
            return exportXlsx(parsedData, filteredFieldsMeta, fieldsMeta, keys, dateFileName, bcName, currentDate)
        }
        default: {
            return null
        }
    }
}
/**
 * Converts values before sending to excel:
 */
export function valueMapper(value: interfaces.DataValue, isExcel: boolean, fieldMeta?: TableWidgetField) {
    let result: any

    switch (fieldMeta?.type) {
        case FieldType.checkbox: {
            result = value ? 'Yes' : 'No'
            break
        }
        case FieldType.date:
        case FieldType.dateTime:
        case FieldType.dateTimeWithSeconds:
            const date = value ? new Date(value as string) : null
            result = date && !isExcel ? getFormattedDateString(value as string, fieldMeta.type, true) : date
            break
        case FieldType.percent:
            result = (value as number) / 100
            break
        case FieldType.multivalue:
            result = Array.isArray(value) ? (value as interfaces.MultivalueSingleValue[]).map(mvValue => mvValue.value).join(', ') : null
            break
        default: {
            result = typeof value !== 'object' ? value : null
        }
    }

    if (Number.isNaN(result) || result === undefined || result === null) {
        return
    }
    return isExcel ? result : '' + result
}

export function filterFieldsMeta(fieldsMeta: TableWidgetField[]) {
    return fieldsMeta.reduce<TableWidgetField[]>((result, fieldMeta) => {
        if (!fieldMeta.hidden && fieldMeta.type !== FieldType.hidden) {
            return [...result, fieldMeta]
        }

        return result
    }, [])
}
export function getKeyArray(filteredFieldsMeta: TableWidgetField[]) {
    const keys: string[] = []

    filteredFieldsMeta.forEach((item: { title?: string; key: string; type: string }) => {
        keys.push(item.key)
    })

    return keys
}
