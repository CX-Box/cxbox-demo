import { create } from 'zustand'
import { produce } from 'immer'
import { useScreenBcMeta } from '@hooks/queries'
import { useMemo } from 'react'

interface FieldStore {
    value: any
    isDirty: boolean
    isPristine: boolean
    isTouched: boolean
}

interface BcFormStore {
    [key: string]: {
        defaultValues: Record<string, unknown>
        fields: Record<string, FieldStore>
    }
}

const useBcFormStore = create<BcFormStore>(() => ({}))

interface FieldParams {
    bcName: string
    fieldName: string
}

export const useBcFormField = ({ bcName, fieldName }: FieldParams) => {
    const { data: bcMetaList } = useScreenBcMeta(bcName)
    useBcFormStore(state => state[bcPath].fields[fieldName])
}

interface InitialValuesParams {
    bcPath: string
    defaultValues: Record<string, unknown>
}

export const initializeForm = ({ bcPath, defaultValues }: InitialValuesParams) =>
    useBcFormStore.setState(
        produce((state: BcFormStore) => {
            state[bcPath].defaultValues = defaultValues
            state[bcPath].fields = Object.entries(defaultValues).reduce<Record<string, FieldStore>>((acc, [key, val]) => {
                acc[key] = {
                    isDirty: false,
                    isPristine: true,
                    isTouched: false,
                    value: val
                }
                return acc
            }, {})
        })
    )
