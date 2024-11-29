import { t } from 'i18next'
import copyTextToClipboard from '@utils/copyTextToClipboard'
import getFullUrl from '@utils/getFullUrl'
import { RootState } from '@store'
import { DrillDownType, RowMeta } from '@cxbox-ui/core'
import { WidgetFieldBase } from '@cxbox-ui/schema'

const processDrillDownInNewTab = (
    state: RootState,
    rowMeta: RowMeta,
    fieldKey: string,
    cursor: string,
    bcName: string,
    copyLink?: boolean
) => {
    const drillDownField = rowMeta.fields.find(field => field.key === fieldKey)
    const drillDownKey = (
        state.view.widgets.find(widget => widget.bcName === bcName)?.fields.find((field: any) => field.key === fieldKey) as WidgetFieldBase
    )?.drillDownKey as string
    const customDrillDownUrl = state.data[bcName]?.find(record => record.id === cursor)?.[drillDownKey] as string
    const drillDownUrl = getFullUrl(customDrillDownUrl || drillDownField?.drillDown, drillDownField?.drillDownType as DrillDownType)

    if (drillDownUrl) {
        if (copyLink) {
            copyTextToClipboard(drillDownUrl, t('Link copied successfully'))
        } else {
            window.open(drillDownUrl, '_blank')
        }
    }
}

export default processDrillDownInNewTab
