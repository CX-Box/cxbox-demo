import React, { useMemo } from 'react'
import { WidgetAnyProps } from '@components/Widget'
import { useData } from '../queries'
import { Table } from 'antd'
import { useTableWidgetMeta } from '../queries'
import { ColumnProps } from 'antd/es/table'
import { DataItem } from '@interfaces/core'
import { useBcCursor } from '../queries/useBcCursor'

export const List: React.FC<WidgetAnyProps> = ({ widgetName, bcName }) => {
    const { data } = useData(bcName)
    const { data: widgetMeta } = useTableWidgetMeta(widgetName)
    const [cursor, setCursor] = useBcCursor(bcName)

    const columns = useMemo(
        () =>
            widgetMeta?.fields.map<ColumnProps<DataItem>>(field => ({
                title: field.title,
                key: field.key,
                dataIndex: field.key,
                render: text => JSON.stringify(text)
            })) || [],
        [widgetMeta]
    )

    const selectedRowKey = data?.data.findIndex(val => val.id === cursor) || 0

    return (
        <div>
            <h1>LIST WIDGET</h1>
            <h2>{widgetMeta?.title}</h2>
            <Table
                dataSource={data?.data}
                columns={columns}
                rowSelection={{
                    type: 'radio',
                    selectedRowKeys: [selectedRowKey !== -1 ? selectedRowKey : 0],
                    onChange: (selectedRowKeys, selectedRows) => {
                        setCursor(selectedRows[0].id)
                    }
                }}
            />
        </div>
    )
}
