import React from 'react'
import { AppWidgetTableMeta } from '@interfaces/widget'
import { interfaces } from '@cxbox-ui/core'
import PassiveAssocListPopup from './PassiveAssocListPopup/PassiveAssocListPopup'
import DefaultAssocListPopup from './DefaultAssocListPopup'
import { useAppSelector } from '@store'

interface AssocListPopupProps {
    meta: AppWidgetTableMeta
}

function AssocListPopup({ meta }: AssocListPopupProps) {
    const { active } = useAppSelector(state => state.view.popupData as interfaces.PopupData)
    const isFilter = useAppSelector(state => state.view.popupData?.isFilter)

    return isFilter || active ? <DefaultAssocListPopup meta={meta} /> : <PassiveAssocListPopup meta={meta} />
}

export default React.memo(AssocListPopup)
