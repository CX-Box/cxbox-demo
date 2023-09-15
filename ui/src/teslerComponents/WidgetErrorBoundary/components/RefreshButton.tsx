import React from 'react'
import { Button } from 'antd'
import { useDispatch } from 'react-redux'
import { useTranslation } from 'react-i18next'
import { $do } from '@actions'

function RefreshButton() {
    const dispatch = useDispatch()
    const handleClick = React.useCallback(() => {
        dispatch($do.refreshMetaAndReloadPage(null))
    }, [dispatch])
    const { t } = useTranslation()
    return (
        <Button type="primary" onClick={handleClick}>
            {t('Refresh page')}
        </Button>
    )
}

export default React.memo(RefreshButton)
