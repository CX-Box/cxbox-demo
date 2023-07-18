import React from 'react'
import { WidgetTableMeta } from '@cxbox-ui/core/interfaces/widget'
import { TableWidget } from '@cxbox-ui/core'
import styles from './Table.less'
import Pagination from '../../ui/Pagination/Pagination'
import { TableWidgetOwnProps } from '@cxbox-ui/core/components/widgets/TableWidget/TableWidget'
import ColumnTitle from '../../ColumnTitle/ColumnTitle'

interface TableProps extends TableWidgetOwnProps {
    meta: WidgetTableMeta
}

function Table({ meta, ...rest }: TableProps) {
    return (
        <div className={styles.tableContainer}>
            <TableWidget
                meta={meta}
                showRowActions={true}
                disablePagination
                {...rest}
                columnTitleComponent={props => props && <ColumnTitle {...props} />}
            />
            <Pagination meta={meta} />
        </div>
    )
}

export default React.memo(Table)
