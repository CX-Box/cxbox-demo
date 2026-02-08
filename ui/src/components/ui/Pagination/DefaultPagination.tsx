import React from 'react'
import { Pagination as AntPagination } from 'antd'
import Limit from '@components/ui/Pagination/components/Limit'
import AlternativePaginationButton from './components/AlternativePaginationButton/AlternativePaginationButton'
import { useWidgetPaginationLimit } from './hooks/useWidgetPaginationLimit'
import { usePagination } from '@hooks/usePagination'
import { PaginationMode } from '@constants/pagination'
import { AppWidgetMeta } from '@interfaces/widget'
import styles from './DefaultPagination.less'

export interface DefaultPaginationProps {
    meta: AppWidgetMeta
    alternativeType?: PaginationMode
    disabledLimit?: boolean
}

function DefaultPagination({ meta, alternativeType, disabledLimit }: DefaultPaginationProps) {
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
                <>
                    <Limit
                        className={styles.limits}
                        classNameContainer={styles.limitContainer}
                        disabled={disabledLimit}
                        value={pageLimit}
                        onChange={changePageLimit}
                        total={total}
                        options={options}
                    />

                    {alternativeType && <AlternativePaginationButton widgetName={meta.name} alternativeType={alternativeType} />}
                </>
            )}
        </div>
    )
}
export default React.memo(DefaultPagination)
