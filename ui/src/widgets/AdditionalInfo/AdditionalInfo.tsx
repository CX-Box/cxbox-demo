import React from 'react'
import { AdditionalInfoWidgetMeta, CustomWidgetTypes } from '@interfaces/widget'
import { useAppSelector } from '@store'
import { buildBcUrl } from '@utils/buildBcUrl'
import { AdditionalInfoItem } from './AdditionalInfoItem'
import { StandardWrapper } from './StandardWrapper'
import EmptyCard from '@components/EmptyCard/EmptyCard'

interface Props {
    type: CustomWidgetTypes.AdditionalInfo
    meta: AdditionalInfoWidgetMeta
}

export const AdditionalInfo: React.FC<Props> = ({ meta }) => {
    const { bcName } = meta
    const bcUrl = buildBcUrl(bcName, true)
    const bc = useAppSelector(state => (bcName ? state.screen.bo.bc[bcName] : undefined))
    const rowMeta = useAppSelector(state => state.view.rowMeta[bcName]?.[bcUrl])

    return (
        <EmptyCard meta={meta}>
            <StandardWrapper>
                <AdditionalInfoItem meta={meta} rowMeta={rowMeta} cursor={bc?.cursor} />
            </StandardWrapper>
        </EmptyCard>
    )
}
