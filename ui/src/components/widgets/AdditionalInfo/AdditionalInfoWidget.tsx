import React from 'react'
import { AdditionalInfoWidgetMeta, CustomWidgetTypes } from '@interfaces/widget'
import { useAppSelector } from '@store'
import { buildBcUrl } from '@utils/buildBcUrl'
import { AdditionalInfoItem } from '@components/widgets/AdditionalInfo/AdditionalInfoItem'
import { StandardWrapper } from '@components/widgets/AdditionalInfo/StandardWrapper'

interface Props {
    type: CustomWidgetTypes.AdditionalInfo
    meta: AdditionalInfoWidgetMeta
}

export const AdditionalInfoWidget: React.FC<Props> = ({ meta }) => {
    const { bcName } = meta
    const bcUrl = buildBcUrl(bcName, true)
    const bc = useAppSelector(state => (bcName ? state.screen.bo.bc[bcName] : undefined))
    const rowMeta = useAppSelector(state => state.view.rowMeta[bcName]?.[bcUrl])

    return (
        <StandardWrapper>
            <AdditionalInfoItem meta={meta} rowMeta={rowMeta} cursor={bc?.cursor} />
        </StandardWrapper>
    )
}
