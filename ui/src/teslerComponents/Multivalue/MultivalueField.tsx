import React, { FunctionComponent } from 'react'
import { connect, useSelector } from 'react-redux'
import { Dispatch } from 'redux'
import { Store } from '@interfaces/store'
import MultivalueTag from '@teslerComponents/ui/Multivalue/MultivalueTag'
import { WidgetTypes } from '@tesler-ui/schema'
import { MultivalueSingleValue } from '@tesler-ui/core'
import { MultivalueFieldMeta } from '@tesler-ui/core'
import { $do } from '@actions/types'

export interface MultivalueFieldOwnProps {
    widgetName: string // TODO: for future pagination support
    defaultValue: MultivalueSingleValue[]
    widgetFieldMeta: MultivalueFieldMeta
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
        newValue: MultivalueSingleValue[],
        removedItem: MultivalueSingleValue
    ) => void
    onMultivalueAssocOpen: (bcName: string, widgetFieldMeta: MultivalueFieldMeta, page: number, widgetName?: string) => void
}

/**
 *
 * @param props
 * @category Components
 */
const MultivalueField: FunctionComponent<MultivalueFieldProps> = props => {
    // TODO 2.0.0: assocWidget should be found by widgetName
    const assocWidget = useSelector((store: Store) =>
        store.view.widgets.find(widget => widget.bcName === props.popupBcName && widget.type === WidgetTypes.AssocListPopup)
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
            disabled={props.disabled}
            widgetFieldMeta={props.widgetFieldMeta}
            page={props.page}
            bcName={props.bcName}
            metaError={props.metaError}
            placeholder={props.placeholder}
        />
    )
}

function mapStateToProps(store: Store, ownProps: MultivalueFieldOwnProps) {
    // TODO: for future pagination support
    // const widget = store.view.widgets.find(widget => widget.name === ownProps.widgetName)
    // const bc = store.screen.bo.bc[widget.bcName]
    const popupBcName = ownProps.widgetFieldMeta.popupBcName
    return {
        cursor: store.screen.bo.bc[ownProps.bcName]?.cursor,
        page: 0,
        popupBcName: popupBcName,
        assocValueKey: ownProps.widgetFieldMeta.assocValueKey,
        fieldKey: ownProps.widgetFieldMeta.key
    }
}

function mapDispatchToProps(dispatch: Dispatch) {
    return {
        onMultivalueAssocOpen: (bcName: string, widgetFieldMeta: MultivalueFieldMeta, page: number, widgetName?: string) => {
            // TODO: for future pagination support
            // if (page !== 1) {
            //   dispatch($do.componentChangePage({page: 1, bcName: popupBcName, isPopup: true}))
            // }
            dispatch(
                $do.showViewPopup({
                    assocValueKey: widgetFieldMeta.assocValueKey,
                    bcName: widgetFieldMeta.popupBcName,
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

/**
 * @category Components
 */
const ConnectedMultivalueField = connect(mapStateToProps, mapDispatchToProps)(MultivalueField)

export default ConnectedMultivalueField
