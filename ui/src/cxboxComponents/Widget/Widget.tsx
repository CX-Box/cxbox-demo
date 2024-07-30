import React, { FunctionComponent } from 'react'
import { connect } from 'react-redux'
import { Skeleton, Spin } from 'antd'
import TableWidget from '@cxboxComponents/widgets/TableWidget/TableWidget'
import FormWidget from '@cxboxComponents/widgets/FormWidget/FormWidget'
import InfoWidget from '@cxboxComponents/widgets/InfoWidget/InfoWidget'
import styles from './Widget.less'
import AssocListPopup from '@cxboxComponents/widgets/AssocListPopup/AssocListPopup'
import PickListPopup from '@cxboxComponents/widgets/PickListPopup/PickListPopup'
import DebugPanel from '@cxboxComponents/DebugPanel/DebugPanel'
import NavigationTabsWidget from '@cxboxComponents/widgets/NavigationTabsWidget/NavigationTabsWidget'
import { WidgetTypes, interfaces, utils } from '@cxbox-ui/core'
import { RootState } from '@store'
import { WidgetShowCondition } from '@cxbox-ui/schema'
import { buildBcUrl } from '@utils/buildBcUrl'

interface WidgetOwnProps {
    meta: interfaces.WidgetMeta | interfaces.WidgetMetaAny
    card?: (props: any) => React.ReactElement<any>
    customSpinner?: (props: any) => React.ReactElement<any>
    children?: React.ReactNode
    disableDebugMode?: boolean
}

interface WidgetProps extends WidgetOwnProps {
    debugMode?: boolean
    loading?: boolean
    parentCursor?: string
    customWidgets?: Record<string, interfaces.CustomWidgetDescriptor>
    showWidget: boolean
    rowMetaExists: boolean
    dataExists: boolean
}

const skeletonParams = { rows: 5 }

/**
 *
 * @param props
 * @category Components
 */
export const Widget: FunctionComponent<WidgetProps> = props => {
    if (!props.showWidget) {
        return null
    }

    const customWidget = props.customWidgets?.[props.meta.type]

    const skipCardWrapping = interfaces.PopupWidgetTypes.includes(props.meta.type)

    if (skipCardWrapping) {
        return (
            <div
                data-test="WIDGET"
                data-test-widget-type={props.meta.type}
                data-test-widget-position={props.meta.position}
                data-test-widget-title={props.meta.title}
                data-test-widget-name={props.meta.name}
            >
                {chooseWidgetType(props.meta, props.customWidgets, props.children)}
            </div>
        )
    }

    const showSpinner = !!(props.loading && (props.rowMetaExists || props.dataExists))
    const showSkeleton = props.loading && !showSpinner

    const spinnerElement = props.customSpinner ? (
        <props.customSpinner spinning={showSpinner}>
            {chooseWidgetType(props.meta, props.customWidgets, props.children)}
        </props.customSpinner>
    ) : (
        <Spin spinning={showSpinner}>{chooseWidgetType(props.meta, props.customWidgets, props.children)}</Spin>
    )

    // TODO 2.0.0 delete spinner and skeleton. Spinner and skeleton should be overridden by props.card component
    const WidgetParts = (
        <>
            {showSkeleton && <Skeleton loading paragraph={skeletonParams} />}
            {!showSkeleton && spinnerElement}
            {!props.disableDebugMode && props.debugMode && <DebugPanel widgetMeta={props.meta} />}
        </>
    )

    if (customWidget && !interfaces.isCustomWidget(customWidget)) {
        if (customWidget.card === null) {
            return (
                <div
                    data-test="WIDGET"
                    data-test-widget-type={props.meta.type}
                    data-test-widget-position={props.meta.position}
                    data-test-widget-title={props.meta.title}
                    data-test-widget-name={props.meta.name}
                >
                    {WidgetParts}
                </div>
            )
        }

        if (customWidget.card) {
            const CustomCard = customWidget.card
            return <CustomCard meta={props.meta}>{WidgetParts}</CustomCard>
        }
    }

    if (props.card) {
        const Card = props.card
        return <Card meta={props.meta}>{WidgetParts}</Card>
    }
    return (
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
    widgetMeta: interfaces.WidgetMeta | interfaces.WidgetMetaAny,
    customWidgets?: Record<string, interfaces.CustomWidgetDescriptor>,
    children?: React.ReactNode
) {
    const customWidget = customWidgets?.[widgetMeta.type]

    if (customWidget) {
        if (interfaces.isCustomWidget(customWidget)) {
            const CustomWidgetComponent = customWidget
            return <CustomWidgetComponent meta={widgetMeta} />
        }
        const DescriptorComponent = customWidget.component
        return <DescriptorComponent meta={widgetMeta} />
    }
    const knownWidgetMeta = widgetMeta as interfaces.WidgetMetaAny

    switch (knownWidgetMeta.type) {
        case WidgetTypes.List:
        case WidgetTypes.DataGrid:
            return <TableWidget meta={knownWidgetMeta} showRowActions />
        case WidgetTypes.Form:
            return <FormWidget meta={knownWidgetMeta} />
        case WidgetTypes.AssocListPopup:
            return <AssocListPopup widget={knownWidgetMeta} />
        case WidgetTypes.PickListPopup:
            return <PickListPopup widget={knownWidgetMeta} />
        case WidgetTypes.Info:
            return <InfoWidget meta={knownWidgetMeta} />
        case WidgetTypes.NavigationTabs:
            return <NavigationTabsWidget meta={knownWidgetMeta} />
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
    let showWidget = interfaces.PopupWidgetTypes.includes(ownProps.meta.type) ? newPopupCheck : true
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
        debugMode: state.session.debugMode,
        loading: bc?.loading,
        parentCursor: hasParent && (parent.cursor as string),
        showWidget,
        rowMetaExists: !!rowMeta,
        dataExists: !!state.data[bcName]
    }
}

/**
 * @category Components
 */
const ConnectedWidget = connect(mapStateToProps)(Widget)

export default ConnectedWidget
