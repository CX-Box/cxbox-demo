import { WidgetAnyProps } from '../components/Widget.tsx'
import React from 'react'
import { useHooks } from '../hooks/useHooks.ts'
import { Modal } from 'antd'
import { WidgetWIP } from '../components/WidgetWIP.tsx'

export const PickListPopup: React.FC<WidgetAnyProps> = props => {
    const hooks = useHooks()
    const isOpen = hooks.useStore(state => state.widgetModals[props.widgetName])
    const closeWidgetModal = hooks.useStore(state => state.closeWidgetModal)

    return (
        <Modal destroyOnHidden open={isOpen} onCancel={() => closeWidgetModal(props.widgetName)}>
            <PickListPopupContent {...props} />
        </Modal>
    )
}

const PickListPopupContent: React.FC<WidgetAnyProps> = () => {
    // const hooks = useHooks()
    // const { data: widgetMeta } = hooks.useTypedWidgetMeta(isWidgetPickListPopup, widgetName)
    // const { data, isLoading } = hooks.useData(widgetMeta?.bcName || '')

    // const tableProps = useMemo(() => {
    //     const props: TableProps<DataItem> = {}
    //
    //     props.columns = widgetMeta?.fields.map(field => ({
    //         title: field.title,
    //         key: field.key,
    //         dataIndex: field.key,
    //         width: field.width,
    //         render: (value, record) => (
    //             <Field.Read key={field.key} type={field.type} widgetName={widgetName} fieldKey={field.key} id={record.id}>
    //                 {value}
    //             </Field.Read>
    //         )
    //     }))
    //
    //     return props
    // }, [widgetMeta?.fields, widgetName])

    // return <Table<DataItem> dataSource={data?.data} loading={isLoading} {...tableProps} />
    return <WidgetWIP type={'PickListPopup'} />
}
