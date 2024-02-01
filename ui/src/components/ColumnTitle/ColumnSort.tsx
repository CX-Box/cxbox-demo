import React, { FunctionComponent } from 'react'
import { connect } from 'react-redux'
import { Dispatch } from 'redux'
import { Icon } from 'antd'
import cn from 'classnames'
import styles from './ColumnSort.less'
import { actions, interfaces } from '@cxbox-ui/core'
import { RootState } from '@store'

export interface ColumnSortOwnProps {
    className?: string
    widgetName: string
    fieldKey: string
}

export interface ColumnSortProps extends ColumnSortOwnProps {
    sorter?: interfaces.BcSorter
    /**
     * @deprecated TODO: Remove in 2.0.0 in favor of widget name
     */
    bcName: string
    /**
     * @deprecated TODO: Remove in 2.0.0, get page directly from the store
     */
    page?: number
    infinitePagination: boolean
    onSort: (bcName: string, sorter: interfaces.BcSorter, page: number, widgetName: string, infinitePagination: boolean) => void
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
        const sorter: interfaces.BcSorter = {
            fieldName: props.fieldKey,
            direction: !props.sorter ? 'desc' : props.sorter.direction === 'asc' ? 'desc' : 'asc'
        }
        props.onSort(props.bcName, sorter, props.page as number, props.widgetName, props.infinitePagination)
    }

    return (
        <Icon
            className={cn(styles.icon, props.className, { [styles.forceShow]: props.sorter })}
            type={icon}
            data-test-widget-list-header-column-sort={true}
            onClick={handleSort}
        />
    )
}

function mapStateToProps(state: RootState, ownProps: ColumnSortOwnProps) {
    const widget = state.view.widgets.find(item => item.name === ownProps.widgetName)
    const bcName = widget?.bcName as string
    const sorter = state.screen.sorters[bcName]?.find(item => item.fieldName === ownProps.fieldKey)
    const page = state.screen.bo.bc[bcName]?.page
    const infinitePagination = !!state.view.infiniteWidgets?.includes(ownProps.widgetName)
    return {
        bcName,
        infinitePagination,
        sorter,
        page
    }
}

function mapDispatchToProps(dispatch: Dispatch) {
    return {
        onSort: (bcName: string, sorter: interfaces.BcSorter, page: number, widgetName: string, infinitePagination: boolean) => {
            dispatch(actions.bcAddSorter({ bcName, sorter }))
            infinitePagination
                ? dispatch(
                      actions.bcFetchDataPages({
                          bcName: bcName,
                          widgetName: widgetName,
                          from: 1,
                          to: page
                      })
                  )
                : dispatch(
                      actions.bcForceUpdate({
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
