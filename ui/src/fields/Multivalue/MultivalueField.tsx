import React, { FunctionComponent } from 'react'
import { connect } from 'react-redux'
import { Dispatch } from 'redux'
import { DataValue, WidgetTypes } from '@cxbox-ui/schema'
import { MultivalueFieldMeta, WidgetMeta } from '@cxbox-ui/core/interfaces/widget'
import { useAppSelector } from '../../hooks/useAppSelector'
import { Store } from '@cxbox-ui/core/interfaces/store'
import { $do } from '../../actions/types'
import { MultivalueSingleValue } from '@cxbox-ui/core/interfaces/data'
import MultivalueTag from './MultivalueTag'

export interface MultivalueFieldOwnProps {
    disabled?: boolean
    metaError?: string
    placeholder?: string
    meta: MultivalueFieldMeta
    widgetName?: string
    value: DataValue
}

export interface MultivalueFieldProps extends MultivalueFieldOwnProps {
    cursor: string
    page: number
    popupBcName: string
    fieldKey: string
    onRemove: (
        bcName: string,
        popupBcName: string,
        cursor: string,
        associateFieldKey: string,
        newValue: MultivalueSingleValue[],
        removedItem: MultivalueSingleValue
    ) => void
    onMultivalueAssocOpen: (bcName: string, widgetFieldMeta: MultivalueFieldMeta, page: number, widgetName?: string) => void
    widgetFieldMeta: MultivalueFieldMeta
    bcName: string
    defaultValue: MultivalueSingleValue[]
}

/**
 *
 * @param props
 * @category Components
 */
const MultivalueField: FunctionComponent<MultivalueFieldProps> = props => {
    // TODO 2.0.0: assocWidget should be found by widgetName
    const assocWidget = useAppSelector(store =>
        store.view.widgets.find((widget: WidgetMeta) => widget.bcName === props.popupBcName && widget.type === WidgetTypes.AssocListPopup)
    )

    const onRemove = (newValue: MultivalueSingleValue[], removedItem: MultivalueSingleValue) => {
        props.onRemove(props.bcName, props.popupBcName, props.cursor, props.fieldKey, newValue, removedItem)
    }

    return (
        <MultivalueTag
            widgetName={assocWidget?.name}
            onPopupOpen={props.onMultivalueAssocOpen}
            onChange={onRemove}
            value={props.defaultValue}
            disabled={!!props.disabled}
            widgetFieldMeta={props.widgetFieldMeta}
            page={props.page}
            bcName={props.bcName}
            metaError={props.metaError ?? ''}
            placeholder={props.placeholder}
        />
    )
}

export const emptyMultivalue: MultivalueSingleValue[] = []

function mapStateToProps(store: Store, { value, ...ownProps }: MultivalueFieldOwnProps) {
    const widgetFieldMeta = ownProps.meta
    const widget = store.view.widgets.find(widget => widget.name === ownProps.widgetName)
    const bcName = widget?.bcName as string

    const popupBcName = widgetFieldMeta?.popupBcName
    return {
        defaultValue: Array.isArray(value) && value.length > 0 ? (value as MultivalueSingleValue[]) : emptyMultivalue,
        cursor: store.screen.bo.bc[bcName]?.cursor as string,
        page: 0,
        popupBcName: popupBcName as string,
        assocValueKey: widgetFieldMeta.assocValueKey as string,
        fieldKey: widgetFieldMeta.key as string,
        widgetFieldMeta,
        bcName
    }
}

function mapDispatchToProps(dispatch: Dispatch) {
    return {
        onMultivalueAssocOpen: (bcName: string, widgetFieldMeta: MultivalueFieldMeta, page: number, widgetName?: string) => {
            dispatch(
                $do.showViewPopup({
                    assocValueKey: widgetFieldMeta.assocValueKey,
                    bcName: widgetFieldMeta.popupBcName as string,
                    calleeBCName: bcName,
                    associateFieldKey: widgetFieldMeta.key,
                    widgetName
                })
            )
        },
        onRemove: (
            bcName: string,
            popupBcName: string,
            cursor: string,
            associateFieldKey: string,
            dataItem: MultivalueSingleValue[],
            removedItem: MultivalueSingleValue
        ) => {
            dispatch(
                $do.removeMultivalueTag({
                    bcName,
                    popupBcName,
                    cursor,
                    associateFieldKey,
                    dataItem,
                    removedItem
                })
            )
        }
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(MultivalueField)
