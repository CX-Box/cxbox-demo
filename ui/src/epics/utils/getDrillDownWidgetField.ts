import { WidgetFieldBase } from '@cxbox-ui/schema'
import { RootState } from '@store'

/**
 * Field description in the clicked widget: widgets of one business component may have their own drillDownKey.
 * Without such a widget (no widget name, a nested business component of a hierarchy) the first widget
 * of the business component is used, as before.
 */
const getDrillDownWidgetField = (state: RootState, widgetName: string, bcName: string, fieldKey: string) => {
    const widget =
        state.view.widgets.find(item => item.name === widgetName && item.bcName === bcName) ??
        state.view.widgets.find(item => item.bcName === bcName)

    return widget?.fields.find((field: any) => field.key === fieldKey) as WidgetFieldBase | undefined
}

export default getDrillDownWidgetField
