import React, { useState } from 'react'
import { Modal } from 'antd'
import { AppWidgetMeta } from '@interfaces/widget'
import CryptoGeneratorContent from '@components/CryptoGeneratorContent/CryptoGeneratorContent'

interface CryptoGeneratorModalProps {
    operationType: string
    meta: AppWidgetMeta
    onClose: () => void
}

/**
 * Popup for sign and encrypt operations.
 * While CryptoPro works and the result is uploaded, the popup cannot be closed:
 * the user sees the progress and cannot leave the screen until it ends.
 */
function CryptoGeneratorModal({ operationType, meta, onClose }: CryptoGeneratorModalProps) {
    const [inProgress, setInProgress] = useState(false)

    return (
        <Modal visible onCancel={onClose} footer={null} closable={!inProgress} maskClosable={!inProgress} keyboard={!inProgress}>
            <CryptoGeneratorContent meta={meta} operationType={operationType} onClose={onClose} onInProgressChange={setInProgress} />
        </Modal>
    )
}

export default React.memo(CryptoGeneratorModal)
