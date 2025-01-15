import React from 'react'
import { AppWidgetTableMeta } from '@interfaces/widget'
import { interfaces } from '@cxbox-ui/core'
import PassiveAssocListPopup from './PassiveAssocListPopup/PassiveAssocListPopup'
import DefaultAssocListPopup from './DefaultAssocListPopup/DefaultAssocListPopup'
import { useAppSelector } from '@store'

interface AssocListPopupProps {
    meta: AppWidgetTableMeta
}

function AssocListPopup({ meta }: AssocListPopupProps) {
    const { active, isFilter } = useAppSelector(state => state.view.popupData as interfaces.PopupData) || {}

    return isFilter || active ? <DefaultAssocListPopup meta={meta} isFilter={isFilter} /> : <PassiveAssocListPopup meta={meta} />
}

export default React.memo(AssocListPopup)
