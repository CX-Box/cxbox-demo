import React from 'react'
import { WidgetMeta } from '@cxbox-ui/core'
import styles from './ArrowPagination.less'
import { Button } from 'antd'
import { usePagination } from '@hooks/usePagination'
import { useAppSelector } from '@store'
import Limit from '@components/ui/Pagination/components/Limit'
import { useWidgetPaginationLimit } from '@components/ui/Pagination/hooks/useWidgetPaginationLimit'
import { shallowEqual } from 'react-redux'

interface ArrowPaginationProps {
    meta: WidgetMeta
    disabledLimit?: boolean
    mode?: 'default' | 'smart'
}

const ArrowPagination: React.FC<ArrowPaginationProps> = ({ meta, disabledLimit, mode = 'default' }) => {
    const { hasNext, nextPage, prevPage, page: bcPage, limit: bcLimit, defaultLimit } = usePagination(meta.name)

    const limit = meta.limit || bcLimit

    const { changePageLimit, hideLimitOptions, value: pageLimit, options } = useWidgetPaginationLimit(meta)

    const { hidePagination, disabledNextButton } = useAppSelector(state => {
        const data = state.data[meta.bcName]

        if (mode === 'smart') {
            return {
                hidePagination: data?.length < limit && data?.length < defaultLimit && bcPage === 1,
                disabledNextButton: data?.length < limit
            }
        } else {
            return {
                hidePagination: !hasNext && data?.length <= defaultLimit && bcPage === 1,
                disabledNextButton: !hasNext
            }
        }
    }, shallowEqual)

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
