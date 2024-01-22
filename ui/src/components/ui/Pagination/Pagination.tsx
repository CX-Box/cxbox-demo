import React from 'react'
import { useDispatch } from 'react-redux'
import { Pagination as AntPagination } from 'antd'
import styles from './Pagination.less'
import { actions, interfaces } from '@cxbox-ui/core'
import { useAppSelector } from '@store'

export interface PaginationProps {
    meta: interfaces.WidgetTableMeta
}

function Pagination({ meta }: PaginationProps) {
    const dispatch = useDispatch()

    const { bcName, limit: metaLimit } = meta
    const { bcLimit, page } = useAppSelector(state => {
        const bc = state.screen.bo.bc[bcName]
        return {
            bcLimit: bc?.limit,
            page: bc?.page
        }
    })
    const total = useAppSelector(state => state.view.bcRecordsCount[bcName]?.count)
    const limit = metaLimit || bcLimit

    const handlePageChange = React.useCallback(
        (p: number) => {
            dispatch(actions.bcChangePage({ bcName, page: p }))
        },
        [dispatch, bcName]
    )

    if (!total) {
        return null
    }

    return (
        <div className={styles.container} data-test-widget-list-pagination={true}>
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
