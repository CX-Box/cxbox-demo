import React, { FunctionComponent, useMemo } from 'react'
import { getWidgetTitle } from './utils'
import { WidgetField } from '@cxbox-ui/schema'
import { DataItem } from '@cxbox-ui/core'

export interface InnerTemplatedTitleProps {
    title: string
    container?: React.ComponentType<any>
    fields?: WidgetField[] | undefined
    dataItem?: Omit<DataItem, 'vstamp'> | undefined
}

export const InnerTemplatedTitle: FunctionComponent<InnerTemplatedTitleProps> = ({ title, container: Container, fields, dataItem }) => {
    const templatedTitle = useMemo(() => getWidgetTitle(title, dataItem, fields), [dataItem, title, fields])

    if (!title) {
        return null
    }

    if (Container) {
        return <Container title={templatedTitle} />
    }

    return <>{templatedTitle}</>
}
