/*
 * TESLER-UI
 * Copyright (C) 2018-2020 Tesler Contributors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import React from 'react'
import { Button } from 'antd'
import { useDispatch, useSelector } from 'react-redux'
import { useTranslation } from 'react-i18next'
import { Store } from '@interfaces/store'
import styles from './Pagination.less'
import { PaginationMode } from '@cxbox-ui/core'
import { $do } from '@actions/types'

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
    mode: PaginationMode
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
    const storeBcName = useSelector((store: Store) => store.view.widgets.find(item => item.name === widgetName)?.bcName)
    const bcName = propsBcName || storeBcName // TODO: get only from store in 2.0.0

    const hasNext = useSelector((store: Store) => store.screen.bo.bc[bcName]?.hasNext)
    const page = useSelector((store: Store) => store.screen.bo.bc[bcName]?.page)
    const loading = useSelector((store: Store) => store.screen.bo.bc[bcName]?.loading)
    const dispatch = useDispatch()

    const onLoadMore = React.useCallback(() => {
        dispatch($do.bcLoadMore({ bcName, widgetName }))
        onChangePage?.(page + 1)
    }, [bcName, widgetName, page, dispatch, onChangePage])

    const onPrevPage = React.useCallback(() => {
        const newPage = page - 1
        dispatch($do.bcChangePage({ bcName, page: newPage, widgetName }))
        onChangePage?.(newPage)
    }, [bcName, page, widgetName, dispatch, onChangePage])

    const onNextPage = React.useCallback(() => {
        const newPage = page + 1
        dispatch($do.bcChangePage({ bcName, page: newPage, widgetName }))
        onChangePage?.(newPage)
    }, [bcName, page, widgetName, dispatch, onChangePage])

    const { t } = useTranslation()

    const isRequired = hasNext || (mode === PaginationMode.page && page > 1)

    if (!isRequired) {
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
const MemoizedPagination = React.memo(Pagination)

export default MemoizedPagination
