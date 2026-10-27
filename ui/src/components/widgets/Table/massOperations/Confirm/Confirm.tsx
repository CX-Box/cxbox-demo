import React from 'react'
import ConfirmWithForm from '@components/widgets/Table/massOperations/Confirm/ConfirmWithForm'
import SimpleConfirm from '@components/widgets/Table/massOperations/Confirm/SimpleConfirm'

interface ConfirmProps {
    widgetName: string
    /**
     * Called instead of sending the confirmed action and gets this sending.
     * Mass signing asks for the certificates and signs the rows before it calls `send`
     */
    onConfirm?: (send: () => void) => void
    /**
     * Leaves the mass operation, called by the cancel button of the confirm
     */
    onCancel: () => void
}

const Confirm: React.FC<ConfirmProps> = ({ widgetName, onConfirm, onCancel }) => {
    if (!widgetName) {
        return null
    }

    return (
        <div>
            <ConfirmWithForm widgetName={widgetName} onConfirm={onConfirm} onCancel={onCancel} />
            <SimpleConfirm widgetName={widgetName} onConfirm={onConfirm} onCancel={onCancel} />
        </div>
    )
}

export default React.memo(Confirm)
