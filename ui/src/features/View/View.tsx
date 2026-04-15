import React from 'react'
import { useAppSelector } from '@store'
import DebugViewInfoLabel from '@components/DebugViewInfoLabel/DebugViewInfoLabel'
import FileViewerPopup from '@components/FileViewerContainer/FileViewerContainer'
import WaitUntilPopup from '@components/WaitUntilPopup/WaitUntilPopup'
import NotificationsContainer from '@components/NotificationsContainer/NotificationsContainer'
import styles from './View.module.css'
import Layout from '@features/Layout'
import { WidgetTypes, utils, interfaces } from '@cxbox-ui/core'
import { CustomWidgetTypes } from '@interfaces/widget'

const NOOP = () => null

/**
 * FOR LEGACY PURPOSES ONLY, APPLIED ONLY FOR EPICS LOGIC
 */
export const customWidgets: Partial<Record<CustomWidgetTypes | interfaces.WidgetTypes, interfaces.CustomWidgetDescriptor>> = {
    [CustomWidgetTypes.FormPopup]: { component: NOOP, isPopup: true },
    [WidgetTypes.AssocListPopup]: NOOP,
    [WidgetTypes.PickListPopup]: NOOP
}

utils.extendPopupWidgetTypes(customWidgets)

function View() {
    const widgets = useAppSelector(state => state.view.widgets)

    return (
        <div className={styles.container}>
            <DebugViewInfoLabel />
            <FileViewerPopup />
            <WaitUntilPopup />
            <NotificationsContainer />
            <Layout widgets={widgets} />
        </div>
    )
}

export default React.memo(View)
