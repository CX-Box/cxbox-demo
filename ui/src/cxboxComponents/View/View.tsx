import React, { FunctionComponent } from 'react'
import { connect } from 'react-redux'
import { RootState } from '@store'
import { interfaces } from '@cxbox-ui/core'

export interface ViewProps {
    debugMode?: boolean
    widgets: interfaces.WidgetMeta[]
    skipWidgetTypes?: string[]
    card?: (props: any) => React.ReactElement<any>
    customSpinner?: (props: any) => React.ReactElement<any>
    customWidgets?: Record<string, interfaces.CustomWidgetDescriptor>
    customLayout: (props: any) => React.ReactElement<any>
    customFields?: Record<string, interfaces.CustomWidget>
}

export const CustomizationContext: React.Context<{
    customFields: Record<string, interfaces.CustomWidget>
}> = React.createContext({
    customFields: {}
})

/**
 *
 * @param props
 * @category Components
 */
export const View: FunctionComponent<ViewProps> = props => {
    const { widgets, skipWidgetTypes, card, customSpinner, customWidgets, customLayout: CustomLayout, customFields } = props
    const layout = (
        <CustomLayout
            customSpinner={customSpinner}
            widgets={widgets}
            customWidgets={customWidgets}
            card={card}
            skipWidgetTypes={skipWidgetTypes}
        />
    )

    return (
        <CustomizationContext.Provider value={{ customFields: customFields as Record<string, interfaces.CustomWidget> }}>
            {layout}
        </CustomizationContext.Provider>
    )
}

function mapStateToProps(state: RootState) {
    return {
        debugMode: state.session.debugMode,
        widgets: state.view.widgets
    }
}

/**
 * @category Components
 */
const ConnectedView = connect(mapStateToProps)(View)

export default ConnectedView
