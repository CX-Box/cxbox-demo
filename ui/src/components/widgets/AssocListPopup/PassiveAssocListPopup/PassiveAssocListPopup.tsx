import React from 'react'
import cn from 'classnames'
import { AssocListPopup as CoreAssocListPopup, useTranslation } from '@cxbox-ui/core'
import tableStyles from '../../Table/Table.less'
import assocListStyles from '../AssocListPopup.less'
import Pagination from '../../../ui/Pagination/Pagination'
import { useDispatch } from 'react-redux'
import { $do } from '../../../../actions/types'
import Button from '../../../ui/Button/Button'
import AssocTable from './AssocTable'
import { AppWidgetTableMeta } from '../../../../interfaces/widget'
import Title from './Title'

interface PassiveAssocListPopupProps {
    meta: AppWidgetTableMeta
}

function PassiveAssocListPopup({ meta }: PassiveAssocListPopupProps) {
    const dispatch = useDispatch()

    const onClose = React.useCallback(() => {
        dispatch($do.closeViewPopup({ bcName: meta.bcName }))
    }, [meta.bcName, dispatch])

    const { t } = useTranslation()
    return (
        <CoreAssocListPopup
            className={cn(tableStyles.tableContainer, assocListStyles.container)}
            widget={meta}
            components={{
                title: <Title title={meta.title} />,
                table: <AssocTable meta={meta} disablePagination={true} />,
                footer: (
                    <>
                        <Pagination meta={meta} />
                        <div className={assocListStyles.actions}>
                            <Button data-test-widget-list-close={true} onClick={onClose}>
                                {t('Close')}
                            </Button>
                        </div>
                    </>
                )
            }}
        />
    )
}

export default React.memo(PassiveAssocListPopup)
