import moment from 'moment'
import { lastValueFrom, map } from 'rxjs'
import { t } from 'i18next'
import { exportXlsx } from './exportExcel'
import { convertFiltersIntoObject } from './filters'
import { getCurrentDate, getFormattedDateString } from './date'
import { CxBoxApiInstance } from '../api'
import { buildBcUrl } from '@utils/buildBcUrl'
import { openNotification } from '@components/NotificationsContainer/utils'
import { defaultExcelLimit, maxExcelLimit } from '@constants/export'
import { TableWidgetField } from '@interfaces/widget'
import { BcFilter, BcSorter, DataItem, DataValue, FieldType, MultivalueSingleValue } from '@cxbox-ui/core'
import { FIELDS } from '@constants'

export type ExportOptions = { page?: number; limit?: number }

export function getPaginationParamsForExportTable(appExportExcelLimit: string, pageLimit: number, currentPage: number) {
    let excelLimit

    if (appExportExcelLimit) {
        excelLimit = Number(appExportExcelLimit)

        if (excelLimit > maxExcelLimit) {
            excelLimit = maxExcelLimit
            console.error(
                `appExportExcelLimit: ${appExportExcelLimit} exceeds the maximum limit of ${maxExcelLimit}, the limit is set to ${maxExcelLimit}`
            )
        }
    }

    const maxTableLimit = (excelLimit ?? defaultExcelLimit) + pageLimit
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
    appExportExcelLimit: string,
    total: number,
    filters?: BcFilter[],
    sorters?: BcSorter[],
    { page = 1, limit = 5 }: ExportOptions = {},
    exportType: string = 'excel',
    selectedRows: Omit<DataItem, 'vstamp'>[] = [],
    massMode: boolean = false
) {
    const url = buildBcUrl(bcName)
    const filtersObj: Record<string, string> = convertFiltersIntoObject(filters)
    const sortersObj: Record<string, string> = {}
    const currentDate = withDate ? moment().format('DD.MM.YYYY HH:mm') : undefined

    sorters?.forEach((sorter, idx) => {
        const fieldString = `_sort.${idx}.${sorter.direction}`
        sortersObj[fieldString] = sorter.fieldName
    })

    let fullData: DataItem[] = []

    if (hasData) {
        const resultData = await lastValueFrom(
            CxBoxApiInstance.fetchBcData(screenName, url, {
                ...filtersObj,
                ...sortersObj,
                _export: 'Excel',
                ...getPaginationParamsForExportTable(appExportExcelLimit, limit, page)
            }).pipe(map(response => response.data))
        )
        if (resultData) {
            fullData = resultData
        }
    }
    let parsedData = fullData

    if (parsedData?.length < total) {
        openNotification({
            type: 'warning',
            message: t('The table contains a large amount of data - only the first rows are presented in the report', {
                limit: parsedData.length
            })
        })
    }

    const filteredFieldsMetaWithId = filterFieldsMeta(fieldsMeta)

    if (massMode) {
        filteredFieldsMetaWithId.push({
            key: FIELDS.MASS_OPERATION.ERROR_MESSAGE,
            type: FieldType.input,
            title: t('Errors')
        })

        const selectedRowsDictionary: Record<string, Omit<DataItem, 'vstamp'>> = {}

        selectedRows.forEach(row => {
            selectedRowsDictionary[row.id as string] = row
        })

        parsedData = parsedData.map(item => ({ ...item, ...selectedRowsDictionary[item.id] }))
    }

    filteredFieldsMetaWithId.push({ key: FIELDS.TECHNICAL.ID, type: FieldType.input, title: FIELDS.TECHNICAL.ID, excelWidth: 5 })

    const keys: string[] = getKeyArray(filteredFieldsMetaWithId)
    const dateFileName = fileName + ' ' + getCurrentDate()
    switch (exportType) {
        case 'excel': {
            return exportXlsx(parsedData, filteredFieldsMetaWithId, keys, dateFileName, bcName, currentDate)
        }
        default: {
            return null
        }
    }
}
/**
 * Converts values before sending to excel:
 */
export function valueMapper(value: DataValue, isExcel: boolean, fieldMeta?: TableWidgetField) {
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
            result = Array.isArray(value) ? (value as MultivalueSingleValue[]).map(mvValue => mvValue.value).join(', ') : null
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
