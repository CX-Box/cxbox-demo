import React from 'react'
import { Button, Tooltip } from 'antd'
import { useTranslation } from 'react-i18next'
import { useDispatch } from 'react-redux'
import { $do } from '@actions'

interface RefreshMetaButtonProps {
    className?: string
}

const RefreshMetaButton: React.FunctionComponent<RefreshMetaButtonProps> = props => {
    const { className } = props
    const dispatch = useDispatch()
    const handleRefreshMeta = React.useCallback(() => {
        dispatch($do.refreshMeta(null))
    }, [dispatch])
    const { t } = useTranslation()
    return (
        <div className={className}>
            <Tooltip title={t('Refresh meta')}>
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
