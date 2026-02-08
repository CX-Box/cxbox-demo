import React from 'react'
import { shallowEqual } from 'react-redux'
import { Button } from 'antd'
import Limit from './components/Limit'
import AlternativePaginationButton from './components/AlternativePaginationButton/AlternativePaginationButton'
import { useWidgetPaginationLimit } from './hooks/useWidgetPaginationLimit'
import { usePagination } from '@hooks/usePagination'
import { useAppSelector } from '@store'
import { PaginationMode } from '@constants/pagination'
import { AppWidgetMeta } from '@interfaces/widget'
import styles from './ArrowPagination.less'

interface ArrowPaginationProps {
    meta: AppWidgetMeta
    alternativeType?: PaginationMode
    disabledLimit?: boolean
    mode?: 'default' | 'smart'
}

const ArrowPagination: React.FC<ArrowPaginationProps> = ({ meta, alternativeType, disabledLimit, mode = 'default' }) => {
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
                <>
                    <Limit
                        className={styles.limits}
                        classNameContainer={styles.limitContainer}
                        disabled={disabledLimit}
                        value={pageLimit}
                        onChange={changePageLimit}
                        total={null}
                        options={options}
                    />

                    {alternativeType && <AlternativePaginationButton widgetName={meta.name} alternativeType={alternativeType} />}
                </>
            )}
        </div>
    )
}

export default React.memo(ArrowPagination)
