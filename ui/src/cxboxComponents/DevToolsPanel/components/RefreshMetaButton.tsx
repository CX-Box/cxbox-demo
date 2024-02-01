import React from 'react'
import { Button, Tooltip } from 'antd'
import { useAppDispatch } from '@store'
import { actions } from '@cxbox-ui/core'

interface RefreshMetaButtonProps {
    className?: string
}

const RefreshMetaButton: React.FunctionComponent<RefreshMetaButtonProps> = props => {
    const { className } = props
    const dispatch = useAppDispatch()
    const handleRefreshMeta = React.useCallback(() => {
        dispatch(actions.refreshMeta())
    }, [dispatch])
    return (
        <div className={className}>
            <Tooltip title={'Refresh meta'}>
                <Button onClick={handleRefreshMeta} icon="sync" />
            </Tooltip>
        </div>
    )
}

/**
 * @category Components
 */
export const MemoizedRefreshMetaButton = React.memo(RefreshMetaButton)

export default MemoizedRefreshMetaButton
