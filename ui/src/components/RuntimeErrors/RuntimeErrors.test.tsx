import React from 'react'
import { expect, test, vi } from 'vitest'
import { renderToStaticMarkup } from 'react-dom/server'
import { RuntimeError } from '@interfaces/session'
import RuntimeErrors from './RuntimeErrors'

vi.mock('@store', () => ({
    useAppSelector: (selector: (state: typeof mockState) => unknown) => selector(mockState),
    useAppDispatch: () => () => {}
}))
vi.mock('@actions', () => ({ actions: {} }))
vi.mock('@components/ui/ActionLink/ActionLink', () => ({ default: () => null }))
vi.mock('@components/ui/CopyableText/CopyableText', () => ({
    default: ({ text }: { text: string }) => text
}))
vi.mock('antd', () => {
    return {
        Popover: ({ content, children }: { content: React.ReactNode; children: React.ReactNode }) =>
            React.createElement('div', null, content, children),
        Tooltip: ({ children }: { children: React.ReactNode }) => children,
        Icon: () => null
    }
})

const message = (text: string, views: string[], widgets: string[]) => ({
    validatorName: 'example',
    title: 'Example',
    message: text,
    views,
    widgets,
    executionFailed: false
})
const mockState = {
    session: {
        metaValidation: [
            message('Unbound issue', [], []),
            message('Widget issue', ['current'], ['list', 'orphan']),
            message('Orphan issue', [], ['orphan']),
            message('Other view issue', ['other'], ['list'])
        ],
        runtimeErrors: new Array<RuntimeError>(),
        debugMode: true
    },
    view: { name: 'current', widgets: [{ name: 'list' }] }
}

test('summary groups only current-screen errors and puts unbound errors under the current view', () => {
    const html = renderToStaticMarkup(<RuntimeErrors />)

    expect(html).toContain('data-test-runtime-errors-errors="2"')
    expect(html).toContain('data-test-runtime-errors-place="View"')
    expect(html).toContain('data-test-runtime-errors-place="Widget"')
    expect(html).toContain('&quot;name&quot;: &quot;current&quot;')
    expect(html).toContain('&quot;name&quot;: &quot;list&quot;')
    expect(html).toContain('Unbound issue')
    expect(html.match(/Widget issue/g)).toHaveLength(1)
    expect(html).not.toContain('Orphan issue')
    expect(html).not.toContain('orphan')
    expect(html).not.toContain('Other view issue')
    expect(html).not.toContain('data-test-runtime-errors-place="Other"')
})

test('view badge contains unbound issues and excludes all widget issues', () => {
    const html = renderToStaticMarkup(<RuntimeErrors viewOnly />)

    expect(html).toContain('data-test-runtime-errors-errors="1"')
    expect(html).toContain('Unbound issue')
    expect(html).not.toContain('Widget issue')
    expect(html).not.toContain('Orphan issue')
})

test('widget badge contains only its own issues', () => {
    const html = renderToStaticMarkup(<RuntimeErrors widget="list" />)

    expect(html).toContain('data-test-runtime-errors-errors="1"')
    expect(html).toContain('Widget issue')
    expect(html).not.toContain('Unbound issue')
    expect(html).not.toContain('Other view issue')
})

test('empty validation array leaves frontend diagnostics without an empty backend section', () => {
    const messages = mockState.session.metaValidation
    mockState.session.metaValidation = []
    mockState.session.runtimeErrors = [{ level: 'error', message: 'Frontend only', count: 1 }]

    try {
        const html = renderToStaticMarkup(<RuntimeErrors />)

        expect(html).toContain('Frontend only')
        expect(html).not.toContain('Backend (')
        expect(html).not.toContain('No backend problems')
    } finally {
        mockState.session.metaValidation = messages
        mockState.session.runtimeErrors = []
    }
})
