import { reducers, interfaces } from '@cxbox-ui/core'
import { actions, changeMenuCollapsed, customAction, sendOperationSuccess } from '@actions'
import { createReducer, isAnyOf } from '@reduxjs/toolkit'

interface ScreenState extends interfaces.ScreenState {
    menuCollapsed: boolean
    fullTextFilter: Record<string, string>
}

const initialState: ScreenState = {
    ...reducers.initialScreenState,
    fullTextFilter: {},
    menuCollapsed: false
}

const screenReducerBuilder = reducers
    .createScreenReducerBuilderManager(initialState)
    .addCase(changeMenuCollapsed, (state, action) => {
        state.menuCollapsed = action.payload
    })
    .addCase(customAction, (state, action) => {
        /**
         * An example reducer for custom action
         */
        console.log(action.payload)
    })
    .addCase(actions.changeBcFullTextFilter, (state, action) => {
        const { bcName, fullTextFilterValue } = action.payload

        state.fullTextFilter[bcName] = fullTextFilterValue
    })
    .addMatcher(isAnyOf(sendOperationSuccess, actions.bcSaveDataSuccess), (state, action) => {
        if (action.payload.dataItem) {
            const newCursor = action.payload.dataItem.id

            state.bo.bc[action.payload.bcName].loading = false
            /**
             * Here we support id change on save action to support platform usage as other microservices data provider. I
             * In this case new record is usually virtually created with temporary id, then on 'save' record is saved to real microservice and temporary id is replaced with new permanent one
             */
            state.bo.bc[action.payload.bcName].cursor = newCursor
            state.cachedBc[action.payload.bcName] = `${action.payload.bcName}/${newCursor}`
        }
    }).builder

export const screenReducer = createReducer(initialState, screenReducerBuilder)
