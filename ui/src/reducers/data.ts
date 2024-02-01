import { reducers, interfaces, actions } from '@cxbox-ui/core'
import { createReducer, isAnyOf } from '@reduxjs/toolkit'
import { sendOperationSuccess } from '@actions'
import { DataItem } from '@cxbox-ui/schema'

/**
 * Your initial state for this slice
 */
export const initialState: interfaces.DataState = {}
const emptyData: interfaces.DataItem[] = []

const dataReducerBuilder = reducers
    .createDataReducerBuilderManager(initialState)
    .replaceCase(actions.bcNewDataSuccess, (state, action) => {
        state[action.payload.bcName] = [action.payload.dataItem, ...(state[action.payload.bcName] || emptyData)]
    })
    .addMatcher(isAnyOf(actions.bcSaveDataSuccess, sendOperationSuccess), (state, action) => {
        if (action.payload.dataItem) {
            const nextDataItem = action.payload.dataItem ? action.payload.dataItem : undefined

            state[action.payload.bcName] = (state[action.payload.bcName] || emptyData).map(item => {
                if (item.id === nextDataItem?.id) {
                    return nextDataItem
                } else if (item.id === action.payload.cursor && nextDataItem?.id) {
                    /**
                     * Here we support id change on save action to support platform usage as other microservices data provider. I
                     * In this case new record is usually virtually created with temporary id, then on 'save' record is saved to real microservice and temporary id is replaced with new permanent one
                     */
                    return nextDataItem
                } else {
                    return item
                }
            }) as DataItem[]
        }
    }).builder

export const dataReducer = createReducer(initialState, dataReducerBuilder)
