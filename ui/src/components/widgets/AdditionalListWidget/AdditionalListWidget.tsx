import React from 'react'
import { Divider, Empty } from 'antd'
import { AdditionalInfoWidgetMeta, AdditionalListWidgetMeta, AppWidgetTableMeta, CustomWidgetTypes } from '@interfaces/widget'
import { useAppSelector } from '@store'
import { buildBcUrl } from '@utils/buildBcUrl'
import { AdditionalInfoItem } from '@components/widgets/AdditionalInfo/AdditionalInfoItem'
import { StandardWrapper } from '@components/widgets/AdditionalInfo/StandardWrapper'
import { DataItem } from '@cxbox-ui/core'
import { AdditionalInfoHeader } from '@components/widgets/AdditionalInfo/AdditionalInfoHeader'
import { useWidgetCollapse } from '@hooks/useWidgetCollapse'
import DebugWidgetWrapper from '@components/DebugWidgetWrapper/DebugWidgetWrapper'
import Table from '@components/widgets/Table/Table'
import { WidgetListField } from '@cxbox-ui/schema'
import styles from './AdditionalListWidget.module.css'

interface Props {
    type: CustomWidgetTypes.AdditionalList
    meta: AdditionalListWidgetMeta
}

export const AdditionalListWidget: React.FC<Props> = ({ meta }) => {
    const readWidgetName = meta.options?.read?.widget
    const additionalInfoMeta = useAppSelector(state => state.view.widgets.find(widget => widget.name === readWidgetName)) as
        | AdditionalInfoWidgetMeta
        | undefined
    const additionalInfoBcName = additionalInfoMeta?.bcName as string
    const bcUrl = buildBcUrl(additionalInfoBcName, true)
    const rowMeta = useAppSelector(state => state.view.rowMeta[additionalInfoBcName]?.[bcUrl])
    const bcData = useAppSelector(state => state.data[additionalInfoBcName] as DataItem[] | undefined)
    const debugMode = useAppSelector(state => state.session.debugMode || false)
    const showHeader = meta.fields?.some(item => (item as WidgetListField).title)

    const { isMainWidget, isCollapsed } = useWidgetCollapse(meta.name)

    const handleRow = () => ({ onClick: () => {} })

    return (
        <StandardWrapper>
            <AdditionalInfoHeader meta={meta} level={2} />
            {!(isMainWidget && isCollapsed) && (
                <>
                    {additionalInfoMeta && (
                        <>
                            {bcData?.length ? (
                                bcData.map(dataItem => {
                                    return (
                                        <React.Fragment key={dataItem.id}>
                                            <DebugWidgetWrapper debugMode={debugMode} meta={additionalInfoMeta}>
                                                <AdditionalInfoItem meta={additionalInfoMeta} rowMeta={rowMeta} cursor={dataItem.id} />
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
                                meta={meta as AppWidgetTableMeta}
                                showHeader={showHeader}
                                disablePagination={true}
                                hideRowActions={true}
                                disableCellEdit={true}
                                onRow={handleRow}
                            />
                        </div>
                    )}
                </>
            )}
        </StandardWrapper>
    )
}
