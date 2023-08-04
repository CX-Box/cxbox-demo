/**
 * This is a utility class for typing payload of redux actions
 */
import { ActionPayloadTypes as CxboxActionPayloadTypes, createActionCreators } from '@cxbox-ui/core'

const z = null as any

export const SSO_AUTH = 'SSO_AUTH'

/**
 * Declare your redux actions here with action name and payload type
 *
 * Assign every action an empty value (`z`) to prevent Typescript from erasing it in runtime
 *
 * @see https://github.com/microsoft/TypeScript/issues/12437
 */
export class CustomActionTypes extends CxboxActionPayloadTypes {
    /**
     * Set state of side menu: open or collapsed
     */
    changeMenuCollapsed: boolean = z

    /**
     * An example of action and payload declaration
     */
    customAction: {
        customMessage: string
    } = z

    /**
     * You can expand payload of internal cxbox-ui actions:
     */
    changeLocation: CxboxActionPayloadTypes['changeLocation'] & {
        customPayloadField?: number
    } = z

    /**
     * Set the number of records for BC
     */
    setBcCount: {
        count: number
        bcName: string
    } = z

    setRecordForm: {
        widgetName: string
        bcName: string
        cursor: string
        active: boolean
        create: boolean
    } = z

    partialUpdateRecordForm: {
        widgetName?: string
        bcName?: string
        cursor?: string
        active?: boolean
        create?: boolean
    } = z

    resetRecordForm: null = z

    showViewPopup: CxboxActionPayloadTypes['showViewPopup'] & {
        options?: { operation?: CxboxActionPayloadTypes['processPreInvoke'] }
    } = z
}

/**
 * Action creator helper allowing to create action typed actions:
 *
 * $do.customAction({ customMessage: 'test '}) will result in:
 * { type: 'customAction', payload: { customMessage: 'test' } }
 */
export const $do = createActionCreators(new CustomActionTypes())
