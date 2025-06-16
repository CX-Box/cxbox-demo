import { StateCreator } from 'zustand'
import { UnionState } from './index.ts'
import { produce } from 'immer'

export type PromiseResolvePayload<A extends string> = { action: A }

interface Modal {
    id: string
    componentType: string
    props?: { [key: string]: unknown }
    resolve: (data: PromiseResolvePayload<'CLOSE'>) => void
    reject: (error: Error) => void
}

interface WidgetModal {
    [widgetName: string]: boolean
}

export interface ModalState {
    modals: Modal[]
    widgetModals: WidgetModal
    showNewModal: (options: Modal) => void
    closeLastModal: () => void
    clearModalStack: () => void
    openWidgetModal: (widgetName: string) => void
    closeWidgetModal: (widgetName: string) => void
    resetWidgetModals: () => void
}

export const createModalSlice: StateCreator<UnionState, [], [], ModalState> = set => ({
    modals: [],
    widgetModals: {},
    showNewModal: (options: Modal) =>
        set(
            produce((state: UnionState) => {
                state.modals.push(options)
            })
        ),
    closeLastModal: () =>
        set(
            produce((state: UnionState) => {
                state.modals.pop()
            })
        ),
    clearModalStack: () =>
        set(
            produce((state: UnionState) => {
                state.modals = []
            })
        ),
    openWidgetModal: (widgetName: string) =>
        set(
            produce((state: UnionState) => {
                state.widgetModals[widgetName] = true
            })
        ),
    closeWidgetModal: (widgetName: string) =>
        set(
            produce((state: UnionState) => {
                state.widgetModals[widgetName] = false
            })
        ),
    resetWidgetModals: () =>
        set(
            produce((state: UnionState) => {
                state.widgetModals = {}
            })
        )
})
