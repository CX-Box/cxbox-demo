import React from 'react'
import ConfirmWithForm from '@components/widgets/Table/massOperations/Confirm/ConfirmWithForm'
import SimpleConfirm from '@components/widgets/Table/massOperations/Confirm/SimpleConfirm'

interface ConfirmProps {
    widgetName: string
}

const Confirm: React.FC<ConfirmProps> = ({ widgetName }) => {
    if (!widgetName) {
        return null
    }

    return (
        <div>
            <ConfirmWithForm widgetName={widgetName} />
            <SimpleConfirm widgetName={widgetName} />
        </div>
    )
}

export default React.memo(Confirm)
