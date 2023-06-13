import React from 'react'
import { Button } from 'antd'
import { useTranslation } from 'react-i18next'
import styles from './Pagination.less'
import { PaginationMode, PaginationProps as UsePaginationProps, usePagination } from '@cxbox-ui/core'

export interface PaginationProps extends Omit<UsePaginationProps, 'changePage'> {
    onChangePage?: UsePaginationProps['changePageAdditional']
}

/**
 * Pagination component for tables displaying business component's data
 *
 * Depending on the display mode, fires `bcLoadMore` or `bcChangePage` action
 *
 * @category Components
 */
const Pagination = ({ widgetName, mode, onChangePage }: PaginationProps) => {
    const {
        page,
        nextPage: onNextPage,
        hasNext,
        prevPage: onPrevPage,
        loading,
        loadMore: onLoadMore,
        hidePagination
    } = usePagination({
        widgetName,
        mode,
        changePageAdditional: onChangePage
    })
    const { t } = useTranslation()

    if (hidePagination) {
        return null
    }

    return mode === PaginationMode.page ? (
        <div className={styles.paginationContainer}>
            <Button className={styles.prevButton} disabled={page < 2} onClick={onPrevPage} icon="left" />
            <Button disabled={!hasNext} onClick={onNextPage} icon="right" />
        </div>
    ) : (
        <div className={styles.paginationContainer}>
            <Button onClick={onLoadMore} disabled={loading} loading={loading}>
                {t('Load more')}
            </Button>
        </div>
    )
}

/**
 * @category Components
 */
export default React.memo(Pagination)
