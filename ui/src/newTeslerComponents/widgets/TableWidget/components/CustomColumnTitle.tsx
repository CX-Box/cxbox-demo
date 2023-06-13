import React from 'react'
import { TableWidgetProps } from '../TableWidget'
import ColumnTitle from '../../../ColumnTitle/ColumnTitle'
import { RowMetaField, WidgetListField } from '@cxbox-ui/core'

interface CustomColumnTitleProps extends Pick<TableWidgetProps, 'columnTitleComponent'> {
    widgetName: string
    fieldMeta: WidgetListField
    fieldRowMeta: RowMetaField
}

function CustomColumnTitle({ columnTitleComponent, fieldMeta, fieldRowMeta, widgetName }: CustomColumnTitleProps) {
    return columnTitleComponent ? (
        columnTitleComponent({ widgetName, widgetMeta: fieldMeta, rowMeta: fieldRowMeta })
    ) : (
        <ColumnTitle widgetName={widgetName} widgetMeta={fieldMeta} rowMeta={fieldRowMeta} />
    )
}

export default React.memo(CustomColumnTitle)
