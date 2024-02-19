import React, { FunctionComponent } from 'react'
import { connect } from 'react-redux'
import Popup, { PopupProps } from '@cxboxComponents/ui/Popup/Popup'
import styles from './PickListPopup.less'
import { Table, Skeleton, Spin } from 'antd'
import { ColumnProps } from 'antd/es/table'
import { ChangeDataItemPayload } from '@cxboxComponents/Field/Field'
import ColumnTitle from '@cxboxComponents/ColumnTitle/ColumnTitle'
import Pagination from '@cxboxComponents/ui/Pagination/Pagination'
import cn from 'classnames'
import { RootState, useAppSelector } from '@store'
import { createMapDispatchToProps } from '@utils/redux'
import { actions, interfaces } from '@cxbox-ui/core'
import { RowMetaField } from '@cxbox-ui/core/dist/interfaces'
import { TableEventListeners } from 'antd/lib/table/interface'
import { buildBcUrl } from '@utils/buildBcUrl'

const { bcRemoveAllFilters, changeDataItem, closeViewPopup, viewClearPickMap } = actions

export interface PickListPopupActions {
    onChange: (payload: ChangeDataItemPayload) => void
    onClose: () => void
}

export interface PickListPopupOwnProps extends Omit<PopupProps, 'bcName' | 'children' | 'showed'> {
    widget: interfaces.WidgetTableMeta
    className?: string
    components?: {
        title?: React.ReactNode
        table?: React.ReactNode
        footer?: React.ReactNode
    }
    disableScroll?: boolean
}

export interface PickListPopupProps extends PickListPopupOwnProps {
    /**
     * @deprecated TODO: Remove in 2.0.0, now handled by Widget.tsx
     */
    showed?: boolean

    data: interfaces.DataItem[]
    pickMap: interfaces.PickMap
    cursor: string
    parentBCName: string
    bcLoading: boolean
    rowMetaFields?: interfaces.RowMetaField[]
}

/**
 *
 * @param props
 * @category Widgets
 */
export const PickListPopup: FunctionComponent<PickListPopupProps & PickListPopupActions> = ({
    showed,
    data,
    pickMap,
    cursor,
    parentBCName,
    bcLoading,
    rowMetaFields,
    widget,
    className,
    components,
    disableScroll,
    onChange,
    onClose,
    ...rest
}) => {
    const pending = useAppSelector(state => state.session.pendingRequests?.filter(item => item.type === 'force-active'))
    const columns: Array<ColumnProps<interfaces.DataItem>> = widget.fields
        .filter(item => item.type !== interfaces.FieldType.hidden && !item.hidden)
        .map(item => {
            const fieldRowMeta = rowMetaFields?.find(field => field.key === item.key)
            return {
                title: <ColumnTitle widgetName={widget.name} widgetMeta={item} rowMeta={fieldRowMeta as RowMetaField} />,
                key: item.key,
                dataIndex: item.key,
                render: (text, dataItem) => {
                    return text
                },
                onHeaderCell: () => {
                    return {
                        'data-test-widget-list-header-column-title': item?.title,
                        'data-test-widget-list-header-column-type': item?.type,
                        'data-test-widget-list-header-column-key': item?.key
                    }
                }
            }
        })

    const onRow = React.useCallback(
        (rowData: interfaces.DataItem): TableEventListeners => {
            return {
                onClick: (e: React.MouseEvent) => {
                    if (cursor) {
                        const dataItem: interfaces.PendingDataItem = {}
                        Object.keys(pickMap).forEach(field => {
                            dataItem[field] = rowData[pickMap[field]]
                        })
                        onChange({
                            bcName: parentBCName,
                            cursor,
                            dataItem
                        })
                    }
                }
            }
        },
        [pickMap, onChange, parentBCName, cursor, onClose]
    )

    const defaultTitle = React.useMemo(
        () => (
            <div>
                <h1 className={styles.title}>{widget.title}</h1>
            </div>
        ),
        [widget.title]
    )
    const title = components?.title === undefined ? defaultTitle : components.title

    const defaultFooter = React.useMemo(
        () => (
            <div className={styles.footerContainer}>
                {!widget.options?.hierarchyFull && (
                    <div className={styles.pagination}>
                        <Pagination bcName={widget.bcName} mode={interfaces.PaginationMode.page} widgetName={widget.name} />
                    </div>
                )}
            </div>
        ),
        [widget.options?.hierarchyFull, widget.bcName, widget.name]
    )
    const footer = components?.footer === undefined ? defaultFooter : components.footer

    const defaultTable = (
        <div>
            {/* TODO: Replace with TableWidget */}
            <Table className={styles.table} columns={columns} dataSource={data} rowKey="id" onRow={onRow} pagination={false} />
        </div>
    )
    const table = bcLoading ? (
        <Skeleton loading paragraph={{ rows: 5 }} />
    ) : components?.table === undefined ? (
        defaultTable
    ) : (
        components.table
    )

    return (
        <Popup
            title={title}
            size="large"
            showed
            onOkHandler={onClose}
            onCancelHandler={onClose}
            bcName={widget.bcName}
            widgetName={widget.name}
            disablePagination={widget.options?.hierarchyFull}
            footer={footer}
            {...rest}
            className={cn(styles.container, className, { [styles.disableScroll]: disableScroll })}
        >
            <Spin spinning={(pending?.length as number) > 0}>{table}</Spin>
        </Popup>
    )
}

function mapStateToProps(state: RootState, props: PickListPopupOwnProps) {
    const bcName = props.widget.bcName
    const bcUrl = buildBcUrl(bcName, true)
    const fields = bcUrl ? state.view.rowMeta[bcName]?.[bcUrl]?.fields : undefined
    const bc = state.screen.bo.bc[bcName]
    const parentBCName = bc?.parentName
    return {
        pickMap: state.view.pickMap ?? {},
        data: state.data[props.widget.bcName],
        cursor: state.screen.bo.bc[parentBCName as string]?.cursor as string,
        parentBCName: bc?.parentName as string,
        bcLoading: bc?.loading as boolean,
        rowMetaFields: fields
    }
}

const mapDispatchToProps = createMapDispatchToProps(
    (props: PickListPopupOwnProps) => {
        return {
            bcName: props.widget.bcName
        }
    },
    ctx => {
        return {
            onChange: (payload: ChangeDataItemPayload) => {
                ctx.dispatch?.(changeDataItem({ ...payload, bcUrl: buildBcUrl(payload.bcName, true) }))
            },
            onClose: () => {
                ctx.dispatch?.(closeViewPopup(null))
                ctx.dispatch?.(viewClearPickMap(null))
                ctx.dispatch?.(bcRemoveAllFilters({ bcName: ctx.props?.bcName as string }))
            }
        }
    }
)

/**
 * @category Widgets
 */
const PickListPopupConnected = connect(mapStateToProps, mapDispatchToProps)(PickListPopup)

export default PickListPopupConnected
