import React from 'react'
import { Button, Tooltip } from 'antd'
import { useAppDispatch, useAppSelector } from '@store'
import { actions } from '@cxbox-ui/core'

interface DebugModeButtonProps {
    className?: string
}

const DebugModeButton: React.FunctionComponent<DebugModeButtonProps> = props => {
    const { className } = props
    const dispatch = useAppDispatch()
    const mode = useAppSelector(state => state.session.debugMode)
    const handleDebugMode = React.useCallback(() => dispatch(actions.switchDebugMode(!mode)), [dispatch, mode])
    const tooltipTitle = 'Show meta'

    return (
        <div className={className}>
            <Tooltip title={tooltipTitle}>
                <Button icon="bug" onClick={handleDebugMode} />
            </Tooltip>
        </div>
    )
}

/**
 * @category Components
 */
const MemoizedDebugModeButton = React.memo(DebugModeButton)

export default MemoizedDebugModeButton
