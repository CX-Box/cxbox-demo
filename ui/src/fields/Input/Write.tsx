import { FieldComponent } from '../index.ts'
import { useHooks } from '../../hooks/useHooks.ts'
import { Input, InputProps } from 'antd'
import { isFieldInput } from '../../core/contract/fields'
import { isDataValueString } from '../../core/contract/data.ts'
import { useCallback } from 'react'

export const Write: FieldComponent['Write'] = props => {
    const hooks = useHooks()
    const { data: widgetMeta } = hooks.useWidgetMeta(props.widgetName)
    const bcName = widgetMeta?.bcName || ''
    const { data: rowMetaField } = hooks.useField(bcName, props.fieldKey)
    const { data: fieldMeta } = hooks.useTypedFieldMeta(isFieldInput, props.widgetName, props.fieldKey)
    const mutationDraftFieldState = hooks.useStore(
        state => state.bcTree.find(bc => bc.name === bcName)?.mutationDraft[props.id]?.fields[props.fieldKey]
    )
    const changeFieldValue = hooks.useStore(state => state.changeFieldValue)
    const setFieldTouched = hooks.useStore(state => state.setFieldTouched)

    const handleChangeFieldValue = useCallback<NonNullable<InputProps['onChange']>>(
        e => {
            changeFieldValue(bcName, props.id, props.fieldKey, e.target.value)
        },
        [bcName, changeFieldValue, props.fieldKey, props.id]
    )

    const handleFieldTouch = useCallback(() => {
        if (!mutationDraftFieldState?.isTouched) {
            setFieldTouched(bcName, props.id, props.fieldKey)
        }
    }, [bcName, mutationDraftFieldState?.isTouched, props.fieldKey, props.id, setFieldTouched])

    return mutationDraftFieldState && isDataValueString(mutationDraftFieldState.value) ? (
        <Input
            placeholder={rowMetaField?.placeholder}
            required={rowMetaField?.required}
            maxLength={fieldMeta?.maxInput}
            disabled={rowMetaField?.disabled}
            value={mutationDraftFieldState.value}
            type={'text'}
            onChange={handleChangeFieldValue}
            onFocus={handleFieldTouch}
        />
    ) : null
}

Write.displayName = 'Input.Write'
