import React from 'react'
import cn from 'classnames'
import { PickListPopup as CorePickListPopup } from '@cxbox-ui/core'
import tableStyles from '../Table/Table.less'
import styles from './PickListPopup.module.css'
import Pagination from '../../ui/Pagination/Pagination'
import { AppState } from '../../../interfaces/storeSlices'
import { useSelector } from 'react-redux'
import AssocListPopup from '../AssocListPopup/AssocListPopup'
import { AppWidgetTableMeta } from '../../../interfaces/widget'

interface PickListPopupProps {
    meta: AppWidgetTableMeta
}

function PickListPopup({ meta }: PickListPopupProps) {
    const customFooter = React.useMemo(() => {
        if (!meta.options?.hierarchyFull) {
            return <Pagination meta={meta} />
        }
        return null
    }, [meta])

    const components: {
        title?: React.ReactNode
        table?: React.ReactNode
        footer?: React.ReactNode
    } = {
        footer: customFooter
    }

    const showAssocFilter = useShowAssocFilter()

    if (showAssocFilter) {
        return <AssocListPopup meta={meta} />
    }

    return <CorePickListPopup className={cn(tableStyles.tableContainer, styles.container)} widget={meta} components={components} />
}

export default React.memo(PickListPopup)

function useShowAssocFilter() {
    return useSelector((state: AppState) => !!state.view.popupData?.isFilter)
}
