import React from 'react'
import PickInput from '@cxboxComponents/ui/PickInput/PickInput'
import { connect } from 'react-redux'
import ReadOnlyField from '@cxboxComponents/ui/ReadOnlyField/ReadOnlyField'
import { BaseFieldProps, ChangeDataItemPayload } from '@cxboxComponents/Field/Field'
import { useAppSelector } from '@store'
import { Dispatch } from 'redux'
import { showViewPopup } from '@actions'
import { actions, interfaces } from '@cxbox-ui/core'
import { buildBcUrl } from '@utils/buildBcUrl'

const { changeDataItem, viewPutPickMap } = actions
const { WidgetTypes } = interfaces

interface IPickListWidgetInputOwnProps extends BaseFieldProps {
    parentBCName: string
    bcName: string
    pickMap: interfaces.PickMap
    value?: string
    placeholder?: string
}

interface IPickListWidgetInputProps extends IPickListWidgetInputOwnProps {
    onChange: (payload: ChangeDataItemPayload) => void
    onClick: (bcName: string, pickMap: interfaces.PickMap, widgetName?: string) => void
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
    const popupWidget = useAppSelector(state => state.view.widgets.find(i => i.bcName === bcName && i.type === WidgetTypes.PickListPopup))
    const handleClear = React.useCallback(() => {
        Object.keys(pickMap).forEach(field => {
            onChange({
                bcName: parentBCName,
                cursor: cursor as string,
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
                cursor={cursor}
                onDrillDown={onDrillDown}
            >
                {value}
            </ReadOnlyField>
        )
    }

    return <PickInput disabled={disabled} value={value} onClick={handleClick} onClear={handleClear} placeholder={placeholder} />
}

const mapDispatchToProps = (dispatch: Dispatch) => ({
    onChange: (payload: ChangeDataItemPayload) => {
        return dispatch(changeDataItem({ ...payload, bcUrl: buildBcUrl(payload.bcName, true) }))
    },
    onClick: (bcName: string, pickMap: interfaces.PickMap, widgetName?: string) => {
        dispatch(showViewPopup({ bcName, widgetName }))
        dispatch(viewPutPickMap({ map: pickMap, bcName }))
    }
})

/**
 * @category Components
 */
const ConnectedPickListField = connect(null, mapDispatchToProps)(PickListField)

export default ConnectedPickListField
