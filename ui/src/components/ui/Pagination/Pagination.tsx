import React, { useCallback } from 'react'
import { shallowEqual, useDispatch } from 'react-redux'
import { Pagination as AntPagination } from 'antd'
import styles from './Pagination.less'
import { interfaces } from '@cxbox-ui/core'
import { useAppSelector } from '@store'
import Limit from '@components/ui/Pagination/components/Limit'
import { AppWidgetMeta } from '@interfaces/widget'
import { actions } from '@actions'

export interface PaginationProps {
    meta: interfaces.WidgetMeta
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
                <Limit className={styles.limits} value={pageLimit} onChange={changePageLimit} total={total} options={options} />
            )}
        </div>
    )
}
export default React.memo(Pagination)

const useWidgetPaginationLimit = (widget: AppWidgetMeta) => {
    const { hideLimitOptions = false, defaultLimit: widgetPageLimit, availableLimitsList } = widget.options?.pagination ?? {}
    const bcPageLimit = useAppSelector(state => state.screen.bo.bc[widget.bcName].limit)
    const localPageLimit = useAppSelector(state => state.screen.pagination[widget.bcName]?.limit)

    const dispatch = useDispatch()

    const changePageLimit = useCallback(
        (value: number) => {
            dispatch(actions.changePageLimit({ bcName: widget.bcName, limit: value }))
            dispatch(actions.bcChangePage({ bcName: widget.bcName, page: 1 }))
        },
        [dispatch, widget.bcName]
    )

    return {
        hideLimitOptions,
        changePageLimit,
        value: localPageLimit ?? widgetPageLimit ?? bcPageLimit,
        options: availableLimitsList
    }
}
