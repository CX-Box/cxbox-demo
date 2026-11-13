import { afterEach, beforeEach, expect, test, vi } from 'vitest'
import { RuntimeError } from '@interfaces/session'

vi.mock('@actions', () => ({
    actions: {
        addRuntimeErrors: (payload: RuntimeError[]) => ({ type: 'addRuntimeErrors', payload }),
        clearRuntimeErrors: () => ({ type: 'clearRuntimeErrors' })
    }
}))

let runtime: typeof import('./runtimeErrors')
let errorSpy: ReturnType<typeof vi.spyOn>
let warnSpy: ReturnType<typeof vi.spyOn>
const session = { active: true, devPanelEnabled: true, runtimeErrors: new Array<RuntimeError>() }
const batches: RuntimeError[][] = []
const api = {
    getState: () => ({ session }),
    dispatch: (action: { type: string; payload?: RuntimeError[] }) => {
        if (action.type === 'addRuntimeErrors') {
            batches.push(action.payload ?? [])
        }
        return action
    }
}
const syncCapture = () => runtime.syncRuntimeErrorCapture(api as Parameters<typeof runtime.syncRuntimeErrorCapture>[0])
const flush = () => new Promise(resolve => setTimeout(resolve, 0))
const captured = () => batches.flat()
const report = (error: unknown, message = String(error)) => window.dispatchEvent(Object.assign(new Event('error'), { error, message }))

beforeEach(async () => {
    vi.resetModules()
    vi.stubGlobal('window', new EventTarget())
    errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
    runtime = await import('./runtimeErrors')
    session.active = true
    session.devPanelEnabled = true
    session.runtimeErrors = []
    batches.length = 0
    syncCapture()
})

afterEach(() => {
    session.active = false
    syncCapture()
    errorSpy.mockRestore()
    warnSpy.mockRestore()
    vi.unstubAllGlobals()
})

test('two reports of the same exception in one turn count once', async () => {
    const error = new Error('one click')
    report(error)
    report(error)
    await flush()

    expect(captured()).toEqual([{ title: 'Uncaught error', message: 'Error: one click', level: 'error', count: 1 }])
})

test('the same Error object counts again on a later turn', async () => {
    const error = new Error('reused error')
    report(error)
    report(error)
    await flush()
    report(error)
    report(error)
    await flush()

    expect(captured().map(item => item.count)).toEqual([1, 1])
})

test('distinct exceptions with identical messages are counted independently in the same turn', async () => {
    report(new Error('same text'))
    report(new Error('same text'))
    await flush()

    expect(captured()).toEqual([{ title: 'Uncaught error', message: 'Error: same text', level: 'error', count: 2 }])
})

test('notifications without an Error object are not suppressed by their message', async () => {
    report(undefined, 'script error')
    report(undefined, 'script error')
    await flush()

    expect(captured()).toEqual([{ title: 'Uncaught error', message: 'script error', level: 'error', count: 2 }])
})

test('console repetitions are still counted', async () => {
    console.error('repeated error')
    console.error('repeated error')
    console.warn('repeated warning')
    console.warn('repeated warning')
    await flush()

    expect(captured()).toEqual([
        { message: 'repeated error', level: 'error', count: 2 },
        { message: 'repeated warning', level: 'warning', count: 2 }
    ])
    expect(errorSpy).toHaveBeenCalledTimes(2)
    expect(warnSpy).toHaveBeenCalledTimes(2)
})

test('view reset permits the same Error on the new view', async () => {
    const error = new Error('view error')
    report(error)
    runtime.dropRuntimeErrors()
    report(error)
    await flush()

    expect(captured()).toEqual([{ title: 'Uncaught error', message: 'Error: view error', level: 'error', count: 1 }])
})

test('logout clears pending errors and a later session may report the same Error', async () => {
    const error = new Error('session error')
    report(error)
    session.active = false
    syncCapture()
    session.active = true
    syncCapture()
    report(error)
    await flush()

    expect(captured()).toEqual([{ title: 'Uncaught error', message: 'Error: session error', level: 'error', count: 1 }])
})
