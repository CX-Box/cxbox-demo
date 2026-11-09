import { Dispatch, MiddlewareAPI } from 'redux'
import { actions } from '@actions'
import { RuntimeError, RuntimeErrorLevel } from '@interfaces/session'
import { RootState } from '@store'

export interface NewRuntimeError {
    title?: string
    message: string
    level?: RuntimeErrorLevel
    widget?: string
}

type ConsoleMethod = 'error' | 'warn'

const consoleMethods: ConsoleMethod[] = ['error', 'warn']
const originalConsoleMethods: Record<ConsoleMethod, Console[ConsoleMethod]> = { error: console.error, warn: console.warn }
const pendingErrors = new Map<string, RuntimeError>()
let errorsReportedThisTurn = new WeakSet<object>()
let captureEnabled = false
let dispatchingErrors = false
let storeApi: MiddlewareAPI<Dispatch, RootState> | null = null

/**
 * Reports project diagnostics while the dev panel session is active.
 * Repeated messages are counted and dispatched in batches after the current task.
 * Diagnostics are cleared on view changes and logout.
 */
export const addRuntimeError = (error: NewRuntimeError) => {
    if (!captureEnabled || dispatchingErrors) {
        return
    }
    if (pendingErrors.size === 0) {
        setTimeout(dispatchPendingErrors)
    }
    const level = error.level ?? 'error'
    const key = [level, error.title, error.message, error.widget].join('\u0000')
    const existingError = pendingErrors.get(key)
    if (existingError) {
        existingError.count++
    } else {
        pendingErrors.set(key, { ...error, level, count: 1 })
    }
}

export const syncRuntimeErrorCapture = (api: MiddlewareAPI<Dispatch, RootState>) => {
    storeApi = api
    const { active, devPanelEnabled } = api.getState().session
    const shouldBeEnabled = !!active && !!devPanelEnabled
    if (shouldBeEnabled !== captureEnabled) {
        setCaptureEnabled(shouldBeEnabled)
    }
}

export const dropRuntimeErrors = () => {
    if (captureEnabled) {
        clearCapturedErrors()
    }
}

const dispatchPendingErrors = () => {
    const errors = Array.from(pendingErrors.values())
    pendingErrors.clear()
    if (!captureEnabled || errors.length === 0) {
        return
    }
    // Prevent errors in the dev panel from triggering a dispatch loop.
    dispatchingErrors = true
    try {
        storeApi?.dispatch(actions.addRuntimeErrors(errors))
    } catch (error) {
        originalConsoleMethods.error.call(console, error)
    } finally {
        dispatchingErrors = false
    }
}

const setCaptureEnabled = (value: boolean) => {
    captureEnabled = value
    consoleMethods.forEach(method => {
        // Preserve console wrappers installed by other code after ours.
        if (console[method] === (value ? originalConsoleMethods : wrappedConsoleMethods)[method]) {
            console[method] = (value ? wrappedConsoleMethods : originalConsoleMethods)[method]
        }
    })
    if (value) {
        window.addEventListener('error', onError)
        window.addEventListener('unhandledrejection', onRejection)
    } else {
        window.removeEventListener('error', onError)
        window.removeEventListener('unhandledrejection', onRejection)
        clearCapturedErrors()
    }
}

const clearCapturedErrors = () => {
    pendingErrors.clear()
    errorsReportedThisTurn = new WeakSet()
    if (storeApi && storeApi.getState().session.runtimeErrors.length > 0) {
        storeApi.dispatch(actions.clearRuntimeErrors())
    }
}

const wrapConsoleMethod =
    (method: ConsoleMethod, level: RuntimeErrorLevel) =>
    (...args: unknown[]) => {
        originalConsoleMethods[method].apply(console, args)
        addRuntimeError({ level, message: formatConsoleMessage(args) })
    }

const wrappedConsoleMethods: Record<ConsoleMethod, Console[ConsoleMethod]> = {
    error: wrapConsoleMethod('error', 'error'),
    warn: wrapConsoleMethod('warn', 'warning')
}

const onError = (event: ErrorEvent) => {
    if (!captureEnabled || dispatchingErrors) {
        return
    }
    const error = event.error
    if (error !== null && (typeof error === 'object' || typeof error === 'function')) {
        if (errorsReportedThisTurn.has(error)) {
            return
        }
        // React dev reports the same Error in its guarded callback and again on rethrow.
        // Forget it after this turn so a later throw of the same object still counts.
        const reportedErrors = errorsReportedThisTurn
        reportedErrors.add(error)
        queueMicrotask(() => reportedErrors.delete(error))
    }
    addRuntimeError({ title: 'Uncaught error', message: error == null ? event.message : toText(error) })
}

const onRejection = (event: PromiseRejectionEvent) => addRuntimeError({ title: 'Unhandled rejection', message: toText(event.reason) })

const formatConsoleMessage = (args: unknown[]) => {
    const [first, ...rest] = args
    if (typeof first !== 'string') {
        return args.map(toText).join(' ')
    }
    const text = first.replace(/%[sdifoOc]/g, specifier => {
        if (rest.length === 0) {
            return specifier
        }
        const arg = rest.shift()
        return specifier === '%c' ? '' : toText(arg)
    })
    return [text, ...rest.map(toText)].join(' ')
}

const toText = (value: unknown): string => {
    try {
        if (typeof value === 'string' || value instanceof Error || typeof value !== 'object' || value === null) {
            return String(value)
        }
        return JSON.stringify(value) ?? String(value)
    } catch (e) {
        try {
            return Object.prototype.toString.call(value)
        } catch (error) {
            return '[unprintable value]'
        }
    }
}
