import React from 'react'
import cn from 'classnames'
import { PickListPopup as CorePickListPopup } from '@cxbox-ui/core'
import { WidgetTableMeta } from '@cxbox-ui/core/interfaces/widget'
import tableStyles from '../Table/Table.module.css'
import styles from './PickListPopup.module.css'
import Pagination from '../../ui/Pagination/Pagination'

interface PickListPopupProps {
    meta: WidgetTableMeta
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

    return <CorePickListPopup className={cn(tableStyles.tableContainer, styles.container)} widget={meta} components={components} />
}

export default React.memo(PickListPopup)
