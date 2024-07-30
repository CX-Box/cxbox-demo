import React from 'react'
import { shallowEqual, useDispatch } from 'react-redux'
import { Pagination as AntPagination } from 'antd'
import styles from './DefaultPagination.less'
import { interfaces } from '@cxbox-ui/core'
import { useAppSelector } from '@store'
import Limit from '@components/ui/Pagination/components/Limit'
import { actions } from '@actions'
import { useWidgetPaginationLimit } from '@components/ui/Pagination/hooks/useWidgetPaginationLimit'

export interface DefaultPaginationProps {
    meta: interfaces.WidgetMeta
    disabledLimit?: boolean
}

function DefaultPagination({ meta, disabledLimit }: DefaultPaginationProps) {
    const dispatch = useDispatch()

    const { bcName, limit: metaLimit } = meta
    const { bcLimit, page } = useAppSelector(state => {
        const bc = bcName ? state.screen.bo.bc[bcName] : undefined
        return {
            bcLimit: bc?.limit,
            page: bc?.page
        }
    }, shallowEqual)
    const total = useAppSelector(state => state.view.bcRecordsCount[bcName]?.count)
    const limit = metaLimit || bcLimit

    const handlePageChange = React.useCallback(
        (p: number) => {
            dispatch(actions.bcChangePage({ bcName, page: p }))
        },
        [dispatch, bcName]
    )

    const { changePageLimit, hideLimitOptions, value: pageLimit, options } = useWidgetPaginationLimit(meta)

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
            {!hideLimitOptions && (
                <Limit
                    className={styles.limits}
                    classNameContainer={styles.limitContainer}
                    disabled={disabledLimit}
                    value={pageLimit}
                    onChange={changePageLimit}
                    total={total}
                    options={options}
                />
            )}
        </div>
    )
}
export default React.memo(DefaultPagination)
