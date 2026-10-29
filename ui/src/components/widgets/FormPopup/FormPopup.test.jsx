import React from 'react'
import { render, unmountComponentAtNode } from 'react-dom'
import { act } from 'react-dom/test-utils'
import { FormPopup } from './FormPopup'

const mockDispatch = jest.fn()

let mockState = createState(false)

function createState(forceActive) {
    return {
        screen: {
            bo: {
                bc: {
                    testBc: {
                        loading: false
                    }
                }
            }
        },
        session: {
            pendingRequests: forceActive ? [{ requestId: 'request', type: 'force-active' }] : []
        }
    }
}

jest.mock('@store', () => ({
    useAppDispatch: () => mockDispatch,
    useAppSelector: selector => selector(mockState)
}))

jest.mock('@actions', () => ({
    actions: {
        forceUpdateRowMeta: jest.fn(payload => ({ type: 'forceUpdateRowMeta', payload }))
    }
}))

jest.mock('@hooks/popup', () => ({
    usePopupVisibility: () => ({
        popupData: {},
        closePopup: jest.fn(),
        visibility: true
    })
}))

jest.mock('@hooks/useOperationInProgress', () => ({
    useOperationInProgress: () => () => false
}))

jest.mock('../../Popup/Popup', () => ({ children }) => <div>{children}</div>)

jest.mock('@components/WidgetTitle/WidgetTitle', () => () => null)

jest.mock('../Form/Form', () => () => <div data-testid="form">Form</div>)

describe('FormPopup', () => {
    let container

    beforeEach(() => {
        container = document.createElement('div')
        document.body.appendChild(container)
        mockState = createState(false)
        mockDispatch.mockClear()
    })

    afterEach(() => {
        unmountComponentAtNode(container)
        container.remove()
    })

    it('keeps the displayed form mounted while row meta is refreshed', () => {
        const meta = { name: 'testPopup', bcName: 'testBc' }

        act(() => {
            render(<FormPopup meta={meta} />, container)
        })
        expect(container.querySelector('[data-testid="form"]')).not.toBeNull()

        mockState = createState(true)
        act(() => {
            render(<FormPopup meta={meta} />, container)
        })

        expect(container.querySelector('[data-testid="form"]')).not.toBeNull()
        expect(container.querySelector('[data-test-loading]')).toBeNull()
    })
})
