import { FC, useMemo } from 'react'
import { WidgetAnyProps } from '../components/Widget.tsx'
import { TableProps } from 'antd/es/table'
import { Table } from 'antd'
import { Field } from '../components/Field.tsx'
import { useHooks } from '../hooks/useHooks.ts'
import { FilterFilled } from '@ant-design/icons'
import { isWidgetList } from '../core/contract/widgets'
import { DataItem } from '../core/contract/data'

export const List: FC<WidgetAnyProps> = ({ widgetName }) => {
    const hooks = useHooks()
    const { data: widgetMeta } = hooks.useTypedWidgetMeta(isWidgetList, widgetName)
    const bcName = widgetMeta?.bcName || ''
    const { data, isLoading: isDataLoading } = hooks.useData(bcName)
    const bc = hooks.useStore(state => state.bcTree.find(bc => bc.name === bcName))

    //define case of table editing
    const isTableReadonly = widgetMeta?.options.readOnly || widgetMeta?.options.edit?.style === 'none'
    const isTableInlineEdit = widgetMeta?.options.edit?.style === 'inline'
    const isTableInlineFormEdit = widgetMeta?.options.edit?.style === 'inlineForm' || !!widgetMeta?.options.edit?.widget
    const isTablePopupFormEdit = widgetMeta?.options.edit?.style === 'popup'

    const tableProps = useMemo(() => {
        const props: TableProps<DataItem> = {
            columns: []
        }

        widgetMeta?.fields?.forEach(field => {
            const column: NonNullable<typeof props.columns>[number] = {
                title: field.title,
                key: field.key,
                dataIndex: field.key,
                width: field.width
            }

            column.filterDropdown = ({ close }) => (
                <Field.Filter fieldKey={field.key} type={field.type} widgetName={widgetName} onClose={close} />
            )

            column.filterDropdownProps = {
                destroyOnHidden: true
            }

            const filter = bc?.filters.find(f => f.fieldKey === field.key)

            column.filterIcon = () => <FilterFilled style={{ color: filter ? '#fff' : '#888' }} />

            if (isTableInlineFormEdit) {
                column.render = (value, record) => (
                    <Field.Read fieldKey={field.key} id={record.id} type={field.type} widgetName={widgetName}>
                        {value}
                    </Field.Read>
                )
            }

            if (isTablePopupFormEdit) {
                column.render = (value, record) => (
                    <Field.Read fieldKey={field.key} id={record.id} type={field.type} widgetName={widgetName}>
                        {value}
                    </Field.Read>
                )
            }

            if (isTableInlineEdit) {
                column.render = (value, record) => (
                    <Field.Read fieldKey={field.key} id={record.id} type={field.type} widgetName={widgetName}>
                        {value}
                    </Field.Read>
                )
            }

            if (isTableReadonly || (!isTableReadonly && !isTableInlineFormEdit && !isTablePopupFormEdit)) {
                column.render = (value, record) => (
                    <Field.Read fieldKey={field.key} id={record.id} type={field.type} widgetName={widgetName}>
                        {value}
                    </Field.Read>
                )
            }

            props.columns?.push(column)
        })

        props.pagination = {
            position: ['bottomRight']
        }

        return props
    }, [bc?.filters, isTableInlineEdit, isTableInlineFormEdit, isTablePopupFormEdit, isTableReadonly, widgetMeta?.fields, widgetName])

    return (
        <div>
            <Table<DataItem> dataSource={data?.data} rowKey={record => record.id} loading={isDataLoading} {...tableProps} />
        </div>
    )
}
