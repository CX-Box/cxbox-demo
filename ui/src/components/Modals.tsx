import { useHooks } from '../hooks/useHooks.ts'
import * as modalComponents from '../modals'
import get from 'lodash.get'
import React from 'react'
import { PromiseResolvePayload } from '../core/data/slices/Modal.ts'

export interface ModalAnyProps {
    resolve?: (data: PromiseResolvePayload<'CLOSE'>) => void
    reject?: (error: Error) => void
}

export const Modals = () => {
    const hooks = useHooks()
    const modals = hooks.useStore(state => state.modals)

    return modals.map(modal => {
        const Modal: React.FC<ModalAnyProps> = get(modalComponents, modal.componentType, () => <div>error</div>)
        return <Modal key={modal.id} resolve={modal.resolve} reject={modal.reject} {...modal.props} />
    })
}
