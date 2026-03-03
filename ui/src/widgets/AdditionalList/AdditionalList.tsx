import React from 'react'
import { Divider, Empty } from 'antd'
import { AdditionalInfoWidgetMeta, AdditionalListWidgetMeta, AppWidgetTableMeta } from '@interfaces/widget'
import { useAppSelector } from '@store'
import { AdditionalInfoItem } from '@widgets/AdditionalInfo/AdditionalInfoItem'
import { StandardWrapper } from '@widgets/AdditionalInfo/StandardWrapper'
import { DataItem } from '@cxbox-ui/core'
import { AdditionalInfoHeader } from '@widgets/AdditionalInfo/AdditionalInfoHeader'
import { useWidgetCollapse } from '@hooks/useWidgetCollapse'
import DebugWidgetWrapper from '@components/DebugWidgetWrapper/DebugWidgetWrapper'
import Table from '@components/Table/Table'
import { WidgetListField } from '@cxbox-ui/schema'
import styles from './AdditionalList.module.css'
import { BaseWidgetProps, WidgetComponentType } from '@features/Widget'
import EmptyCard from '@components/EmptyCard/EmptyCard'

function assertIsAdditionalList(meta: BaseWidgetProps['widgetMeta']): asserts meta is AdditionalListWidgetMeta {
    if (meta.type !== 'AdditionalList') {
        throw new Error('Not a AdditionalList meta')
    }
}

const AdditionalList: WidgetComponentType = ({ widgetMeta }) => {
    assertIsAdditionalList(widgetMeta)
    const readWidgetName = widgetMeta.options?.read?.widget
    const additionalInfoMeta = useAppSelector(state => state.view.widgets.find(widget => widget.name === readWidgetName)) as
        | AdditionalInfoWidgetMeta
        | undefined
    const additionalInfoBcName = additionalInfoMeta?.bcName as string
    const bcData = useAppSelector(state => state.data[additionalInfoBcName] as DataItem[] | undefined)
    const showHeader = widgetMeta.fields?.some(item => (item as WidgetListField).title)

    const { isMainWidget, isCollapsed } = useWidgetCollapse(widgetMeta.name)

    const handleRow = () => ({ onClick: () => {} })

    return (
        <EmptyCard meta={widgetMeta}>
            <StandardWrapper>
                <AdditionalInfoHeader meta={widgetMeta} level={2} />
                {!(isMainWidget && isCollapsed) && (
                    <>
                        {additionalInfoMeta && (
                            <>
                                {bcData?.length ? (
                                    bcData.map(dataItem => {
                                        return (
                                            <React.Fragment key={dataItem.id}>
                                                <DebugWidgetWrapper meta={additionalInfoMeta}>
                                                    <AdditionalInfoItem meta={additionalInfoMeta} cursor={dataItem.id} />
                                                </DebugWidgetWrapper>
                                                <Divider className={styles.divider} />
                                            </React.Fragment>
                                        )
                                    })
                                ) : (
                                    <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />
                                )}
                            </>
                        )}
                        {!readWidgetName && (
                            <div className={styles.container}>
                                <Table
                                    rowClassName={undefined}
                                    meta={widgetMeta as AppWidgetTableMeta}
                                    showHeader={showHeader}
                                    disablePagination={true}
                                    hideRowActions={true}
                                    disableCellEdit={true}
                                    disableMassMode={true}
                                    onRow={handleRow}
                                />
                            </div>
                        )}
                    </>
                )}
            </StandardWrapper>
        </EmptyCard>
    )
}

export default AdditionalList
