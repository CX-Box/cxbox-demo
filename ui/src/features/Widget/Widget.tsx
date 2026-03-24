import React from 'react'
import { connect } from 'react-redux'
import { Skeleton, Spin } from 'antd'
import { useWidgetCollapse } from '@hooks/useWidgetCollapse'
import { PopupWidgetTypes, utils } from '@cxbox-ui/core'
import { RootState } from '@store'
import { WidgetShowCondition } from '@cxbox-ui/schema'
import { buildBcUrl } from '@utils/buildBcUrl'
import { ScreenState } from '../../reducers/screen'
import DebugWidgetWrapper from '@components/DebugWidgetWrapper/DebugWidgetWrapper'
import { AppWidgetMeta } from '@interfaces/widget'
import { lazy, Suspense, useMemo } from 'react'

export interface BaseWidgetProps {
    widgetMeta: AppWidgetMeta
}

export interface WidgetComponentType<P = BaseWidgetProps> extends React.FC<P> {}

interface WidgetProps extends BaseWidgetProps {
    debugMode: boolean
    loading?: boolean
    parentCursor?: string
    showWidget: boolean
    rowMetaExists: boolean
    dataExists: boolean
    bc?: ScreenState['bo']['bc'][string]
}

/**
 *
 * @param props
 * @category Components
 */
const Widget: React.FC<WidgetProps> = props => {
    const { isMainWidget, isCollapsed } = useWidgetCollapse(props.widgetMeta.name)
    const widgetType = props.widgetMeta.type

    const WidgetComponent = useMemo(
        () =>
            lazy<WidgetComponentType>(() =>
                import(`@widgets/${widgetType}/index`).catch(() => ({
                    default: () => <div>Виджет {widgetType} не найден</div>
                }))
            ),
        [widgetType]
    )

    if (!props.showWidget || (!isMainWidget && isCollapsed)) {
        return <DebugWidgetWrapper meta={props.widgetMeta} />
    }

    const widgetHasBc = props.widgetMeta.bcName !== null && props.widgetMeta.bcName !== ''

    const widgetElement =
        props.bc || !widgetHasBc ? (
            <Suspense fallback={<span>Loading...</span>}>
                <WidgetComponent widgetMeta={props.widgetMeta} />
            </Suspense>
        ) : null

    return <DebugWidgetWrapper meta={props.widgetMeta}>{widgetElement}</DebugWidgetWrapper>
}

function mapStateToProps(state: RootState, ownProps: BaseWidgetProps) {
    const bcName = ownProps.widgetMeta.bcName
    const bc = bcName ? state.screen.bo.bc[bcName] : undefined
    const parent = state.screen.bo.bc[bc?.parentName || '']
    const hasParent = !!parent
    const legacyPopupCheck = state.view.popupData?.bcName === bcName
    const newPopupCheck = state.view.popupData?.widgetName ? state.view.popupData.widgetName === ownProps.widgetMeta.name : legacyPopupCheck
    let showWidget = PopupWidgetTypes.includes(ownProps.widgetMeta.type) ? newPopupCheck : true
    if (
        !utils.checkShowCondition(
            ownProps.widgetMeta.showCondition as WidgetShowCondition,
            state.screen.bo.bc[ownProps.widgetMeta.showCondition?.bcName as string]?.cursor || '',
            state.data[ownProps.widgetMeta.showCondition?.bcName as string],
            state.view.pendingDataChanges
        )
    ) {
        showWidget = false
    }

    const bcUrl = buildBcUrl(bcName, true)
    const rowMeta = bcUrl && state.view.rowMeta[bcName]?.[bcUrl]
    return {
        debugMode: state.session.debugMode || false,
        loading: bc?.loading,
        parentCursor: hasParent && (parent.cursor as string),
        showWidget,
        rowMetaExists: !!rowMeta,
        dataExists: !!state.data[bcName],
        bc
    }
}

export default connect(mapStateToProps)(Widget)
