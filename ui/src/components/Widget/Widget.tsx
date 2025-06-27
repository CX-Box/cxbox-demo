import React, { FunctionComponent } from 'react'
import { connect } from 'react-redux'
import { Skeleton, Spin } from 'antd'
import { useWidgetCollapse } from '@hooks/useWidgetCollapse'
import { CustomWidgetDescriptor, isCustomWidget, PopupWidgetTypes, utils, WidgetMeta, WidgetMetaAny } from '@cxbox-ui/core'
import { RootState } from '@store'
import { WidgetShowCondition } from '@cxbox-ui/schema'
import { buildBcUrl } from '@utils/buildBcUrl'
import { ScreenState } from '../../reducers/screen'
import styles from './Widget.less'
import DebugWidgetWrapper from '@components/DebugWidgetWrapper/DebugWidgetWrapper'

interface WidgetOwnProps {
    meta: WidgetMeta | WidgetMetaAny
    card?: (props: any) => React.ReactElement<any>
    customSpinner?: (props: any) => React.ReactElement<any>
    children?: React.ReactNode
}

interface WidgetProps extends WidgetOwnProps {
    debugMode: boolean
    loading?: boolean
    parentCursor?: string
    customWidgets?: Record<string, CustomWidgetDescriptor>
    showWidget: boolean
    rowMetaExists: boolean
    dataExists: boolean
    bc?: ScreenState['bo']['bc'][string]
}

const skeletonParams = { rows: 5 }

/**
 *
 * @param props
 * @category Components
 */
export const Widget: FunctionComponent<WidgetProps> = props => {
    const { isMainWidget, isCollapsed } = useWidgetCollapse(props.meta.name)

    if (!props.showWidget || (!isMainWidget && isCollapsed)) {
        return <DebugWidgetWrapper meta={props.meta} />
    }

    const customWidget = props.customWidgets?.[props.meta.type]
    // TODO We need to remove PopupWidgetTypes from the core and replace imports throughout the entire project
    const skipCardWrapping = PopupWidgetTypes.includes(props.meta.type)

    const widgetHasBc = props.meta.bcName !== null && props.meta.bcName !== ''

    const widgetElement = props.bc || !widgetHasBc ? chooseWidgetType(props.meta, props.customWidgets, props.children) : null

    if (skipCardWrapping) {
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

    const spinnerElement = props.customSpinner ? (
        <props.customSpinner spinning={showSpinner}>{widgetElement}</props.customSpinner>
    ) : (
        <Spin spinning={showSpinner}>{widgetElement}</Spin>
    )

    // TODO 2.0.0 delete spinner and skeleton. Spinner and skeleton should be overridden by props.card component
    const WidgetParts = (
        <>
            {showSkeleton && (
                <div data-test-loading={true}>
                    <Skeleton loading paragraph={skeletonParams} />
                </div>
            )}
            {!showSkeleton && spinnerElement}
        </>
    )

    if (customWidget && !isCustomWidget(customWidget)) {
        if (customWidget.card === null) {
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

        if (customWidget.card) {
            const CustomCard = customWidget.card
            return (
                <DebugWidgetWrapper meta={props.meta}>
                    <CustomCard meta={props.meta}>{WidgetParts}</CustomCard>
                </DebugWidgetWrapper>
            )
        }
    }

    if (props.card) {
        const Card = props.card
        return (
            <DebugWidgetWrapper meta={props.meta}>
                <Card meta={props.meta}>{WidgetParts}</Card>
            </DebugWidgetWrapper>
        )
    }

    return (
        <DebugWidgetWrapper meta={props.meta}>
            <div
                className={styles.container}
                data-test="WIDGET"
                data-test-widget-type={props.meta.type}
                data-test-widget-position={props.meta.position}
                data-test-widget-title={props.meta.title}
                data-test-widget-name={props.meta.name}
            >
                <h2 className={styles.title}>{props.meta.title}</h2>
                {WidgetParts}
            </div>
        </DebugWidgetWrapper>
    )
}

/**
 * Return component instance based on type specified in widget meta
 *
 * `customWidgets` dictionary can be used to extend this function with new widget types,
 * with custom declaration having a priority when it is specified for core widget type
 * `children` is returned in case of unknown widget type
 *
 * @param widgetMeta Meta configuration for widget
 * @param customWidgets Dictionary where key is a widget type and value is a component that should be rendered
 * @param children Widgets children component, returned in case type is unknown
 */
function chooseWidgetType(
    widgetMeta: WidgetMeta | WidgetMetaAny,
    customWidgets?: Record<string, CustomWidgetDescriptor>,
    children?: React.ReactNode
) {
    const customWidget = customWidgets?.[widgetMeta.type]

    if (customWidget) {
        if (isCustomWidget(customWidget)) {
            const CustomWidgetComponent = customWidget
            return <CustomWidgetComponent meta={widgetMeta} />
        }
        const DescriptorComponent = customWidget.component
        return <DescriptorComponent meta={widgetMeta} />
    }
    const knownWidgetMeta = widgetMeta as WidgetMetaAny

    switch (knownWidgetMeta.type) {
        default:
            return children
    }
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
