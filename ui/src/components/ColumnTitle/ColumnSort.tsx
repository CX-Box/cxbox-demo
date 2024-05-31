import React, { FunctionComponent, useCallback } from 'react'
import { shallowEqual, useDispatch } from 'react-redux'
import { Icon } from 'antd'
import cn from 'classnames'
import styles from './ColumnSort.less'
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

    const icon = sorter?.direction === 'asc' ? 'caret-up' : 'caret-down'

    return (
        <Icon
            className={cn(styles.icon, className, { [styles.forceShow]: sorter })}
            type={icon}
            data-test-widget-list-header-column-sort={true}
            onClick={toggleSort}
        />
    )
}

export default ColumnSort

export function useSorter(widgetName: string, fieldKey: string) {
    const { bcName, sorters, page, infinitePagination, permanentSorterFields } = useAppSelector(state => {
        const widget = state.view.widgets.find(item => item.name === widgetName) as AppWidgetTableMeta | undefined
        const bcName = widget?.bcName as string
        const sorters = state.screen.sorters[bcName] as BcSorter[] | undefined
        const page = state.screen.bo.bc[bcName]?.page
        const infinitePagination = !!state.view.infiniteWidgets?.includes(widgetName)
        const permanentSorterFields = widget?.options?.groupingHierarchy?.fields

        return { bcName, infinitePagination, sorters, page, permanentSorterFields }
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
            setSort({
                fieldName: fieldKey,
                direction: !fieldSorter ? 'desc' : fieldSorter.direction === 'asc' ? 'desc' : 'asc'
            })

            return
        }

        if (permanentSorterFields && newSorters) {
            const currentFieldSorterIndex = newSorters?.findIndex(item => item.fieldName === fieldKey) ?? -1

            if (currentFieldSorterIndex !== -1) {
                const oldFieldSorter = newSorters?.[currentFieldSorterIndex]

                newSorters[currentFieldSorterIndex] = {
                    ...oldFieldSorter,
                    direction: oldFieldSorter?.direction === 'asc' ? 'desc' : 'asc'
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
    }, [sorters, permanentSorterFields, fieldKey, setSort, fieldSorter])

    return {
        sorter: fieldSorter,
        hideSort: !bcName,
        toggleSort
    }
}
