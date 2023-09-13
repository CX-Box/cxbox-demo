import { createAction } from '@reduxjs/toolkit'
import { actions } from '@cxbox-ui/core'

export const SSO_AUTH = createAction('SSO_AUTH')

/**
 * Set state of side menu: open or collapsed
 */
export const changeMenuCollapsed = createAction<boolean>('changeMenuCollapsed')

/**
 * An example of action and payload declaration
 */
export const customAction = createAction<{
    customMessage: string
}>('customAction')

/**
 * You can expand payload of internal cxbox-ui actions:
 * */
export const changeLocation = createAction<ReturnType<typeof actions.changeLocation>['payload'] & { customPayloadField?: number }>(
    'changeLocation'
)

/**
 * Set the number of records for BC
 */
export const setBcCount = createAction<{
    count: number
    bcName: string
}>('setBcCount')
