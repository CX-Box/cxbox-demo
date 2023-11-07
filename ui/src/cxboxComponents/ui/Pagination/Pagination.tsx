import React from 'react'
import { Button } from 'antd'
import styles from './Pagination.less'
import { useAppDispatch, useAppSelector } from '@store'
import { actions, interfaces } from '@cxbox-ui/core'
import { useTranslation } from 'react-i18next'

const { bcChangePage, bcLoadMore } = actions
const { PaginationMode } = interfaces

/**
 * Pagination component properties
 *
 * TODO: Rename PaginataionProps in 2.0.0
 */
export interface PaginationOwnProps {
    /**
     * Business component storing pagination data and loading state
     *
     * @deprecated TODO: Remove in favor of widgetName in 2.0.0
     */
    bcName?: string
    /**
     * Name of the widget showing pagination
     *
     * TODO: Will be mandatory in 2.0.0
     */
    widgetName?: string
    /**
     * Type of paginator (prev/next buttons, loadMore button, etc.)
     */
    mode: interfaces.PaginationMode
    /**
     * Callback on page change
     */
    onChangePage?: (newPage?: number) => void
}

/**
 * @deprecated Connected internally
 */
interface PaginationStateProps {
    hasNext: boolean
    page: number
    loading: boolean
    widgetName: string
}

/**
 * @deprecated Connected internally
 */
interface PaginationDispatchProps {
    changePage: (bcName: string, page: number) => void
    loadMore: (bcName: string, widgetName: string) => void
}

// TODO: Leave only own props in 2.0.0
type PaginationAllProps = PaginationOwnProps & Partial<PaginationStateProps> & Partial<PaginationDispatchProps>

/**
 * Pagination component for tables displaying business component's data
 *
 * Depending on the display mode, fires `bcLoadMore` or `bcChangePage` action
 *
 * @category Components
 */
const Pagination: React.FunctionComponent<PaginationAllProps> = ({ bcName: propsBcName, widgetName, mode, onChangePage }) => {
    const storeBcName = useAppSelector(state => state.view.widgets.find(item => item.name === widgetName)?.bcName)
    const bcName = (propsBcName || storeBcName) as string // TODO: get only from store in 2.0.0

    const hasNext = useAppSelector(state => state.screen.bo.bc[bcName]?.hasNext)
    const page = useAppSelector(state => state.screen.bo.bc[bcName]?.page) as number
    const loading = useAppSelector(state => state.screen.bo.bc[bcName]?.loading)
    const dispatch = useAppDispatch()

    const onLoadMore = React.useCallback(() => {
        dispatch(bcLoadMore({ bcName, widgetName }))
        onChangePage?.(page + 1)
    }, [bcName, widgetName, page, dispatch, onChangePage])

    const onPrevPage = React.useCallback(() => {
        const newPage = page - 1
        dispatch(bcChangePage({ bcName, page: newPage, widgetName }))
        onChangePage?.(newPage)
    }, [bcName, page, widgetName, dispatch, onChangePage])

    const onNextPage = React.useCallback(() => {
        const newPage = page + 1
        dispatch(bcChangePage({ bcName, page: newPage, widgetName }))
        onChangePage?.(newPage)
    }, [bcName, page, widgetName, dispatch, onChangePage])

    const { t } = useTranslation()

    const isRequired = hasNext || (mode === PaginationMode.page && page > 1)

    if (!isRequired) {
        return null
    }

    return mode === PaginationMode.page ? (
        <div className={styles.paginationContainer} data-test-widget-list-pagination={true}>
            <Button
                className={styles.prevButton}
                disabled={page < 2}
                icon="left"
                data-test-widget-list-pagination-prev={true}
                onClick={onPrevPage}
            />
            <Button disabled={!hasNext} icon="right" data-test-widget-list-pagination-next={true} onClick={onNextPage} />
        </div>
    ) : (
        <div className={styles.paginationContainer} data-test-widget-list-pagination={true}>
            <Button onClick={onLoadMore} disabled={loading} loading={loading} data-test-widget-list-pagination-load-more={true}>
                {t('Load more')}
            </Button>
        </div>
    )
}

/**
 * @category Components
 */
const MemoizedPagination = React.memo(Pagination)

export default MemoizedPagination
