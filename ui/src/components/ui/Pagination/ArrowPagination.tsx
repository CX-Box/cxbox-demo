import React from 'react'
import { Button } from 'antd'
import Limit from './components/Limit'
import AlternativePaginationButton from './components/AlternativePaginationButton/AlternativePaginationButton'
import { useWidgetPaginationLimit } from '@features/pagination/hooks/useWidgetPaginationLimit'
import { usePagination } from '@hooks/usePagination'
import { useAppSelector } from '@store'
import { PAGINATION_MODES, PaginationMode } from '@constants/pagination'
import { AppWidgetMeta } from '@interfaces/widget'
import { usePaginationControls } from '@features/pagination/hooks/usePaginationControls'
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

    const loadedCount = useAppSelector(state => state.data[meta.bcName]?.length ?? 0)
    const controls = usePaginationControls({
        type: mode === 'smart' ? PAGINATION_MODES.nextAndPreviousSmart : PAGINATION_MODES.nextAndPreviousWithHasNext,
        page: bcPage,
        limit,
        defaultLimit,
        loadedCount,
        hasNext
    })

    if (!controls.visible) {
        return null
    }

    return (
        <div className={styles.container} data-test-widget-list-pagination={true}>
            <div className={styles.arrows}>
                <Button
                    className={styles.prevButton}
                    disabled={controls.previousDisabled}
                    icon="left"
                    data-test-widget-list-pagination-prev={true}
                    onClick={prevPage}
                />

                <Button disabled={controls.nextDisabled} icon="right" data-test-widget-list-pagination-next={true} onClick={nextPage} />
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
