import React, { FC, FunctionComponent } from 'react'
import { connect } from 'react-redux'
import { Skeleton, Spin } from 'antd'
import { useWidgetCollapse } from '@hooks/useWidgetCollapse'
import { PopupWidgetTypes, utils, WidgetMeta, WidgetMetaAny } from '@cxbox-ui/core'
import { RootState } from '@store'
import { WidgetShowCondition } from '@cxbox-ui/schema'
import { buildBcUrl } from '@utils/buildBcUrl'
import { ScreenState } from '../../reducers/screen'
import DebugWidgetWrapper from '@components/DebugWidgetWrapper/DebugWidgetWrapper'
import get from 'lodash/get'
import * as widgets from '@widgets'
import EmptyWidget from '@components/EmptyWidget/EmptyWidget'

interface WidgetOwnProps {
    meta: WidgetMeta | WidgetMetaAny
}

interface WidgetProps extends WidgetOwnProps {
    debugMode: boolean
    loading?: boolean
    parentCursor?: string
    showWidget: boolean
    rowMetaExists: boolean
    dataExists: boolean
    bc?: ScreenState['bo']['bc'][string]
}

interface FCWithDescription<T> extends FC<T> {
    isPopup?: boolean
}

const skeletonParams = { rows: 5 }

/**
 *
 * @param props
 * @category Components
 */
const Widget: FunctionComponent<WidgetProps> = props => {
    const { isMainWidget, isCollapsed } = useWidgetCollapse(props.meta.name)

    if (!props.showWidget || (!isMainWidget && isCollapsed)) {
        return <DebugWidgetWrapper meta={props.meta} />
    }

    const WidgetComponent: FCWithDescription<WidgetOwnProps> = get(widgets, props.meta.type, EmptyWidget)
    // TODO We need to remove PopupWidgetTypes from the core and replace imports throughout the entire project
    const isPopup = WidgetComponent.isPopup

    const widgetHasBc = props.meta.bcName !== null && props.meta.bcName !== ''

    const widgetElement = props.bc || !widgetHasBc ? <WidgetComponent meta={props.meta} /> : null

    if (isPopup) {
        return (
            <DebugWidgetWrapper meta={props.meta}>
                <div
                    data-test="WIDGET"
                    data-test-widget-type={props.meta.type}
                    data-test-widget-position={props.meta.position}
                    data-test-widget-title={props.meta.title}
                    data-test-widget-name={props.meta.name}
                >
                    {widgetElement}
                </div>
            </DebugWidgetWrapper>
        )
    }

    const showSpinner = !!(props.loading && (props.rowMetaExists || props.dataExists))
    const showSkeleton = props.loading && !showSpinner

    // TODO 2.0.0 delete spinner and skeleton. Spinner and skeleton should be overridden by props.card component
    const WidgetParts = (
        <>
            {showSkeleton && (
                <div data-test-loading={true}>
                    <Skeleton loading paragraph={skeletonParams} />
                </div>
            )}
            {!showSkeleton && <Spin spinning={showSpinner}>{widgetElement}</Spin>}
        </>
    )

    return (
        <DebugWidgetWrapper meta={props.meta}>
            <div
                data-test="WIDGET"
                data-test-widget-type={props.meta.type}
                data-test-widget-position={props.meta.position}
                data-test-widget-title={props.meta.title}
                data-test-widget-name={props.meta.name}
            >
                {WidgetParts}
            </div>
        </DebugWidgetWrapper>
    )
}

function mapStateToProps(state: RootState, ownProps: WidgetOwnProps) {
    const bcName = ownProps.meta.bcName
    const bc = bcName ? state.screen.bo.bc[bcName] : undefined
    const parent = state.screen.bo.bc[bc?.parentName || '']
    const hasParent = !!parent
    const legacyPopupCheck = state.view.popupData?.bcName === bcName
    const newPopupCheck = state.view.popupData?.widgetName ? state.view.popupData.widgetName === ownProps.meta.name : legacyPopupCheck
    let showWidget = PopupWidgetTypes.includes(ownProps.meta.type) ? newPopupCheck : true
    if (
        !utils.checkShowCondition(
            ownProps.meta.showCondition as WidgetShowCondition,
            state.screen.bo.bc[ownProps.meta.showCondition?.bcName as string]?.cursor || '',
            state.data[ownProps.meta.showCondition?.bcName as string],
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
