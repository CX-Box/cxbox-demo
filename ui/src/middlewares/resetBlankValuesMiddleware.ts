import { AnyAction, Dispatch, MiddlewareAPI } from 'redux'
import { RootState } from '@store'
import { interfaces } from '@cxbox-ui/core'
import { actions } from '@cxbox-ui/core'
import { Middleware } from '@reduxjs/toolkit'

export const resetBlankValuesMiddleware: Middleware =
    ({ getState, dispatch }: MiddlewareAPI<Dispatch<AnyAction>, RootState>) =>
    (next: Dispatch) =>
    (action: AnyAction) => {
        if (action.type === actions.changeDataItem.toString()) {
            const { dataItem: oldDataItem, ...payload } = action.payload as ReturnType<typeof actions.changeDataItem>['payload']

            return next(actions.changeDataItem({ ...payload, dataItem: normalizeDataItem(oldDataItem) }))
        }

        if (action.type === actions.changeDataItems.toString()) {
            const { dataItems: oldDataItems, ...payload } = action.payload as ReturnType<typeof actions.changeDataItems>['payload']

            return next(actions.changeDataItems({ ...payload, dataItems: oldDataItems.map(normalizeDataItem) }))
        }

        return next(action)
    }

function normalizeDataItem(dataItem: interfaces.PendingDataItem) {
    return Object.entries(dataItem).reduce((acc, [key, value]) => {
        if (typeof value === 'string' && !value) {
            acc[key] = null
        } else {
            acc[key] = value
        }

        return acc
    }, {} as interfaces.PendingDataItem)
}
