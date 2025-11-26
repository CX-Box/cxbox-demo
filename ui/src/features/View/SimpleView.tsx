import React, { FunctionComponent } from 'react'
import { useAppSelector } from '@store'
import { CustomWidget, CustomWidgetDescriptor } from '@cxbox-ui/core'

export interface ViewProps {
    skipWidgetTypes?: string[]
    card?: (props: any) => React.ReactElement<any>
    customSpinner?: (props: any) => React.ReactElement<any>
    customWidgets?: Record<string, CustomWidgetDescriptor>
    customLayout: (props: any) => React.ReactElement<any>
    customFields?: Record<string, CustomWidget>
}

export const CustomizationContext: React.Context<{
    customFields: Record<string, CustomWidget>
}> = React.createContext({
    customFields: {}
})

export const SimpleView: FunctionComponent<ViewProps> = ({
    skipWidgetTypes,
    card,
    customSpinner,
    customWidgets,
    customLayout: CustomLayout,
    customFields
}) => {
    const widgets = useAppSelector(state => state.view.widgets)

    return (
        <CustomizationContext.Provider value={{ customFields: customFields as Record<string, CustomWidget> }}>
            <CustomLayout
                customSpinner={customSpinner}
                widgets={widgets}
                customWidgets={customWidgets}
                card={card}
                skipWidgetTypes={skipWidgetTypes}
            />
        </CustomizationContext.Provider>
    )
}

export default React.memo(SimpleView)
