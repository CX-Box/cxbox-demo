import { create } from 'zustand'
import { produce } from 'immer'
import { useScreenBcPath } from '@hooks/useScreenBcPath'
import { DataValue } from '@cxbox-ui/core'

interface FieldStore {
    value: DataValue
    isDirty: boolean
    isPristine: boolean
    isTouched: boolean
}

interface BcFormStore {
    [key: string]: {
        defaultValues: Record<string, DataValue>
        fields: Record<string, FieldStore>
    }
}

const useBcFormStore = create<BcFormStore>(() => ({}))

interface FieldParams {
    bcPath: string
    fieldName: string
}

export const useBcFormField = ({ bcPath, fieldName }: FieldParams) => useBcFormStore(state => state[bcPath]?.fields?.[fieldName])

interface InitialValuesParams {
    bcPath: string
    defaultValues: Record<string, DataValue>
}

export const initializeForm = ({ bcPath, defaultValues }: InitialValuesParams) =>
    useBcFormStore.setState(
        produce((state: BcFormStore) => {
            state[bcPath] = {
                defaultValues: defaultValues,
                fields: Object.entries(defaultValues).reduce<Record<string, FieldStore>>((acc, [key, val]) => {
                    acc[key] = {
                        isDirty: false,
                        isPristine: true,
                        isTouched: false,
                        value: val
                    }
                    return acc
                }, {})
            }
        })
    )

interface ChangeFieldValueParams extends FieldParams {
    value: DataValue
}
export const changeFieldValue = ({ bcPath, fieldName, value }: ChangeFieldValueParams) =>
    useBcFormStore.setState(
        produce((state: BcFormStore) => {
            const field = state[bcPath].fields[fieldName]
            field.value = value
            field.isDirty = true
            field.isPristine = false
        })
    )

export const setFieldTouched = ({ bcPath, fieldName }: FieldParams) =>
    useBcFormStore.setState(
        produce((state: BcFormStore) => {
            state[bcPath].fields[fieldName].isTouched = true
        })
    )
