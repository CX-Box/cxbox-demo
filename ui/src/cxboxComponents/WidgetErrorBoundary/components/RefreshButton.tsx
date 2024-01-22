import React from 'react'
import { Button } from 'antd'
import { useAppDispatch } from '@store'
import { actions } from '@cxbox-ui/core'
import { useTranslation } from 'react-i18next'

const { refreshMetaAndReloadPage } = actions

function RefreshButton() {
    const dispatch = useAppDispatch()
    const handleClick = React.useCallback(() => {
        dispatch(refreshMetaAndReloadPage(null))
    }, [dispatch])
    const { t } = useTranslation()
    return (
        <Button type="primary" onClick={handleClick}>
            {t('Refresh page')}
        </Button>
    )
}

export default React.memo(RefreshButton)
