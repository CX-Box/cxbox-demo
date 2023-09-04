import React, { useCallback } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { PickMap } from '@cxbox-ui/core/interfaces/data'
import { $do } from '../../actions/types'
import { DataValue, WidgetTypes } from '@cxbox-ui/schema'
import { PickListFieldMeta } from '@cxbox-ui/schema/src/interfaces/widget'
import { BaseFieldProps, ChangeDataItemPayload } from '@cxbox-ui/core/components/Field/Field'
import ReadOnlyField from '../../components/ui/ReadOnlyField/ReadOnlyField'
import { AppState } from '../../interfaces/storeSlices'
import PickInput from '../../components/ui/PickInput/PickInput'

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

    const widgetMeta = useSelector((state: AppState) => state.view.widgets?.find(i => i.name === widgetName))
    const parentBCName = widgetMeta?.bcName
    const { popupBcName: bcName, pickMap } = meta

    const onChange = useCallback(
        (payload: ChangeDataItemPayload) => {
            return dispatch($do.changeDataItem(payload))
        },
        [dispatch]
    )

    const onClick = useCallback(
        (bcName: string, pickMap: PickMap, widgetName?: string) => {
            dispatch($do.showViewPopup({ bcName, widgetName }))
            dispatch($do.viewPutPickMap({ map: pickMap, bcName }))
        },
        [dispatch]
    )

    const popupWidget = useSelector((state: AppState) =>
        state.view.widgets.find(i => i.bcName === bcName && i.type === WidgetTypes.PickListPopup)
    )
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
                onDrillDown={onDrillDown}
            >
                {value}
            </ReadOnlyField>
        )
    }

    return <PickInput disabled={disabled} value={value} onClick={handleClick} onClear={handleClear} placeholder={placeholder} />
}

export default PickListField
