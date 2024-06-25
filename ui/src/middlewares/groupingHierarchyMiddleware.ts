import { AnyAction, Dispatch, MiddlewareAPI } from 'redux'
import { RootState } from '@store'
import { Middleware } from '@reduxjs/toolkit'
import { AppWidgetMeta } from '@interfaces/widget'
import { actions } from '@actions'
import { getGroupingHierarchyWidget, moveUnallocatedRowsToBeginning } from '@utils/groupingHierarchy'

export const groupingHierarchyMiddleware: Middleware =
    ({ getState, dispatch }: MiddlewareAPI<Dispatch<AnyAction>, RootState>) =>
    (next: Dispatch) =>
    (action: AnyAction) => {
        // Moves unallocated rows for GroupingHierarchy to the top to synchronize the order of array elements with the tree formed in the widget after receiving data.
        if (actions.bcFetchDataSuccess.match(action)) {
            const state = getState()
            const widgetWithGroupingHierarchy = getGroupingHierarchyWidget(state.view.widgets as AppWidgetMeta[], action.payload.bcName)

            if (widgetWithGroupingHierarchy) {
                const sortedData = moveUnallocatedRowsToBeginning(
                    action.payload.data,
                    widgetWithGroupingHierarchy?.options?.groupingHierarchy?.fields
                )
                const newCursor = sortedData?.[0]?.id

                newCursor && dispatch(actions.bcChangeCursors({ cursorsMap: { [action.payload.bcName]: newCursor } }))

                return next({
                    ...action,
                    payload: {
                        ...action.payload,
                        data: sortedData
                    }
                })
            }
        }
        // Adds sortedGroupKeys for actions called in the core. Also moves the cursor to a successfully saved entry.
        if ((actions.bcSaveDataSuccess.match(action) || actions.sendOperationSuccess.match(action)) && action.payload.dataItem) {
            const state = getState()
            const widgetWithGroupingHierarchy = getGroupingHierarchyWidget(state.view.widgets as AppWidgetMeta[], action.payload.bcName)

            if (widgetWithGroupingHierarchy) {
                action.payload?.dataItem?.id &&
                    dispatch(actions.bcChangeCursors({ cursorsMap: { [action.payload.bcName]: action.payload.dataItem.id } }))

                return next({
                    ...action,
                    payload: {
                        ...action.payload,
                        sortedGroupKeys: widgetWithGroupingHierarchy.options?.groupingHierarchy?.fields
                    }
                })
            }
        }

        return next(action)
    }
