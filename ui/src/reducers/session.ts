import { interfaces, reducers } from '@cxbox-ui/core'
import { createReducer } from '@reduxjs/toolkit'
import { createSettingMap, createSettingPath } from '@utils/tableSettings'
import { TableSettingsMap } from '@interfaces/tableSettings'
import { actions } from '@actions'
import { SessionScreen } from '@interfaces/session'

interface Session extends interfaces.Session {
    logout: boolean
    userId?: string
    tableSettings: TableSettingsMap | null
    screens: SessionScreen[]
}

const initialState: Session = {
    ...reducers.initialSessionState,
    active: false,
    screens: [],
    loginSpin: false,
    logout: false,
    notifications: [],
    isMetaRefreshing: false,
    tableSettings: null
}

const sessionReducerBuilder = reducers
    .createSessionReducerBuilderManager(initialState)
    .addCase(actions.initTableSettings, (state, action) => {
        const { rawSettings } = action.payload

        state.tableSettings = Array.isArray(rawSettings) ? createSettingMap(rawSettings) : rawSettings
    })
    .addCase(actions.changeTableSettings, (state, action) => {
        const partialSetting = action.payload
        const settingPath = createSettingPath(partialSetting) as string

        state.tableSettings = state.tableSettings ?? {}

        const prevSetting = state.tableSettings[settingPath]

        state.tableSettings[settingPath] = prevSetting
            ? { ...prevSetting, ...partialSetting }
            : {
                  orderFields: [],
                  addedToAdditionalFields: [],
                  removedFromAdditionalFields: [],
                  ...partialSetting
              }
    })
    .addCase(actions.resetTableSettings, (state, action) => {
        const settingPath = createSettingPath(action.payload) as string

        state.tableSettings = state.tableSettings ?? {}

        state.tableSettings[settingPath] = null
    }).builder

export const sessionReducer = createReducer(initialState, sessionReducerBuilder)
