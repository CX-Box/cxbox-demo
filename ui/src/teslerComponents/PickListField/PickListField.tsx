import React from 'react'
import PickInput from '@teslerComponents/ui/PickInput/PickInput'
import { connect, useSelector } from 'react-redux'
import ReadOnlyField from '@teslerComponents/ui/ReadOnlyField/ReadOnlyField'
import { BaseFieldProps, ChangeDataItemPayload } from '@teslerComponents/Field/Field'
import { Store } from '@interfaces/store'
import { WidgetTypes } from '@tesler-ui/schema'
import { PickMap } from '@tesler-ui/core'
import { $do } from '@actions/types'

interface IPickListWidgetInputOwnProps extends BaseFieldProps {
    parentBCName: string
    bcName: string
    pickMap: PickMap
    value?: string
    placeholder?: string
}

interface IPickListWidgetInputProps extends IPickListWidgetInputOwnProps {
    onChange: (payload: ChangeDataItemPayload) => void
    onClick: (bcName: string, pickMap: PickMap, widgetName?: string) => void
    /**
     * @deprecated TODO: Remove in 2.0.0; initially existed to prevent race condition
     * when opening popup that still fetches row meta, but after introducing lazy load
     * for popup lost its relevance
     */
    popupRowMetaDone?: boolean
}

/**
 *
 * @param props
 * @category Components
 */
const PickListField: React.FunctionComponent<IPickListWidgetInputProps> = ({
    pickMap,
    bcName,
    parentBCName,
    cursor,
    widgetName,
    readOnly,
    meta,
    className,
    backgroundColor,
    value,
    disabled,
    placeholder,
    onChange,
    onClick,
    onDrillDown
}) => {
    const popupWidget = useSelector((store: Store) =>
        store.view.widgets.find(i => i.bcName === bcName && i.type === WidgetTypes.PickListPopup)
    )
    const handleClear = React.useCallback(() => {
        Object.keys(pickMap).forEach(field => {
            onChange({
                bcName: parentBCName,
                cursor,
                dataItem: { [field]: '' }
            })
        })
    }, [pickMap, onChange, parentBCName, cursor])

    const handleClick = React.useCallback(() => {
        onClick(bcName, pickMap, popupWidget?.name)
    }, [onClick, bcName, pickMap, popupWidget?.name])

    if (readOnly) {
        return (
            <ReadOnlyField
                widgetName={widgetName}
                meta={meta}
                className={className}
                backgroundColor={backgroundColor}
                onDrillDown={onDrillDown}
            >
                {value}
            </ReadOnlyField>
        )
    }

    return <PickInput disabled={disabled} value={value} onClick={handleClick} onClear={handleClear} placeholder={placeholder} />
}

const mapDispatchToProps = (dispatch: any) => ({
    onChange: (payload: ChangeDataItemPayload) => {
        return dispatch($do.changeDataItem(payload))
    },
    onClick: (bcName: string, pickMap: PickMap, widgetName?: string) => {
        dispatch($do.showViewPopup({ bcName, widgetName }))
        dispatch($do.viewPutPickMap({ map: pickMap, bcName }))
    }
})

/**
 * @category Components
 */
const ConnectedPickListField = connect(null, mapDispatchToProps)(PickListField)

export default ConnectedPickListField
