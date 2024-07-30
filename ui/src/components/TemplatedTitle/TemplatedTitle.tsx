import React, { FunctionComponent, useMemo } from 'react'
import { useAppSelector } from '@store'
import { getWidgetTitle } from './utils'
import { WidgetField } from '@cxbox-ui/schema'

interface TemplatedTitleProps {
    id?: string
    title: string
    widgetName: string
    container?: React.ComponentType<any>
}

export const TemplatedTitle: FunctionComponent<TemplatedTitleProps> = ({ widgetName, title, container: Container, id }) => {
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

    const templatedTitle = useMemo(() => getWidgetTitle(title, dataItem, widgetFields), [dataItem, title, widgetFields])

    if (!title) {
        return null
    }

    if (Container) {
        return <Container title={templatedTitle} />
    }

    return <> {templatedTitle} </>
}

export default TemplatedTitle
