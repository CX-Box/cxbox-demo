import React, { useMemo } from 'react'
import { WidgetAnyProps } from '@components/Widget'
import { useData, useScreenBcPath } from '../hooks/queries'
import { Button, Table } from 'antd'
import { useTableWidgetMeta } from '../hooks/queries'
import { ColumnProps } from 'antd/es/table'
import { DataItem } from '@interfaces/core'
import { useRowMeta } from '@hooks/queries/useRowMeta'

export const List: React.FC<WidgetAnyProps> = ({ widgetName, bcName }) => {
    const { data } = useData(bcName)
    const { data: widgetMeta } = useTableWidgetMeta(widgetName)
    const { cursor, setCursor } = useScreenBcPath(bcName)

    const { data: rowMeta } = useRowMeta(bcName)

    const columns = useMemo(() => {
        const metaColumns = widgetMeta?.fields.map<ColumnProps<DataItem>>(field => ({
            title: field.title,
            key: field.key,
            dataIndex: field.key,
            render: text => JSON.stringify(text)
        }))

        if (metaColumns) {
            metaColumns.push({
                title: 'actions',
                render: (_, record) => (
                    <>
                        <Button onClick={() => setCursor(record.id)}>...</Button>
                        {record.id === cursor && rowMeta?.actions.map(action => action.text)}
                    </>
                )
            })
        }

        return metaColumns || []
    }, [widgetMeta?.fields, cursor, rowMeta?.actions, setCursor])

    const selectedRowKey = data?.data.findIndex(val => val.id === cursor) || 0

    return (
        <div>
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
