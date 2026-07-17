import { AppWidgetMeta, CustomWidgetTypes } from '@interfaces/widget'
import { PopupData } from '@interfaces/view'
import { RootState } from '@store'
import { isDefined } from '@utils/isDefined'

export const getAssocTreeSelectedNodeIds = (state: RootState, popup: PopupData | undefined, widget?: AppWidgetMeta): string[] => {
    if (!popup || widget?.type !== CustomWidgetTypes.AssocTreePopup) {
        return []
    }

    const { calleeBCName, associateFieldKey } = popup
    if (!calleeBCName || !associateFieldKey) {
        return []
    }

    const calleeBc = state.screen.bo.bc[calleeBCName]
    const cursor = calleeBc?.cursor as string | undefined
    const pendingData = cursor ? state.view.pendingDataChanges?.[calleeBCName]?.[cursor] : undefined
    const calleeData = cursor ? state.data[calleeBc.name]?.find(record => record.id === cursor) : undefined
    const values = pendingData?.[associateFieldKey] !== undefined ? pendingData[associateFieldKey] : calleeData?.[associateFieldKey]

    if (!Array.isArray(values)) {
        return []
    }

    return [
        ...new Set(
            values
                .map(value => (value && typeof value === 'object' ? value.id : value))
                .filter(isDefined)
                .map(String)
        )
    ]
}
