import React, { ComponentType, memo } from 'react'
import { CustomizationContext } from './View.context'
import { CustomWidgetDescriptor, WidgetMeta } from '@tesler-ui/core'

export interface ViewProps {
    widgets: WidgetMeta[]
    skipWidgetTypes?: string[]
    customWidgets?: Record<string, CustomWidgetDescriptor>
    layout: (props: Pick<ViewProps, 'widgets' | 'customWidgets' | 'skipWidgetTypes'>) => React.ReactElement<any>
    customFields?: Record<string, ComponentType<any>>
}
/**
 *
 * @param props
 * @category Components
 */
const View = ({ widgets, skipWidgetTypes, customWidgets, layout: Layout, customFields }: ViewProps) => {
    return (
        <CustomizationContext.Provider value={{ customFields }}>
            <Layout widgets={widgets} customWidgets={customWidgets} skipWidgetTypes={skipWidgetTypes} />
        </CustomizationContext.Provider>
    )
}

/**
 * @category Components
 */
export default memo(View)
