import { Modal } from 'antd'
import { useHooks } from '../hooks/useHooks.ts'
import React, { useState } from 'react'
import { ModalAnyProps } from '../components/Modals.tsx'

export const ConfirmModal: React.FC<ModalAnyProps> = ({ reject, resolve, ...props }) => {
    const hooks = useHooks()
    const [isModalOpen, setModalOpen] = useState(true)
    const popModal = hooks.useStore(state => state.closeLastModal)
    const handleCancel = () => {
        reject?.(new Error(`Confirmation cancelled`))
        setModalOpen(false)
    }
    const handleConfirm = () => {
        resolve?.({ action: 'CLOSE' })
        setModalOpen(false)
    }

    return <Modal open={isModalOpen} afterClose={popModal} onOk={handleConfirm} onCancel={handleCancel} {...props} />
}
