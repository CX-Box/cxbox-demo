import { t } from 'i18next'
import copyTextToClipboard from '@utils/copyTextToClipboard'
import getFullUrl from '@utils/getFullUrl'
import openInNewTab from '@utils/openInNewTab'
import { openNotification } from '@components/NotificationsContainer/utils'
import { RootState } from '@store'
import { DrillDownType, RowMeta } from '@cxbox-ui/core'
import getDrillDownWidgetField from './getDrillDownWidgetField'

const processDrillDownInNewTab = (
    state: RootState,
    rowMeta: RowMeta,
    widgetName: string,
    fieldKey: string,
    cursor: string,
    bcName: string,
    copyLink?: boolean
) => {
    const drillDownField = rowMeta.fields.find(field => field.key === fieldKey)
    const drillDownKey = getDrillDownWidgetField(state, widgetName, bcName, fieldKey)?.drillDownKey as string
    const customDrillDownUrl = state.data[bcName]?.find(record => record.id === cursor)?.[drillDownKey] as string
    const drillDownUrl = customDrillDownUrl || drillDownField?.drillDown

    if (drillDownUrl) {
        const urlObject = new URL(drillDownUrl, window.location.origin)

        if (urlObject.searchParams?.size) {
            openNotification({
                type: 'warning',
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
            openInNewTab(drillDownFullUrl)
        }
    }
}

export default processDrillDownInNewTab
