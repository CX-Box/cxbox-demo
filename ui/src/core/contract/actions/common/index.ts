import { ActionPreInvoke } from '../../preActions'

export type ActionBaseRecord = object

/**
 * User operation: CRUD or any custom business action.
 *
 * Received from record's row meta.
 */
export interface Action extends ActionBaseRecord {
    /**
     * Displayed
     */
    text: string
    /**
     * String that uniquely identifies an operation on widget
     */
    type: string
    /**
     * A hint to decide where to display an operation which is related to the record or the whole widget
     */
    scope: 'bc' | 'record' | 'page' | 'associate'
    /**
     * An icon (https://ant.design/components/icon) to display on operation button,
     */
    icon?: string
    /**
     * @deprecated TODO: Remove in 2.0.0 in favor of client-side custom parameters
     */
    bcKey?: string
    /**
     * Omit text value of operation in favor of icon
     */
    showOnlyIcon?: boolean
    /**
     * An operation that should be fired before initiating this operation
     */
    preInvoke?: ActionPreInvoke
    /**
     * Validate the record for empty "required" fields before API call
     */
    autoSaveBefore?: boolean
    /**
     * If custom operation needs to be processed as if it was a default crud operation,
     * this flag can be specified and will be used instead of real `type`
     */
    actionRole?: string
    /**
     * Subtype for association popup, used for calling multiFileUploadPopup,
     * else has default behavior of assoc popup
     */
    subtype?: 'bc' | 'multiFileUpload'
}

/**
 * Group of actions.
 *
 * It shows name of a group, drop down list of actions
 * and some actions which are shown in case list is covered.
 * Группа действий, показывает название группы и раскрываемые список ее действий,
 * а также несколько действий рядом с группой, которые видны не раскрывая список.
 */
export interface ActionGroup extends ActionBaseRecord {
    /**
     * Unique identifier for the operation group
     */
    type: string
    /**
     * Displayed name of a group
     */
    text: string
    /**
     * An icon (https://ant.design/components/icon) to display on operation button,
     */
    icon?: string
    /**
     * Omit text value of operation in favor of icon
     */
    showOnlyIcon?: boolean
    /**
     * List of group actions
     */
    actions: Action[]
    /**
     * Number of showed actions in case list is covered
     */
    maxGroupVisualButtonsCount: number
}

export function isAction(action: ActionBaseRecord): action is Action {
    return 'type' in action && 'scope' in action
}

export function isActionGroup(action: ActionBaseRecord): action is ActionGroup {
    return 'actions' in action
}
