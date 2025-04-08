export enum ENotificationMode {
    single = 'single',
    stack = 'stack',
    column = 'column'
}

export enum EDirection {
    downward = 'downward',
    upward = 'upward'
}

export const notificationsContainerId = 'custom-notifications-container'
export const notifications = new Set()

export const directionItems: EDirection = EDirection.downward
export const maxItems = 3
export const timeout = 10
