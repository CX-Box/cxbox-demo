import { notification } from 'antd'
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
    const drillDownUrl = customDrillDownUrl || drillDownField?.drillDown

    if (drillDownUrl) {
        const urlObject = new URL(drillDownUrl, window.location.origin)

        if (urlObject.searchParams?.size) {
            notification.warn({
                message: t(
                    'Opening drill-downs with non-ID-based filtering in a new tab is currently not supported. Please contact your administrator'
                )
            })
            return
        }
    }

    const drillDownFullUrl = getFullUrl(drillDownUrl, drillDownField?.drillDownType as DrillDownType)

    if (drillDownFullUrl) {
        if (copyLink) {
            copyTextToClipboard(drillDownFullUrl, t('Link copied successfully'))
        } else {
            window.open(drillDownFullUrl, '_blank')
        }
    }
}

export default processDrillDownInNewTab
