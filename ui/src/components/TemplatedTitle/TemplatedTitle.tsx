import React, { FunctionComponent } from 'react'
import { useAppSelector } from '@store'
import { WidgetField } from '@cxbox-ui/schema'
import { InnerTemplatedTitle } from '@components/TemplatedTitle/InnerTemplatedTitle'

interface TemplatedTitleProps {
    id?: string
    title: string
    widgetName: string
    container?: React.ComponentType<any>
}

export const TemplatedTitle: FunctionComponent<TemplatedTitleProps> = ({ widgetName, title, container, id }) => {
    const widget = useAppSelector(state => {
        return state.view.widgets.find(item => item.name === widgetName)
    })
    const dataItem = useAppSelector(state => {
        const bcName = widget?.bcName as string
        const bc = bcName ? state.screen.bo.bc[bcName] : undefined
        const cursor = id ?? bc?.cursor
        const bcData = state.data[bcName]

        return bcData?.find(item => item.id === cursor)
    })
    const widgetFields = widget?.fields as WidgetField[] | undefined

    return <InnerTemplatedTitle title={title} dataItem={dataItem} fields={widgetFields} container={container} />
}

export default TemplatedTitle
