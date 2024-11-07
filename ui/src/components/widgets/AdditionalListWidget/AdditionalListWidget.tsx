import React, { useEffect } from 'react'
import { AdditionalInfoWidgetMeta, AdditionalListWidgetMeta, CustomWidgetTypes } from '@interfaces/widget'
import { useAppSelector } from '@store'
import { buildBcUrl } from '@utils/buildBcUrl'
import { AdditionalInfoItem } from '@components/widgets/AdditionalInfo/AdditionalInfoItem'
import { StandardWrapper } from '@components/widgets/AdditionalInfo/StandardWrapper'
import { DataItem } from '@cxbox-ui/core'
import { AdditionalInfoHeader } from '@components/widgets/AdditionalInfo/AdditionalInfoHeader'
import { Divider, Empty } from 'antd'
import styles from './AdditionalListWidget.module.css'
import DebugWidgetWrapper from '@components/DebugWidgetWrapper/DebugWidgetWrapper'

interface Props {
    type: CustomWidgetTypes.AdditionalList
    meta: AdditionalListWidgetMeta
}

export const AdditionalListWidget: React.FC<Props> = ({ meta }) => {
    const additionalInfoMeta = useAppSelector(state => state.view.widgets.find(widget => widget.name === meta.options?.read?.widget)) as
        | AdditionalInfoWidgetMeta
        | undefined
    const additionalInfoBcName = additionalInfoMeta?.bcName as string
    const bcUrl = buildBcUrl(additionalInfoBcName, true)
    const rowMeta = useAppSelector(state => state.view.rowMeta[additionalInfoBcName]?.[bcUrl])
    const bcData = useAppSelector(state => state.data[additionalInfoBcName] as DataItem[] | undefined)
    const debugMode = useAppSelector(state => state.session.debugMode || false)

    useEffect(() => {
        if (!additionalInfoMeta) {
            console.info(`options.read.widget not specified for widget ${meta.name}`)
        }
    }, [additionalInfoMeta, meta.name])

    if (!additionalInfoMeta) {
        return null
    }

    return (
        <StandardWrapper>
            <AdditionalInfoHeader meta={meta} level={2} />
            {bcData?.length ? (
                bcData.map(dataItem => {
                    return (
                        <React.Fragment key={dataItem.id}>
                            <DebugWidgetWrapper debugMode={debugMode} meta={meta}>
                                <AdditionalInfoItem meta={additionalInfoMeta} rowMeta={rowMeta} cursor={dataItem.id} />
                            </DebugWidgetWrapper>
                            <Divider className={styles.divider} />
                        </React.Fragment>
                    )
                })
            ) : (
                <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />
            )}
        </StandardWrapper>
    )
}
