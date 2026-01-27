import React, { memo, useCallback } from 'react'
import { useDispatch } from 'react-redux'
import { useTranslation } from 'react-i18next'
import cn from 'classnames'
import Popup from '@components/Popup/Popup'
import Pagination from '../../../ui/Pagination/Pagination'
import Button from '../../../ui/Button/Button'
import SelectionTable from './SelectionTable'
import Title from './Title'
import { useAppSelector } from '@store'
import { actions } from '@cxbox-ui/core'
import { AppWidgetTableMeta } from '@interfaces/widget'
import styles from '../AssocListPopup.less'

interface PassiveAssocListPopupProps {
    meta: AppWidgetTableMeta
}

function PassiveAssocListPopup({ meta }: PassiveAssocListPopupProps) {
    const assocValueKey = useAppSelector(state => state.view.popupData?.assocValueKey ?? '')

    const dispatch = useDispatch()

    const onClose = useCallback(() => {
        dispatch(actions.closeViewPopup({ bcName: meta.bcName }))
    }, [meta.bcName, dispatch])

    const { t } = useTranslation()

    return (
        <Popup
            className={cn(styles.container)}
            title={<Title title={meta.title} widgetName={meta.name} assocValueKey={assocValueKey} />}
            showed
            onCancelHandler={onClose}
            bcName={meta.bcName}
            widgetName={meta.name}
            footer={
                <>
                    <Pagination meta={meta} />
                    <div className={styles.actions}>
                        <Button data-test-widget-list-close={true} onClick={onClose}>
                            {t('Close')}
                        </Button>
                    </div>
                </>
            }
        >
            <SelectionTable meta={meta} disablePagination={true} />
        </Popup>
    )
}

export default memo(PassiveAssocListPopup)
