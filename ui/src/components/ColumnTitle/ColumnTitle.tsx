import React from 'react'
import { WidgetListField } from '@cxbox-ui/core/interfaces/widget'
import { RowMetaField } from '@cxbox-ui/core/interfaces/rowMeta'
import { ColumnTitle as CoreColumnTitle } from '@cxbox-ui/core'
import ColumnFilter from './ColumnFilter'

interface ColumnTitleProps {
    widgetName: string
    widgetMeta: WidgetListField
    rowMeta: RowMetaField
}

const ColumnTitle = ({ widgetName, widgetMeta, rowMeta }: ColumnTitleProps) => {
    return <CoreColumnTitle widgetName={widgetName} widgetMeta={widgetMeta} rowMeta={rowMeta} components={{ filter: ColumnFilter }} />
}

export default ColumnTitle
