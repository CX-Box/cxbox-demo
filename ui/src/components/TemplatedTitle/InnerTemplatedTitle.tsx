import React, { FunctionComponent, useMemo } from 'react'
import { getWidgetTitle } from './utils'
import { WidgetField } from '@cxbox-ui/schema'
import { DataItem } from '@cxbox-ui/core'

export interface InnerTemplatedTitleProps {
    title: string
    className?: string
    fields?: WidgetField[] | undefined
    dataItem?: Omit<DataItem, 'vstamp'> | undefined
}

export const InnerTemplatedTitle: FunctionComponent<InnerTemplatedTitleProps> = ({ className, title, fields, dataItem }) => {
    const templatedTitle = useMemo(() => getWidgetTitle(title, dataItem, fields), [dataItem, title, fields])

    if (!title) {
        return null
    }

    return <span className={className}>{templatedTitle}</span>
}
