import React, { useMemo } from 'react'
import { shallowEqual, useSelector } from 'react-redux'
import { AppState } from '../../../../interfaces/storeSlices'
import { WidgetListField, WidgetMeta } from '@cxbox-ui/core/interfaces/widget'
import { ExportOptions, exportTable } from '../../../../utils/export'
import Button from '../../../ui/Button/Button'
import { AppWidgetMeta } from '../../../../interfaces/widget'

interface ExportButtonProps {
    widgetMeta: WidgetMeta
    exportWithDate?: boolean
}

export const ExportButton: React.FC<ExportButtonProps> = ({ widgetMeta, exportWithDate = false }) => {
    const screenName = useSelector((store: AppState) => store.screen.screenName)
    const { bcName } = widgetMeta
    const tableFilters = useSelector((state: AppState) => state.screen.filters[bcName])
    const tableSorters = useSelector((state: AppState) => state.screen.sorters[bcName])
    const widgetData = useSelector((state: AppState) => state.data[bcName])
    const exportConfig = (widgetMeta as AppWidgetMeta).options?.export
    const showExport = exportConfig?.enabled
    const title = exportConfig?.title ?? widgetMeta.title
    const filteredFields = useMemo(() => {
        return (widgetMeta.fields as WidgetListField[])?.filter(field => !field?.hidden)
    }, [widgetMeta.fields])
    const exportOptions: ExportOptions = useSelector((state: AppState) => {
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
