import React from 'react'
import { AdditionalInfoWidgetMeta } from '@interfaces/widget'
import { useAppSelector } from '@store'
import { buildBcUrl } from '@utils/buildBcUrl'
import { AdditionalInfoItem } from '@widgets/AdditionalInfo/AdditionalInfoItem'
import { StandardWrapper } from '@widgets/AdditionalInfo/StandardWrapper'
import { BaseWidgetProps, WidgetComponentType } from '@features/Widget'
import EmptyCard from '@components/EmptyCard/EmptyCard'
import WidgetLoader from '@components/WidgetLoader'

function assertIsAdditionalInfoMeta(meta: BaseWidgetProps['widgetMeta']): asserts meta is AdditionalInfoWidgetMeta {
    if (meta.type !== 'AdditionalInfo') {
        throw new Error('Not a AdditionalInfo meta')
    }
}

const AdditionalInfo: WidgetComponentType = ({ widgetMeta }) => {
    assertIsAdditionalInfoMeta(widgetMeta)
    const { bcName } = widgetMeta
    const bcUrl = buildBcUrl(bcName, true)
    const bc = useAppSelector(state => (bcName ? state.screen.bo.bc[bcName] : undefined))
    const rowMeta = useAppSelector(state => state.view.rowMeta[bcName]?.[bcUrl])

    return (
        <WidgetLoader widgetMeta={widgetMeta}>
            <EmptyCard meta={widgetMeta}>
                <StandardWrapper>
                    <AdditionalInfoItem meta={widgetMeta} rowMeta={rowMeta} cursor={bc?.cursor} />
                </StandardWrapper>
            </EmptyCard>
        </WidgetLoader>
    )
}

export default AdditionalInfo
