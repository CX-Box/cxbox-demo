import React from 'react'
import { AppWidgetTableMeta } from '../../../interfaces/widget'
import { PopupData } from '@cxbox-ui/core/interfaces/view'
import PassiveAssocListPopup from './PassiveAssocListPopup/PassiveAssocListPopup'
import ActiveAssocListPopup from './ActiveAssocListPopup'
import { useAppSelector } from '../../../hooks/useAppSelector'

interface AssocListPopupProps {
    meta: AppWidgetTableMeta
}

function AssocListPopup({ meta }: AssocListPopupProps) {
    const { active } = useAppSelector(store => store.view.popupData as PopupData)

    return active ? <ActiveAssocListPopup meta={meta} /> : <PassiveAssocListPopup meta={meta} />
}

export default React.memo(AssocListPopup)
