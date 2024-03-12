import React, { FunctionComponent } from 'react'
import { connect } from 'react-redux'
import DashboardLayout from '@cxboxComponents/ui/DashboardLayout/DashboardLayout'
import ViewInfoLabel from '@cxboxComponents/DebugPanel/components/ViewInfoLabel'
import DebugPanel from '@cxboxComponents/DebugPanel/DebugPanel'
import { RootState } from '@store'
import { interfaces } from '@cxbox-ui/core'

const { PopupWidgetTypes } = interfaces

export interface ViewProps {
    debugMode?: boolean
    widgets: interfaces.WidgetMeta[]
    skipWidgetTypes?: string[]
    card?: (props: any) => React.ReactElement<any>
    customSpinner?: (props: any) => React.ReactElement<any>
    customWidgets?: Record<string, interfaces.CustomWidgetDescriptor>
    customLayout?: (props: any) => React.ReactElement<any>
    customFields?: Record<string, interfaces.CustomWidget>
    disableDebugMode?: boolean
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
    const { debugMode, widgets, skipWidgetTypes, card, customSpinner, customWidgets, customLayout, customFields, disableDebugMode } = props
    let layout: React.ReactNode = null
    if (customLayout) {
        const CustomLayout = customLayout

        layout = (
            <CustomLayout
                customSpinner={customSpinner}
                widgets={widgets}
                customWidgets={customWidgets}
                card={card}
                skipWidgetTypes={skipWidgetTypes}
                disableDebugMode={disableDebugMode}
            />
        )
    } else {
        layout = (
            <DashboardLayout
                customSpinner={customSpinner}
                widgets={widgets}
                customWidgets={customWidgets}
                card={card}
                skipWidgetTypes={skipWidgetTypes}
                disableDebugMode={disableDebugMode}
            />
        )
    }

    return (
        <CustomizationContext.Provider value={{ customFields: customFields as Record<string, interfaces.CustomWidget> }}>
            {!disableDebugMode && debugMode && <ViewInfoLabel />}
            {layout}
            {!disableDebugMode &&
                debugMode &&
                widgets.filter(i => PopupWidgetTypes.includes(i.type)).map(i => <DebugPanel key={i.name} widgetMeta={i} />)}
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
