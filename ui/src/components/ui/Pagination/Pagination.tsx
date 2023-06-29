import React from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Pagination as AntPagination } from 'antd'
import styles from './Pagination.less'
import { $do } from '../../../actions/types'
import { WidgetTableMeta } from '@cxbox-ui/core/interfaces/widget'
import { AppState } from '../../../interfaces/storeSlices'

export interface PaginationProps {
    meta: WidgetTableMeta
}

function Pagination({ meta }: PaginationProps) {
    const dispatch = useDispatch()

    const { bcName, limit: metaLimit } = meta
    const { bcLimit, page } = useSelector((state: AppState) => {
        const bc = state.screen.bo.bc[bcName]
        return {
            bcLimit: bc?.limit,
            page: bc?.page
        }
    })
    const total = useSelector((state: AppState) => state.view.bcRecordsCount[bcName]?.count)
    const limit = metaLimit || bcLimit

    const handlePageChange = React.useCallback(
        (p: number) => {
            dispatch($do.bcChangePage({ bcName, page: p }))
        },
        [dispatch, bcName]
    )

    if (!total) {
        return null
    }

    return (
        <div className={styles.container}>
            <AntPagination
                className={styles.pagination}
                size="small"
                pageSize={limit}
                defaultCurrent={page}
                current={page}
                total={total}
                onChange={handlePageChange}
            />
        </div>
    )
}
export default React.memo(Pagination)
