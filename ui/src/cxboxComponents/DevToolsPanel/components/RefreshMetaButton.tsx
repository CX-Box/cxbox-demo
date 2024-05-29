import React from 'react'
import { Button, Tooltip } from 'antd'
import { useMeta } from '../../../queries'

interface RefreshMetaButtonProps {
    className?: string
}

const RefreshMetaButton: React.FunctionComponent<RefreshMetaButtonProps> = props => {
    const { className } = props
    const { refetch } = useMeta()

    const handleRefreshMeta = React.useCallback(() => {
        refetch()
    }, [refetch])

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
