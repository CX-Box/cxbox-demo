import React, { FunctionComponent } from 'react'
import { connect } from 'react-redux'
import { Dispatch } from 'redux'
import { DataValue, WidgetTypes } from '@cxbox-ui/schema'
import { RootState, useAppSelector } from '@store'
import { actions, DataItem, interfaces } from '@cxbox-ui/core'
import MultivalueTag from './MultivalueTag'
import MultivalueHover from '@cxboxComponents/ui/Multivalue/MultivalueHover'
import { BaseFieldProps } from '@cxboxComponents/Field/Field'

export interface MultivalueFieldOwnProps extends BaseFieldProps {
    disabled?: boolean
    metaError?: string
    placeholder?: string
    meta: interfaces.MultivalueFieldMeta
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
        newValue: interfaces.MultivalueSingleValue[],
        removedItem: interfaces.MultivalueSingleValue
    ) => void
    onMultivalueAssocOpen: (bcName: string, widgetFieldMeta: interfaces.MultivalueFieldMeta, page: number, widgetName?: string) => void
    widgetFieldMeta: interfaces.MultivalueFieldMeta
    bcName: string
    defaultValue: interfaces.MultivalueSingleValue[]
    dataItem?: DataItem
}

/**
 *
 * @param props
 * @category Components
 */
const MultivalueField: FunctionComponent<MultivalueFieldProps> = props => {
    // TODO 2.0.0: assocWidget should be found by widgetName
    const assocWidget = useAppSelector(state =>
        state.view.widgets.find(
            (widget: interfaces.WidgetMeta) => widget.bcName === props.popupBcName && widget.type === WidgetTypes.AssocListPopup
        )
    )

    const onRemove = (newValue: interfaces.MultivalueSingleValue[], removedItem: interfaces.MultivalueSingleValue) => {
        props.onRemove(props.bcName, props.popupBcName, props.cursor, props.fieldKey, newValue, removedItem)
    }

    if (props.readOnly) {
        return (
            <MultivalueHover
                {...props}
                data={(props.value || emptyMultivalue) as interfaces.MultivalueSingleValue[]}
                displayedValue={props.meta.displayedKey ? props.dataItem?.[props.meta.displayedKey] : undefined}
            />
        )
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

export const emptyMultivalue: interfaces.MultivalueSingleValue[] = []

function mapStateToProps(state: RootState, { value, ...ownProps }: MultivalueFieldOwnProps) {
    const widgetFieldMeta = ownProps.meta
    const widget = state.view.widgets.find(widget => widget.name === ownProps.widgetName)
    const bcName = widget?.bcName as string
    const cursor = state.screen.bo.bc[bcName]?.cursor as string

    const popupBcName = widgetFieldMeta?.popupBcName
    return {
        dataItem: state.data[bcName]?.find(item => item.id === cursor) as interfaces.DataItem,
        defaultValue: Array.isArray(value) && value.length > 0 ? (value as interfaces.MultivalueSingleValue[]) : emptyMultivalue,
        cursor,
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
        onMultivalueAssocOpen: (bcName: string, widgetFieldMeta: interfaces.MultivalueFieldMeta, page: number, widgetName?: string) => {
            dispatch(
                actions.showViewPopup({
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
            dataItem: interfaces.MultivalueSingleValue[],
            removedItem: interfaces.MultivalueSingleValue
        ) => {
            dispatch(
                actions.removeMultivalueTag({
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
