import { reducers, interfaces } from '@cxbox-ui/core'
import { createReducer, isAnyOf } from '@reduxjs/toolkit'
import { actions } from '@actions'
import { DataItem } from '@cxbox-ui/schema'
import { changeRecordPositionMutate } from '@components/widgets/Table/groupingHierarchy/utils/changeRecordPositionMutate'

/**
 * Your initial state for this slice
 */
export const initialState: interfaces.DataState = {}
const emptyData: interfaces.DataItem[] = []

const dataReducerBuilder = reducers
    .createDataReducerBuilderManager(initialState)
    .replaceCase(actions.bcNewDataSuccess, (state, action) => {
        state[action.payload.bcName] = [
            action.payload.dataItem,
            ...(state[action.payload.bcName]?.filter(dataItem => dataItem.id !== action.payload.dataItem?.id) || emptyData)
        ]
    })
    .addCase(actions.updateBcData, (state, action) => {
        const { bcName, data } = action.payload

        state[bcName] = data
    })
    .addMatcher(isAnyOf(actions.bcSaveDataSuccess, actions.sendOperationSuccess), (state, action) => {
        const { dataItem, sortedGroupKeys, bcName, cursor } = action.payload

        if (dataItem) {
            const nextDataItem = dataItem ? dataItem : undefined
            // updates record data
            state[bcName] = (state[bcName] || emptyData).map(item => {
                if (item.id === nextDataItem?.id) {
                    return nextDataItem
                } else if (item.id === cursor && nextDataItem?.id) {
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
        // For GroupingHierarchy widget
        if (dataItem && sortedGroupKeys?.length) {
            changeRecordPositionMutate(state[bcName], dataItem, sortedGroupKeys)
        }
    })
    .addMatcher(isAnyOf(actions.sendOperationSuccess), (state, action) => {
        const { newDataItems, bcName } = action.payload

        if (Array.isArray(newDataItems) && newDataItems.length) {
            state[bcName] = [...newDataItems, ...(state[bcName] || emptyData)]
        }
    }).builder

export const dataReducer = createReducer(initialState, dataReducerBuilder)
