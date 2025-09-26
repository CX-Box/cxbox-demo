import { BcFilter, BcMeta, BcMetaState, BcSorter, interfaces, reducers, utils } from '@cxbox-ui/core'
import { actions } from '@actions'
import { createReducer, isAnyOf } from '@reduxjs/toolkit'
import { FilterGroup } from '@interfaces/filters'
import { MassStepType } from '@components/widgets/Table/massOperations/constants'

export type ViewerModeMass = {
    mode: 'mass'
    step?: MassStepType
    operationType: string
    widgetName: string
    bcName: string
    resultFilterEnabled?: boolean
}

export interface ScreenState extends interfaces.ScreenState {
    menuCollapsed: boolean
    bo: {
        activeBcName: string
        bc: Record<string, BcMetaState & { defaultLimit?: number; filterGroups?: FilterGroup[] }>
    }
    pagination: { [bcName: string]: { limit?: number } }
    viewerMode: {
        [bcName: string]: ViewerModeMass | undefined
    }
    collapsedWidgets: { [viewName: string]: string[] }
}

const initialState: ScreenState = {
    ...reducers.initialScreenState,
    menuCollapsed: false,
    pagination: {},
    viewerMode: {},
    collapsedWidgets: {}
}

const screenReducerBuilder = reducers
    .createScreenReducerBuilderManager(initialState)
    .addCase(actions.changeMenuCollapsed, (state, action) => {
        state.menuCollapsed = action.payload
    })
    .addCase(actions.customAction, (state, action) => {
        /**
         * An example reducer for custom action
         */
        console.log(action.payload)
    })
    .addCase(actions.removeFilterGroup, (state, action) => {
        const removedFilterGroup = action.payload

        state.bo.bc[removedFilterGroup.bc] = state.bo.bc[removedFilterGroup.bc] ?? {}

        state.bo.bc[removedFilterGroup.bc].filterGroups = state.bo.bc[removedFilterGroup.bc as string].filterGroups?.filter(
            filterGroup => filterGroup.name !== removedFilterGroup.name
        )
    })
    .addCase(actions.addFilterGroup, (state, action) => {
        const newFilterGroup = { ...action.payload, personal: true }

        state.bo.bc[newFilterGroup.bc]?.filterGroups?.push(newFilterGroup)
    })
    .addCase(actions.updateIdForFilterGroup, (state, { payload: newFilterGroup }) => {
        const newFilterGroupIndex =
            state.bo.bc[newFilterGroup.bc].filterGroups?.findIndex(filterGroup => filterGroup.name === newFilterGroup.name) ?? -1

        if (newFilterGroupIndex !== -1) {
            ;(state.bo.bc[newFilterGroup.bc].filterGroups as FilterGroup[])[newFilterGroupIndex].id = newFilterGroup.id
        }
    })
    .addCase(actions.changePageLimit, (state, action) => {
        const { bcName, limit } = action.payload

        state.pagination[bcName] = state.pagination[bcName] ?? {}
        state.pagination[bcName].limit = limit

        state.bo.bc[bcName] = state.bo.bc[bcName] ?? {}
        state.bo.bc[bcName].limit = limit as number
    })
    .addCase(actions.updateBcData, (state, action) => {
        const { bcName } = action.payload

        state.bo.bc[bcName] = state.bo.bc[bcName] ?? {}
        state.bo.bc[bcName].loading = false
    })
    .addCase(actions.setCollapsedWidgets, (state, action) => {
        const { viewName, widgetNameGroup } = action.payload
        const collapsedViewWidgets = state.collapsedWidgets[viewName] || []
        state.collapsedWidgets[viewName] = collapsedViewWidgets?.includes(widgetNameGroup[0])
            ? collapsedViewWidgets?.filter(item => !widgetNameGroup?.includes(item))
            : [...collapsedViewWidgets, ...widgetNameGroup]
    })
    .addCase(actions.setViewerMode, (state, action) => {
        const { bcName, step, widgetName, mode, operationType } = action.payload

        state.viewerMode[bcName] = state.viewerMode[bcName] ?? { ...action.payload }

        state.viewerMode[bcName]!.mode = mode
        state.viewerMode[bcName]!.widgetName = widgetName
        state.viewerMode[bcName]!.bcName = bcName
        state.viewerMode[bcName]!.operationType = operationType
        state.viewerMode[bcName]!.step = step

        state.bo.bc[bcName] = state.bo.bc[bcName] ?? {}
        if (state.bo.bc[bcName]?.massLimit) {
            state.pagination[bcName] = state.pagination[bcName] ?? {}
            state.pagination[bcName].limit = state.pagination[bcName].limit ?? state.bo.bc[bcName].limit

            state.bo.bc[bcName].limit = state.bo.bc[bcName]?.massLimit
        }
    })
    .addCase(actions.resetViewerMode, (state, action) => {
        const { bcName } = action.payload

        delete state.viewerMode[bcName]

        state.bo.bc[bcName] = state.bo.bc[bcName] ?? {}
        if (state.bo.bc[bcName]?.massLimit) {
            state.bo.bc[bcName].limit = state.pagination[bcName].limit
        }
    })
    .addCase(actions.changeOperationStep, (state, action) => {
        const { bcName, step } = action.payload

        state.viewerMode[bcName] = state.viewerMode[bcName] ?? ({} as (typeof state.viewerMode)[string])
        state.viewerMode[bcName]!.step = step
    })
    .addCase(actions.setMassResultFilterEnabled, (state, action) => {
        const { bcName, enabled } = action.payload

        state.viewerMode[bcName] = state.viewerMode[bcName] ?? ({} as (typeof state.viewerMode)[string])
        state.viewerMode[bcName]!.resultFilterEnabled = enabled
    })
    // TODO delete after execution CXBOX-1090
    .replaceCase(actions.selectScreen, (state, action) => {
        const { screen } = action.payload

        const bcDictionary: Record<string, BcMeta> = {}
        const bcSorters: Record<string, BcSorter[]> = {}
        const bcFilters: Record<string, BcFilter[]> = {}

        screen.meta?.bo.bc?.forEach(item => {
            bcDictionary[item.name] = item

            const sorter = !state.sorters[item.name] ? utils.parseSorters(item.defaultSort) : null
            const filter = utils.parseFilters(item.defaultFilter)

            if (sorter) {
                bcSorters[item.name] = sorter
            }
            if (filter) {
                bcFilters[item.name] = filter
            }
        })

        Object.assign(state, {
            screenName: screen.name,
            primaryView: screen.meta?.primary ?? state.primaryView,
            primaryViews: screen.meta?.primaries ?? state.primaryViews,
            views: screen.meta?.views ?? state.views,
            bo: { activeBcName: null, bc: bcDictionary },
            sorters: { ...state.sorters, ...bcSorters },
            filters: { ...state.filters, ...bcFilters }
        })
    })
    .addMatcher(isAnyOf(actions.selectScreen), (state, action) => {
        state.viewerMode = initialState.viewerMode
        state.collapsedWidgets = initialState.collapsedWidgets
        // временное решение чтобы сохранялся лимит при сменен экранов
        Object.values(state.bo.bc).forEach(bc => {
            bc.defaultLimit = bc.limit
            bc.limit = state.pagination[bc.name]?.limit ?? bc.limit
        })
    })
    .addMatcher(isAnyOf(actions.sendOperationSuccess, actions.bcSaveDataSuccess), (state, action) => {
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
