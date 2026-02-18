import React, { FunctionComponent, useCallback } from 'react'
import { shallowEqual, useDispatch } from 'react-redux'
import { Icon } from 'antd'
import cn from 'classnames'
import styles from './ColumnSort.module.less'
import { actions, BcSorter } from '@cxbox-ui/core'
import { useAppSelector } from '@store'
import { AppWidgetTableMeta } from '@interfaces/widget'

export interface ColumnSortProps {
    className?: string
    widgetName: string
    fieldKey: string
}

export const ColumnSort: FunctionComponent<ColumnSortProps> = ({ widgetName, fieldKey, className }) => {
    const { hideSort, sorter, toggleSort } = useSorter(widgetName, fieldKey)

    if (hideSort) {
        return null
    }

    return (
        <div
            className={cn(styles.container, className, {
                [styles.forceShow]: sorter,
                [styles.desc]: sorter?.direction === 'desc',
                [styles.asc]: sorter?.direction === 'asc'
            })}
            onClick={toggleSort}
            data-test-widget-list-header-column-sort={true}
        >
            <Icon type={'caret-up'} />
            <Icon type={'caret-down'} />
        </div>
    )
}

export default ColumnSort

export function useSorter(widgetName: string, fieldKey: string) {
    const { bcName, sorters, page, infinitePagination, permanentSorterFields, defaultSort } = useAppSelector(state => {
        const widget = state.view.widgets.find(item => item.name === widgetName) as AppWidgetTableMeta | undefined
        const bcName = widget?.bcName as string
        const sorters = state.screen.sorters[bcName] as BcSorter[] | undefined
        const page = state.screen.bo.bc[bcName]?.page
        const infinitePagination = !!state.view.infiniteWidgets?.includes(widgetName)
        const permanentSorterFields = widget?.options?.groupingHierarchy?.fields
        const defaultSort = state.screen.bo.bc[bcName]?.defaultSort
        return { bcName, infinitePagination, sorters, page, permanentSorterFields, defaultSort }
    }, shallowEqual)

    const fieldSorter = sorters?.find(item => item.fieldName === fieldKey)

    const dispatch = useDispatch()

    const setSort = useCallback(
        (newSorter: BcSorter | BcSorter[]) => {
            dispatch(actions.bcAddSorter({ bcName, sorter: newSorter }))

            infinitePagination
                ? dispatch(
                      actions.bcFetchDataPages({
                          bcName,
                          widgetName,
                          from: 1,
                          to: page
                      })
                  )
                : dispatch(
                      actions.bcForceUpdate({
                          bcName,
                          widgetName
                      })
                  )
        },
        [bcName, dispatch, infinitePagination, page, widgetName]
    )

    const toggleSort = useCallback(() => {
        const newSorters = sorters?.filter(sorter => sorter.fieldName === fieldKey || permanentSorterFields?.includes(sorter.fieldName))
        if (!permanentSorterFields || !newSorters) {
            let direction: 'desc' | 'asc' = 'desc'
            if (fieldSorter?.direction === 'desc') {
                direction = 'asc'
            }
            if (fieldSorter?.direction === 'asc') {
                if (defaultSort) {
                    const sortParams = Array.from(new URLSearchParams(defaultSort))
                    const [sorter, fieldName] = sortParams[0]
                    if (sorter.includes('asc')) {
                        direction = 'desc'
                    }
                    setSort({
                        fieldName: fieldName,
                        direction: direction
                    })
                } else {
                    setSort([])
                }
                return
            }
            setSort({
                fieldName: fieldKey,
                direction: direction
            })
            return
        }

        if (permanentSorterFields && newSorters) {
            const currentFieldSorterIndex = newSorters?.findIndex(item => item.fieldName === fieldKey) ?? -1

            if (currentFieldSorterIndex !== -1) {
                const oldFieldSorter = newSorters?.[currentFieldSorterIndex]
                if (oldFieldSorter.direction === 'desc') {
                    newSorters[currentFieldSorterIndex] = {
                        ...oldFieldSorter,
                        direction: 'asc'
                    }
                }
                if (oldFieldSorter.direction === 'asc') {
                    const disableRemoveSorter = Array.from(new URLSearchParams(defaultSort)).findIndex(
                        ([_, fieldName]) => fieldName === fieldKey
                    )
                    if (disableRemoveSorter !== -1) {
                        newSorters[currentFieldSorterIndex] = {
                            ...oldFieldSorter,
                            direction: 'desc'
                        }
                    } else {
                        newSorters.splice(currentFieldSorterIndex, 1)
                    }
                }
            } else {
                newSorters?.push({
                    fieldName: fieldKey,
                    direction: !fieldSorter ? 'desc' : fieldSorter.direction === 'asc' ? 'desc' : 'asc'
                })
            }

            setSort(newSorters)

            return
        }
    }, [sorters, permanentSorterFields, fieldKey, fieldSorter, setSort, defaultSort])

    return {
        sorter: fieldSorter,
        hideSort: !bcName,
        toggleSort
    }
}
