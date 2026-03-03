import { useMemo } from 'react'
import { shallowEqual } from 'react-redux'
import { ExportOptions, exportTable } from '@utils/export'
import { useAppSelector } from '@store'
import { WidgetListField } from '@cxbox-ui/schema'
import { EFeatureSettingKey } from '@interfaces/session'
import { BcFilter } from '@cxbox-ui/core'

interface UseExportButtonProps {
    bcName: string
    fields: WidgetListField[]
    title: string
    exportWithDate?: boolean
}

export const useExportTable = ({ bcName, fields, title, exportWithDate = false }: UseExportButtonProps) => {
    const selectedRows = useAppSelector(state => state.view.selectedRows[bcName])
    const screenName = useAppSelector(state => state.screen.screenName)
    const tableFilters = useAppSelector(state => state.screen.filters[bcName])
    const tableSorters = useAppSelector(state => state.screen.sorters[bcName])
    const widgetData = useAppSelector(state => state.data[bcName])
    const total = useAppSelector(state => state.view.bcRecordsCount[bcName]?.count)
    const appExportExcelLimit = useAppSelector(state =>
        state.session.featureSettings?.find(featureSetting => featureSetting.key === EFeatureSettingKey.appExportExcelLimit)
    )?.value as string

    const filteredFields = useMemo(() => {
        return (fields as WidgetListField[])?.filter(field => !field?.hidden)
    }, [fields])

    const exportOptions: ExportOptions = useAppSelector(state => {
        const bc = bcName ? state.screen.bo.bc[bcName] : undefined

        return {
            page: bc?.page,
            limit: bc?.limit
        }
    }, shallowEqual)

    return {
        exportTable: (forced: Partial<{ total: number; filters: BcFilter[] }> = {}, mode?: 'mass') => {
            return exportTable(
                screenName,
                bcName,
                filteredFields,
                title,
                exportWithDate,
                !!widgetData?.length,
                appExportExcelLimit,
                forced.total ?? total,
                forced.filters ?? tableFilters,
                tableSorters,
                exportOptions,
                undefined,
                selectedRows,
                mode === 'mass'
            )
        }
    }
}
