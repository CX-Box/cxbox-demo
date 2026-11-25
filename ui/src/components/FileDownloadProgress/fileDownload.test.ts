import { configureStore } from '@reduxjs/toolkit'
import { actions } from '@cxbox-ui/core'
import { beforeEach, expect, test, vi } from 'vitest'
import { allNotificationsClosed } from '@actions'
import { fileDownloadActions, fileDownloadReducer } from '../../slices/fileDownload'

vi.mock('@cxbox-ui/core', async () => {
    const { createAction } = await import('@reduxjs/toolkit')
    return {
        actions: {
            logout: createAction('logout'),
            logoutDone: createAction('logoutDone'),
            switchRole: createAction('switchRole')
        }
    }
})

const store = configureStore({ reducer: fileDownloadReducer })
const { addFile, updateFile, clearFiles } = fileDownloadActions

beforeEach(() => {
    store.dispatch(clearFiles())
    store.dispatch(addFile({ uid: 'first', name: 'first.pdf' }))
    store.dispatch(updateFile({ uid: 'first', status: 'error', errorMessage: 'File unavailable' }))
    store.dispatch(addFile({ uid: 'pending', name: 'pending.pdf' }))
})

test.each([
    { reason: 'Close all', dismiss: () => store.dispatch(allNotificationsClosed()) },
    { reason: 'logout', dismiss: () => store.dispatch(actions.logout(null)) },
    { reason: 'switch role', dismiss: () => store.dispatch(actions.switchRole({ role: 'other' })) }
])('$reason clears old rows and a later download starts with its own row', ({ dismiss }) => {
    dismiss()
    expect(store.getState()).toEqual([])

    store.dispatch(addFile({ uid: 'next', name: 'next.pdf' }))
    store.dispatch(updateFile({ uid: 'pending', status: 'done' }))
    expect(store.getState()).toEqual([{ uid: 'next', name: 'next.pdf', id: null, status: 'init', percent: 0 }])
})

test('the logoutDone event used by a metadata refresh preserves download rows', () => {
    const files = store.getState()
    store.dispatch(actions.logoutDone(null))
    expect(store.getState()).toBe(files)
})
