import React, { FunctionComponent, useMemo } from 'react'
import { connect } from 'react-redux'
import { Skeleton, Spin } from 'antd'
import TableWidget from '@cxboxComponents/widgets/TableWidget/TableWidget'
import FormWidget from '@cxboxComponents/widgets/FormWidget/FormWidget'
import InfoWidget from '@cxboxComponents/widgets/InfoWidget/InfoWidget'
import styles from '@cxboxComponents/Widget/Widget.less'
import AssocListPopup from '@cxboxComponents/widgets/AssocListPopup/AssocListPopup'
import PickListPopup from '@cxboxComponents/widgets/PickListPopup/PickListPopup'
import DebugPanel from '@cxboxComponents/DebugPanel/DebugPanel'
import NavigationTabsWidget from '@cxboxComponents/widgets/NavigationTabsWidget/NavigationTabsWidget'
import { interfaces, utils } from '@cxbox-ui/core'
import { RootState } from '@store'
import { WidgetShowCondition } from '@cxbox-ui/schema'
import { buildBcUrl } from '@utils/buildBcUrl'
import { useQuery } from '@tanstack/react-query'
import { CxBoxApiInstance } from '../api'
import { useBcLocation } from '@hooks/useBcLocation'
import get from 'lodash.get'
import * as widgets from '../widgets'
import { ErrorBoundary } from 'react-error-boundary'
import { WidgetError } from '@components/WidgetError'
import { isPopupWidget } from '@constants/widgets'
import DebugWidgetWrapper from '@components/DebugWidgetWrapper/DebugWidgetWrapper'
import { useWidgetMeta } from '../queries'
import { useData } from '../queries/useData'

interface WidgetProps {
    name: string
}

export interface WidgetAnyProps {
    bcName: string
    widgetName: string
    testingProps: Record<string, any>
}

const skeletonParams = { rows: 5 }

/**
 *
 * @param props
 * @category Components
 */
export const Widget: FunctionComponent<WidgetProps> = ({ name }) => {
    const { data: widgetMeta } = useWidgetMeta(name)
    const testingProps = useMemo(() => {
        return {
            'data-test': 'WIDGET',
            'data-test-widget-type': widgetMeta?.type,
            'data-test-widget-position': widgetMeta?.position,
            'data-test-widget-title': widgetMeta?.title,
            'data-test-widget-name': widgetMeta?.name
        }
    }, [widgetMeta])

    if (widgetMeta?.name === undefined && widgetMeta?.type === undefined) {
        return null
    }

    const WidgetComponent: React.FC<WidgetAnyProps> = get(widgets, widgetMeta.type, WidgetError)

    return <WidgetComponent widgetName={widgetMeta.name} bcName={widgetMeta.bcName} testingProps={testingProps} />
}

// function mapStateToProps(state: RootState, ownProps: WidgetOwnProps) {
//     const bcName = ownProps.meta.bcName
//     const bc = state.screen.bo.bc[bcName]
//     const parent = state.screen.bo.bc[bc?.parentName || '']
//     const hasParent = !!parent
//     const legacyPopupCheck = state.view.popupData?.bcName === bcName
//     const newPopupCheck = state.view.popupData?.widgetName ? state.view.popupData.widgetName === ownProps.meta.name : legacyPopupCheck
//     let showWidget = interfaces.PopupWidgetTypes.includes(ownProps.meta.type) ? newPopupCheck : true
//     if (
//         !utils.checkShowCondition(
//             ownProps.meta.showCondition as WidgetShowCondition,
//             state.screen.bo.bc[ownProps.meta.showCondition?.bcName as string]?.cursor || '',
//             state.data[ownProps.meta.showCondition?.bcName as string],
//             state.view.pendingDataChanges
//         )
//     ) {
//         showWidget = false
//     }
//
//     const bcUrl = buildBcUrl(bcName, true)
//     const rowMeta = bcUrl && state.view.rowMeta[bcName]?.[bcUrl]
//     return {
//         debugMode: state.session.debugMode,
//         loading: bc?.loading,
//         parentCursor: hasParent && (parent.cursor as string),
//         showWidget,
//         rowMetaExists: !!rowMeta,
//         dataExists: !!state.data[bcName]
//     }
// }
