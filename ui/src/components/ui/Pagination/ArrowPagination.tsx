import React from 'react'
import { WidgetMeta } from '@cxbox-ui/core'
import styles from './ArrowPagination.less'
import { Button } from 'antd'
import { usePagination } from '@hooks/usePagination'
import { useAppSelector } from '@store'
import Limit from '@components/ui/Pagination/components/Limit'
import { useWidgetPaginationLimit } from '@components/ui/Pagination/hooks/useWidgetPaginationLimit'

interface ArrowPaginationProps {
    meta: WidgetMeta
    disabledLimit?: boolean
}

const ArrowPagination: React.FC<ArrowPaginationProps> = ({ meta, disabledLimit }) => {
    const { hasNext, nextPage, prevPage, page: bcPage, limit: bcLimit } = usePagination(meta.name)
    const data = useAppSelector(state => state.data[meta.bcName])
    const limit = meta.limit || bcLimit

    const hardCodeHidePagination = hasNext && data?.length < limit && bcPage === 1
    const hidePagination = (!hasNext && bcPage === 1) || hardCodeHidePagination
    const hardCodeDisabledNextButton = hasNext && data?.length < limit
    const disabledNextButton = !hasNext || hardCodeDisabledNextButton

    const { changePageLimit, hideLimitOptions, value: pageLimit, options } = useWidgetPaginationLimit(meta)

    if (hidePagination) {
        return null
    }

    return (
        <div className={styles.container} data-test-widget-list-pagination={true}>
            <div className={styles.arrows}>
                <Button
                    className={styles.prevButton}
                    disabled={bcPage < 2}
                    icon="left"
                    data-test-widget-list-pagination-prev={true}
                    onClick={prevPage}
                />
                <Button disabled={disabledNextButton} icon="right" data-test-widget-list-pagination-next={true} onClick={nextPage} />
            </div>
            {!hideLimitOptions && (
                <Limit
                    className={styles.limits}
                    classNameContainer={styles.limitContainer}
                    disabled={disabledLimit}
                    value={pageLimit}
                    onChange={changePageLimit}
                    total={null}
                    options={options}
                />
            )}
        </div>
    )
}

export default React.memo(ArrowPagination)
