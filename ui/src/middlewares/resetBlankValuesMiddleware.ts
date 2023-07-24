import { AnyAction, Dispatch, MiddlewareAPI } from 'redux'
import { AppState } from '../interfaces/storeSlices'
import { ActionPayloadTypes, coreActions } from '@cxbox-ui/core'
import { $do } from '../actions/types'
import { PendingDataItem } from '@cxbox-ui/core/interfaces/data'

export const resetBlankValuesMiddleware =
    ({ getState, dispatch }: MiddlewareAPI<Dispatch<AnyAction>, AppState>) =>
    (next: Dispatch) =>
    (action: AnyAction) => {
        if (action.type === coreActions.changeDataItem) {
            const { dataItem: oldDataItem, ...payload } = action.payload as ActionPayloadTypes['changeDataItem']

            return next($do.changeDataItem({ ...payload, dataItem: normalizeDataItem(oldDataItem) }))
        }

        if (action.type === coreActions.changeDataItems) {
            const { dataItems: oldDataItems, ...payload } = action.payload as ActionPayloadTypes['changeDataItems']

            return next($do.changeDataItems({ ...payload, dataItems: oldDataItems.map(normalizeDataItem) }))
        }

        return next(action)
    }

function normalizeDataItem(dataItem: PendingDataItem) {
    return Object.entries(dataItem).reduce((acc, [key, value]) => {
        if (typeof value === 'string' && !value) {
            acc[key] = null
        } else {
            acc[key] = value
        }

        return acc
    }, {} as PendingDataItem)
}
