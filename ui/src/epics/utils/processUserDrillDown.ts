import { concat, EMPTY, of } from 'rxjs'
import { DrillDownType, RowMeta } from '@cxbox-ui/core'
import { actions } from '@actions'
import { RootState } from '@store'
import getDrillDownWidgetField from './getDrillDownWidgetField'

/**
 * processUserDrillDown of the core, but drillDownKey comes from the clicked widget.
 */
const processUserDrillDown = (
    state: RootState,
    rowMeta: RowMeta,
    widgetName: string,
    fieldKey: string,
    cursor: string,
    bcName: string,
    bcUrl: string,
    fetchedRowMeta?: boolean
) => {
    const drillDownField = rowMeta.fields.find(field => field.key === fieldKey)
    const route = state.router
    const drillDownKey = getDrillDownWidgetField(state, widgetName, bcName, fieldKey)?.drillDownKey as string
    const customDrillDownUrl = state.data[bcName]?.find(record => record.id === cursor)?.[drillDownKey] as string

    return customDrillDownUrl || drillDownField?.drillDown || drillDownField?.drillDown !== route.path
        ? concat(
              fetchedRowMeta && drillDownField?.drillDownType !== DrillDownType.inner
                  ? of(actions.bcFetchRowMetaSuccess({ bcName, rowMeta, bcUrl, cursor }))
                  : EMPTY,
              of(actions.userDrillDownSuccess({ bcName, bcUrl, cursor })),
              of(
                  actions.drillDown({
                      url: customDrillDownUrl || (drillDownField?.drillDown as string),
                      drillDownType: drillDownField?.drillDownType as DrillDownType,
                      route
                  })
              )
          )
        : EMPTY
}

export default processUserDrillDown
