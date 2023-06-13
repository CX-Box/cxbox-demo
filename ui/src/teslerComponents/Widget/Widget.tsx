import React, { FunctionComponent } from 'react'
import { connect } from 'react-redux'
import { Skeleton, Spin } from 'antd'
import { Store } from '@interfaces/store'
import TableWidget from '@teslerComponents/widgets/TableWidget/TableWidget'
import TextWidget from '@teslerComponents/widgets/TextWidget/TextWidget'
import FormWidget from '@teslerComponents/widgets/FormWidget/FormWidget'
import InfoWidget from '@teslerComponents/widgets/InfoWidget/InfoWidget'
import styles from './Widget.less'
import AssocListPopup from '@teslerComponents/widgets/AssocListPopup/AssocListPopup'
import PickListPopup from '@teslerComponents/widgets/PickListPopup/PickListPopup'
import FlatTreePopup from '@teslerComponents/widgets/FlatTree/FlatTreePopup'
import FlatTree from '@teslerComponents/widgets/FlatTree/FlatTree'
import DebugPanel from '@teslerComponents/DebugPanel/DebugPanel'
import NavigationTabsWidget from '@teslerComponents/widgets/NavigationTabsWidget/NavigationTabsWidget'
import { CustomWidgetDescriptor, isCustomWidget, PopupWidgetTypes, WidgetMeta, WidgetMetaAny, WidgetTypes } from '@cxbox-ui/core'
import { checkShowCondition } from '@cxbox-ui/core'
import { buildBcUrl } from '@cxbox-ui/core'

interface WidgetOwnProps {
    meta: WidgetMeta | WidgetMetaAny
    card?: (props: any) => React.ReactElement<any>
    customSpinner?: (props: any) => React.ReactElement<any>
    children?: React.ReactNode
}

interface WidgetProps extends WidgetOwnProps {
    debugMode?: boolean
    loading?: boolean
    parentCursor?: string
    customWidgets?: Record<string, CustomWidgetDescriptor>
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

    const skipCardWrapping = PopupWidgetTypes.includes(props.meta.type)

    if (skipCardWrapping) {
        return <> {chooseWidgetType(props.meta, props.customWidgets, props.children)} </>
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
            {props.debugMode && <DebugPanel widgetMeta={props.meta} />}
        </>
    )

    if (customWidget && !isCustomWidget(customWidget)) {
        if (customWidget.card === null) {
            return WidgetParts
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
        <div className={styles.container} data-widget-type={props.meta.type}>
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
        case WidgetTypes.List:
        case WidgetTypes.DataGrid:
            return <TableWidget meta={knownWidgetMeta} showRowActions />
        case WidgetTypes.Form:
            return <FormWidget meta={knownWidgetMeta} />
        case WidgetTypes.Text:
            return <TextWidget meta={knownWidgetMeta} />
        case WidgetTypes.AssocListPopup:
            return <AssocListPopup widget={knownWidgetMeta} />
        case WidgetTypes.PickListPopup:
            return <PickListPopup widget={knownWidgetMeta} />
        case WidgetTypes.Info:
            return <InfoWidget meta={knownWidgetMeta} />
        case WidgetTypes.FlatTree:
            return <FlatTree meta={knownWidgetMeta} />
        case WidgetTypes.FlatTreePopup:
            return <FlatTreePopup meta={knownWidgetMeta} />
        case WidgetTypes.NavigationTabs:
            return <NavigationTabsWidget meta={knownWidgetMeta} />
        default:
            return children
    }
}

function mapStateToProps(store: Store, ownProps: WidgetOwnProps) {
    const bcName = ownProps.meta.bcName
    const bc = store.screen.bo.bc[bcName]
    const parent = store.screen.bo.bc[bc?.parentName]
    const hasParent = !!parent
    const legacyPopupCheck = store.view.popupData.bcName === bcName
    const newPopupCheck = store.view.popupData.widgetName ? store.view.popupData.widgetName === ownProps.meta.name : legacyPopupCheck
    let showWidget = PopupWidgetTypes.includes(ownProps.meta.type) ? newPopupCheck : true
    if (
        !checkShowCondition(
            ownProps.meta.showCondition,
            store.screen.bo.bc[ownProps.meta.showCondition?.bcName]?.cursor,
            store.data[ownProps.meta.showCondition?.bcName],
            store.view.pendingDataChanges
        )
    ) {
        showWidget = false
    }
    const bcUrl = buildBcUrl(bcName, true)
    const rowMeta = bcUrl && store.view.rowMeta[bcName]?.[bcUrl]
    return {
        debugMode: store.session.debugMode,
        loading: bc?.loading,
        parentCursor: hasParent && parent.cursor,
        showWidget,
        rowMetaExists: !!rowMeta,
        dataExists: !!store.data[bcName]
    }
}

/**
 * @category Components
 */
const ConnectedWidget = connect(mapStateToProps)(Widget)

export default ConnectedWidget
