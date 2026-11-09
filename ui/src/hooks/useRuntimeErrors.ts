import { useMemo } from 'react'
import { useAppSelector } from '@store'
import { RuntimeError, RuntimeErrorLevel } from '@interfaces/session'

export interface RuntimeErrorsScope {
    widget?: string
    viewOnly?: boolean
}

/**
 * Unbound messages belong to the view; widget messages require that widget on the view.
 */
export const useRuntimeErrors = ({ widget, viewOnly }: RuntimeErrorsScope = {}) => {
    const messages = useAppSelector(state => state.session.metaValidation)
    const runtimeErrors = useAppSelector(state => state.session.runtimeErrors)
    const viewName = useAppSelector(state => state.view.name)
    const viewWidgets = useAppSelector(state => state.view.widgets)

    return useMemo(() => {
        const widgetNamesOnView = new Set(viewWidgets.map(item => item.name))
        const matchesWidgetScope = (widgets: string[]) => {
            if (widget) {
                return widgetNamesOnView.has(widget) && widgets.includes(widget)
            }
            if (viewOnly) {
                return widgets.length === 0
            }
            return widgets.length === 0 || widgets.some(name => widgetNamesOnView.has(name))
        }
        const scopedMessages = messages.filter(
            message => (message.views.length === 0 || message.views.includes(viewName)) && matchesWidgetScope(message.widgets)
        )
        const backendProblems = scopedMessages.filter(message => !message.executionFailed)
        const executionFailures = scopedMessages.filter(message => message.executionFailed)
        const frontendErrors = runtimeErrors.filter(error => matchesWidgetScope(error.widget ? [error.widget] : []))
        return {
            backendProblems,
            executionFailures,
            frontendErrors,
            level: getRuntimeErrorLevel(executionFailures.length + backendProblems.length, frontendErrors)
        }
    }, [messages, runtimeErrors, viewName, viewWidgets, widget, viewOnly])
}

const getRuntimeErrorLevel = (backendCount: number, frontendErrors: RuntimeError[]): RuntimeErrorLevel | undefined => {
    if (backendCount > 0 || frontendErrors.some(error => error.level === 'error')) {
        return 'error'
    }
    return frontendErrors.length > 0 ? 'warning' : undefined
}
