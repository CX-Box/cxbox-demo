import React from 'react'
import { interfaces, WidgetTableMeta } from '@cxbox-ui/core'
import PassiveAssocListPopup from './PassiveAssocListPopup/PassiveAssocListPopup'
import DefaultAssocListPopup from './DefaultAssocListPopup/DefaultAssocListPopup'
import { useAppSelector } from '@store'
import { WidgetComponentType } from '@features/Widget'

const AssocListPopup: WidgetComponentType = ({ widgetMeta }) => {
    const { active, isFilter } = useAppSelector(state => state.view.popupData as interfaces.PopupData) || {}

    return isFilter || active ? (
        <DefaultAssocListPopup meta={widgetMeta as WidgetTableMeta} isFilter={isFilter} />
    ) : (
        <PassiveAssocListPopup meta={widgetMeta as WidgetTableMeta} />
    )
}

export default React.memo(AssocListPopup)
