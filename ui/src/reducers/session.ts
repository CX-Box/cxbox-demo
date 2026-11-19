import { interfaces, reducers } from '@cxbox-ui/core'
import { createReducer } from '@reduxjs/toolkit'
import { createSettingMap, createSettingPath } from '@utils/tableSettings'
import { TableSettingsMap } from '@interfaces/tableSettings'
import { actions, AuthErrorInfo } from '@actions'
import { FeatureSetting, BackendValidationMessage, RuntimeError, SessionScreen } from '@interfaces/session'

interface Session extends interfaces.Session {
    logout: boolean
    userId?: string
    tableSettings: TableSettingsMap | null
    screens: SessionScreen[]
    featureSettings?: FeatureSetting[]
    language?: string | null | undefined
    sessionId?: string
    authError: AuthErrorInfo | null
    authErrorSnoozedUntil: number | null
    metaValidation: BackendValidationMessage[]
    runtimeErrors: RuntimeError[]
}

/** Every place that shows AuthErrorPopup checks it: failed requests, the websocket */
export const isAuthErrorSnoozed = (session: Session) => !!session.authErrorSnoozedUntil && Date.now() < session.authErrorSnoozedUntil

const initialState: Session = {
    ...reducers.initialSessionState,
    active: false,
    screens: [],
    loginSpin: false,
    logout: false,
    notifications: [],
    isMetaRefreshing: false,
    tableSettings: null,
    authError: null,
    authErrorSnoozedUntil: null,
    metaValidation: [],
    runtimeErrors: [],
    disableDeprecatedFeatures: {
        popupCloseAfterChangeData: true,
        /**
         * solves the problem with adding a row to AssocPopup
         */
        secondDataChangeForAssocPopupWhenRemovingTagFromField: true
    }
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
    })
    .addCase(actions.showAuthErrorPopup, (state, action) => {
        state.authError = state.authError ?? action.payload
    })
    .addCase(actions.closeAuthErrorPopup, (state, action) => {
        state.authError = null
        state.authErrorSnoozedUntil = action.payload?.snoozedUntil ?? null
    })
    .addCase(actions.addRuntimeErrors, (state, action) => {
        action.payload.forEach(error => {
            const existingError = state.runtimeErrors.find(
                item =>
                    item.level === error.level &&
                    item.title === error.title &&
                    item.message === error.message &&
                    item.widget === error.widget
            )
            if (existingError) {
                existingError.count += error.count
            } else {
                state.runtimeErrors.push({ ...error })
            }
        })
    })
    .addCase(actions.clearRuntimeErrors, state => {
        state.runtimeErrors = []
    }).builder

export const sessionReducer = createReducer(initialState, sessionReducerBuilder)
