import { useMemo } from 'react'
import { shallowEqual } from 'react-redux'
import { ExportOptions, exportTable } from '@utils/export'
import { AppWidgetMeta } from '@interfaces/widget'
import { useAppSelector } from '@store'
import { WidgetMeta } from '@interfaces/core'
import { WidgetListField } from '@cxbox-ui/schema'

interface UseExportButtonProps {
    widget: WidgetMeta
    exportWithDate?: boolean
}

export const useExportTable = ({ widget, exportWithDate = false }: UseExportButtonProps) => {
    const screenName = useAppSelector(state => state.screen.screenName)
    const { bcName } = widget
    const tableFilters = useAppSelector(state => state.screen.filters[bcName])
    const tableSorters = useAppSelector(state => state.screen.sorters[bcName])
    const widgetData = useAppSelector(state => state.data[bcName])
    const exportConfig = (widget as AppWidgetMeta).options?.export
    const showExport = exportConfig?.enabled
    const title = exportConfig?.title ?? widget.title
    const filteredFields = useMemo(() => {
        return (widget.fields as WidgetListField[])?.filter(field => !field?.hidden)
    }, [widget.fields])
    const exportOptions: ExportOptions = useAppSelector(state => {
        const bc = state.screen.bo.bc[bcName]

        return {
            page: bc?.page,
            limit: bc?.limit
        }
    }, shallowEqual)

    return {
        showExport,
        exportTable: () => {
            return exportTable(
                screenName,
                bcName,
                filteredFields,
                title,
                exportWithDate,
                !!widgetData?.length,
                tableFilters,
                tableSorters,
                exportOptions
            )
        }
    }
}
