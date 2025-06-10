import React from 'react'
import { Pagination as AntPagination } from 'antd'
import styles from './DefaultPagination.less'
import { interfaces } from '@cxbox-ui/core'
import Limit from '@components/ui/Pagination/components/Limit'
import { useWidgetPaginationLimit } from '@components/ui/Pagination/hooks/useWidgetPaginationLimit'
import { usePagination } from '@hooks/usePagination'

export interface DefaultPaginationProps {
    meta: interfaces.WidgetMeta
    disabledLimit?: boolean
}

function DefaultPagination({ meta, disabledLimit }: DefaultPaginationProps) {
    const { changePage, page: bcPage, limit: bcLimit, total } = usePagination(meta.name)

    const limit = meta.limit || bcLimit

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
                defaultCurrent={bcPage}
                current={bcPage}
                total={total}
                onChange={changePage}
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
