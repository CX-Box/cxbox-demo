import React, { FunctionComponent } from 'react'
import { connect } from 'react-redux'
import { Dispatch } from 'redux'
import { Icon } from 'antd'
import cn from 'classnames'
import styles from './ColumnSort.less'
import { BcSorter } from '@cxbox-ui/core/interfaces/filters'
import { $do } from '../../actions/types'
import { AppState } from '../../interfaces/storeSlices'

export interface ColumnSortOwnProps {
    className?: string
    widgetName: string
    fieldKey: string
}

export interface ColumnSortProps extends ColumnSortOwnProps {
    sorter?: BcSorter
    /**
     * @deprecated TODO: Remove in 2.0.0 in favor of widget name
     */
    bcName: string
    /**
     * @deprecated TODO: Remove in 2.0.0, get page directly from the store
     */
    page?: number
    infinitePagination: boolean
    onSort: (bcName: string, sorter: BcSorter, page: number, widgetName: string, infinitePagination: boolean) => void
}

export const ColumnSort: FunctionComponent<ColumnSortProps> = props => {
    if (!props.bcName) {
        return null
    }
    let icon = 'caret-down'
    if (props.sorter) {
        icon = props.sorter.direction === 'asc' ? 'caret-up' : 'caret-down'
    }

    const handleSort = () => {
        const sorter: BcSorter = {
            fieldName: props.fieldKey,
            direction: !props.sorter ? 'desc' : props.sorter.direction === 'asc' ? 'desc' : 'asc'
        }
        props.onSort(props.bcName, sorter, props.page as number, props.widgetName, props.infinitePagination)
    }

    return <Icon className={cn(styles.icon, props.className, { [styles.forceShow]: props.sorter })} type={icon} onClick={handleSort} />
}

function mapStateToProps(store: AppState, ownProps: ColumnSortOwnProps) {
    const widget = store.view.widgets.find(item => item.name === ownProps.widgetName)
    const bcName = widget?.bcName as string
    const sorter = store.screen.sorters[bcName]?.find(item => item.fieldName === ownProps.fieldKey)
    const page = store.screen.bo.bc[bcName]?.page
    const infinitePagination = !!store.view.infiniteWidgets?.includes(ownProps.widgetName)
    return {
        bcName,
        infinitePagination,
        sorter,
        page
    }
}

function mapDispatchToProps(dispatch: Dispatch) {
    return {
        onSort: (bcName: string, sorter: BcSorter, page: number, widgetName: string, infinitePagination: boolean) => {
            dispatch($do.bcAddSorter({ bcName, sorter }))
            infinitePagination
                ? dispatch(
                      $do.bcFetchDataPages({
                          bcName: bcName,
                          widgetName: widgetName,
                          from: 1,
                          to: page
                      })
                  )
                : dispatch(
                      $do.bcForceUpdate({
                          bcName: bcName,
                          widgetName: widgetName
                      })
                  )
        }
    }
}

/**
 * @category Components
 */
export default connect(mapStateToProps, mapDispatchToProps)(ColumnSort)
