import { useMemo } from 'react'
import { shallowEqual } from 'react-redux'
import { ExportOptions, exportTable } from '@utils/export'
import { useAppSelector } from '@store'
import { WidgetListField } from '@cxbox-ui/schema'

interface UseExportButtonProps {
    bcName: string
    fields: WidgetListField[]
    title: string
    exportWithDate?: boolean
}

export const useExportTable = ({ bcName, fields, title, exportWithDate = false }: UseExportButtonProps) => {
    const screenName = useAppSelector(state => state.screen.screenName)
    const tableFilters = useAppSelector(state => state.screen.filters[bcName])
    const tableSorters = useAppSelector(state => state.screen.sorters[bcName])
    const widgetData = useAppSelector(state => state.data[bcName])

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
