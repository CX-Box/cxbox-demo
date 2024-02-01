import React, { FunctionComponent } from 'react'
import { connect } from 'react-redux'
import { Dispatch } from 'redux'
import MultivalueTag from '@cxboxComponents/ui/Multivalue/MultivalueTag'
import { RootState, useAppSelector } from '@store'
import { showViewPopup } from '@actions'
import { actions, interfaces } from '@cxbox-ui/core'
const { WidgetTypes } = interfaces

export interface MultivalueFieldOwnProps {
    widgetName: string // TODO: for future pagination support
    defaultValue: interfaces.MultivalueSingleValue[]
    widgetFieldMeta: interfaces.MultivalueFieldMeta
    bcName: string
    disabled?: boolean
    metaError?: string
    placeholder?: string
}

export interface MultivalueFieldProps extends MultivalueFieldOwnProps {
    cursor: string
    page: number
    popupBcName: string
    /**
     * @deprecated TODO: Remove in 2.0.0; initially existed to prevent race condition
     * when opening popup that still fetches row meta, but after introducing lazy load
     * for popup lost its relevance
     */
    popupRowMetaDone?: boolean
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
}

/**
 *
 * @param props
 * @category Components
 */
const MultivalueField: FunctionComponent<MultivalueFieldProps> = props => {
    // TODO 2.0.0: assocWidget should be found by widgetName
    const assocWidget = useAppSelector(state =>
        state.view.widgets.find(widget => widget.bcName === props.popupBcName && widget.type === WidgetTypes.AssocListPopup)
    )

    const onRemove = (newValue: interfaces.MultivalueSingleValue[], removedItem: interfaces.MultivalueSingleValue) => {
        props.onRemove(props.bcName, props.popupBcName, props.cursor, props.fieldKey, newValue, removedItem)
    }

    return (
        <MultivalueTag
            widgetName={assocWidget?.name}
            onPopupOpen={props.onMultivalueAssocOpen}
            onChange={onRemove}
            value={props.defaultValue}
            disabled={props.disabled as boolean}
            widgetFieldMeta={props.widgetFieldMeta}
            page={props.page}
            bcName={props.bcName}
            metaError={props.metaError as string}
            placeholder={props.placeholder}
        />
    )
}

function mapStateToProps(state: RootState, ownProps: MultivalueFieldOwnProps) {
    // TODO: for future pagination support
    // const widget = state.view.widgets.find(widget => widget.name === ownProps.widgetName)
    // const bc = state.screen.bo.bc[widget.bcName]
    const popupBcName = ownProps.widgetFieldMeta.popupBcName
    return {
        cursor: state.screen.bo.bc[ownProps.bcName]?.cursor as string,
        page: 0,
        popupBcName: popupBcName as string,
        assocValueKey: ownProps.widgetFieldMeta.assocValueKey,
        fieldKey: ownProps.widgetFieldMeta.key
    }
}

function mapDispatchToProps(dispatch: Dispatch) {
    return {
        onMultivalueAssocOpen: (bcName: string, widgetFieldMeta: interfaces.MultivalueFieldMeta, page: number, widgetName?: string) => {
            // TODO: for future pagination support
            // if (page !== 1) {
            //   dispatch(actions.componentChangePage({page: 1, bcName: popupBcName, isPopup: true}))
            // }
            dispatch(
                showViewPopup({
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

/**
 * @category Components
 */
const ConnectedMultivalueField = connect(mapStateToProps, mapDispatchToProps)(MultivalueField)

export default ConnectedMultivalueField
