import React, { useCallback } from 'react'
import { useDispatch } from 'react-redux'
import { actions, interfaces } from '@cxbox-ui/core'
import { DataValue, WidgetTypes, PickListFieldMeta } from '@cxbox-ui/schema'
import ReadOnlyField from '../../components/ui/ReadOnlyField/ReadOnlyField'
import { useAppSelector } from '@store'
import PickInput from '../../components/ui/PickInput/PickInput'
import { BaseFieldProps, ChangeDataItemPayload } from '@cxboxComponents/Field/Field'
import { buildBcUrl } from '@utils/buildBcUrl'

interface Props extends Omit<BaseFieldProps, 'meta'> {
    meta: PickListFieldMeta
    value?: string
    placeholder?: string
}

const PickListField: React.FunctionComponent<Props> = ({
    widgetName,
    disabled,
    cursor,
    readOnly,
    className,
    meta,
    backgroundColor,
    value,
    placeholder,
    onDrillDown
}) => {
    const dispatch = useDispatch()

    const widgetMeta = useAppSelector(state => state.view.widgets?.find(i => i.name === widgetName))
    const parentBCName = widgetMeta?.bcName
    const { popupBcName: bcName, pickMap } = meta

    const onChange = useCallback(
        (payload: ChangeDataItemPayload) => {
            return dispatch(actions.changeDataItem({ ...payload, bcUrl: buildBcUrl(payload.bcName, true) }))
        },
        [dispatch]
    )

    const onClick = useCallback(
        (bcName: string, pickMap: interfaces.PickMap, widgetName?: string) => {
            dispatch(actions.showViewPopup({ bcName, widgetName }))
            dispatch(actions.viewPutPickMap({ map: pickMap, bcName }))
        },
        [dispatch]
    )

    const popupWidget = useAppSelector(state => state.view.widgets.find(i => i.bcName === bcName && i.type === WidgetTypes.PickListPopup))
    const handleClear = React.useCallback(() => {
        const bcNameChanges: Record<string, DataValue> = {}

        Object.keys(pickMap).forEach(field => {
            bcNameChanges[field] = ''
        })

        onChange({
            bcName: parentBCName || '',
            cursor: cursor || '',
            dataItem: bcNameChanges
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

export default PickListField
