import { beforeEach, expect, test, vi } from 'vitest'
import { BackendValidationMessage, RuntimeError } from '@interfaces/session'
import { useRuntimeErrors } from './useRuntimeErrors'

vi.mock('@store', () => ({ useAppSelector: (selector: (state: typeof mockState) => unknown) => selector(mockState) }))
vi.mock('react', () => ({ useMemo: (calculate: () => unknown) => calculate() }))

const problem = (views: string[] = [], widgets: string[] = []): BackendValidationMessage => ({
    validatorName: 'example',
    title: 'Example',
    message: 'Invalid metadata',
    views,
    widgets,
    executionFailed: false
})

const mockState = {
    session: { metaValidation: new Array<BackendValidationMessage>(), runtimeErrors: new Array<RuntimeError>() },
    view: { name: 'current', widgets: [{ name: 'list' }] }
}

beforeEach(() => {
    mockState.session.metaValidation = []
    mockState.session.runtimeErrors = []
    mockState.view.name = 'current'
})

const selectMessages = (messages: BackendValidationMessage[]) => {
    mockState.session.metaValidation = messages
}

test.each([[], ['current']].map(views => ({ views })))('unbound and view-level problems belong to the view badge: $views', ({ views }) => {
    const message = problem(views)
    selectMessages([message])

    expect(useRuntimeErrors().backendProblems).toEqual([message])
    expect(useRuntimeErrors({ viewOnly: true }).backendProblems).toEqual([message])
    expect(useRuntimeErrors({ viewOnly: true }).level).toBe('error')
    expect(useRuntimeErrors({ widget: 'list' }).backendProblems).toEqual([])
})

test.each([[], ['current']].map(views => ({ views })))(
    'widget problems stay on the widget and never duplicate on the view: $views',
    ({ views }) => {
        const message = problem(views, ['list'])
        selectMessages([message])

        expect(useRuntimeErrors().backendProblems).toEqual([message])
        expect(useRuntimeErrors({ widget: 'list' }).backendProblems).toEqual([message])
        expect(useRuntimeErrors({ viewOnly: true }).backendProblems).toEqual([])
        expect(useRuntimeErrors({ viewOnly: true }).level).toBeUndefined()
    }
)

test.each([[], ['current'], ['other']].map(views => ({ views })))(
    'off-screen widget problems remain outside all badges: $views',
    ({ views }) => {
        selectMessages([problem(views, ['orphan'])])

        expect(useRuntimeErrors().backendProblems).toEqual([])
        expect(useRuntimeErrors().level).toBeUndefined()
        expect(useRuntimeErrors({ viewOnly: true }).backendProblems).toEqual([])
        expect(useRuntimeErrors({ widget: 'list' }).backendProblems).toEqual([])
        expect(useRuntimeErrors({ widget: 'orphan' }).backendProblems).toEqual([])
    }
)

test('explicit view binding prevents leakage even when another view uses the same widget', () => {
    const current = problem(['current'], ['list'])
    const other = problem(['other'], ['list'])
    const otherView = problem(['other'])
    selectMessages([current, other, otherView])

    expect(useRuntimeErrors().backendProblems).toEqual([current])
    expect(useRuntimeErrors({ widget: 'list' }).backendProblems).toEqual([current])
    expect(useRuntimeErrors({ viewOnly: true }).backendProblems).toEqual([])
    expect(mockState.session.metaValidation).toEqual([current, other, otherView])
})

test('a problem shared by widgets is counted once in the summary and stays out of the view badge', () => {
    const message = problem(['current'], ['list', 'orphan'])
    selectMessages([message])

    expect(useRuntimeErrors().backendProblems).toEqual([message])
    expect(useRuntimeErrors({ widget: 'list' }).backendProblems).toEqual([message])
    expect(useRuntimeErrors({ widget: 'orphan' }).backendProblems).toEqual([])
    expect(useRuntimeErrors({ viewOnly: true }).backendProblems).toEqual([])
})

test('unbound validator failures are shown at view level while unrelated failures are hidden', () => {
    const executionFailure = { ...problem(), executionFailed: true }
    selectMessages([
        executionFailure,
        { ...problem(['other']), executionFailed: true },
        { ...problem([], ['orphan']), executionFailed: true }
    ])

    expect(useRuntimeErrors().executionFailures).toEqual([executionFailure])
    expect(useRuntimeErrors({ viewOnly: true }).executionFailures).toEqual([executionFailure])
    expect(useRuntimeErrors({ viewOnly: true }).level).toBe('error')
    expect(useRuntimeErrors({ widget: 'list' }).executionFailures).toEqual([])
})

test('frontend errors use the same widget/view split without promoting off-screen widget errors', () => {
    const unbound: RuntimeError = { level: 'warning', message: 'view warning', count: 2 }
    const widget: RuntimeError = { level: 'error', message: 'widget error', widget: 'list', count: 1 }
    const orphan: RuntimeError = { level: 'error', message: 'off-screen error', widget: 'orphan', count: 1 }
    mockState.session.runtimeErrors = [unbound, widget, orphan]

    expect(useRuntimeErrors().frontendErrors).toEqual([unbound, widget])
    expect(useRuntimeErrors({ viewOnly: true }).frontendErrors).toEqual([unbound])
    expect(useRuntimeErrors({ viewOnly: true }).level).toBe('warning')
    expect(useRuntimeErrors({ widget: 'list' }).frontendErrors).toEqual([widget])
    expect(useRuntimeErrors({ widget: 'orphan' }).frontendErrors).toEqual([])
})

test('view changes recalculate scope without deleting backend diagnostics', () => {
    const global = problem()
    const current = problem(['current'], ['list'])
    const other = problem(['other'], ['list'])
    selectMessages([global, current, other])

    expect(useRuntimeErrors().backendProblems).toEqual([global, current])
    mockState.view.name = 'other'
    expect(useRuntimeErrors().backendProblems).toEqual([global, other])
    expect(useRuntimeErrors({ viewOnly: true }).backendProblems).toEqual([global])
    expect(mockState.session.metaValidation).toEqual([global, current, other])
})
