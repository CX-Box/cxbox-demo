import React, { useMemo } from 'react'
import { shallowEqual } from 'react-redux'
import { ExportOptions, exportTable } from '@utils/export'
import Button from '../../../ui/Button/Button'
import { AppWidgetMeta } from '@interfaces/widget'
import { interfaces } from '@cxbox-ui/core'
import { useAppSelector } from '@store'

interface ExportButtonProps {
    widgetMeta: interfaces.WidgetMeta
    exportWithDate?: boolean
}

export const ExportButton: React.FC<ExportButtonProps> = ({ widgetMeta, exportWithDate = false }) => {
    const screenName = useAppSelector(state => state.screen.screenName)
    const { bcName } = widgetMeta
    const tableFilters = useAppSelector(state => state.screen.filters[bcName])
    const tableSorters = useAppSelector(state => state.screen.sorters[bcName])
    const widgetData = useAppSelector(state => state.data[bcName])
    const exportConfig = (widgetMeta as AppWidgetMeta).options?.export
    const showExport = exportConfig?.enabled
    const title = exportConfig?.title ?? widgetMeta.title
    const filteredFields = useMemo(() => {
        return (widgetMeta.fields as interfaces.WidgetListField[])?.filter(field => !field?.hidden)
    }, [widgetMeta.fields])
    const exportOptions: ExportOptions = useAppSelector(state => {
        const bc = state.screen.bo.bc[bcName]

        return {
            page: bc?.page,
            limit: bc?.limit
        }
    }, shallowEqual)

    const handleClick = () => {
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

    return showExport ? (
        <Button data-test-widget-action-item={true} type="formOperation" icon="file-excel" onClick={handleClick}>
            Excel
        </Button>
    ) : null
}
