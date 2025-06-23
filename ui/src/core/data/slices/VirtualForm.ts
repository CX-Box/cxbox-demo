import { DataItem, DataValue } from '../../contract/data.ts'
import { StateCreator } from 'zustand'
import { UnionState } from './index.ts'
import { produce } from 'immer'

export interface VirtualFormActions {
    initVirtualForm: (bcName: string, cursor: string, defaultValues: DataItem) => void
    resetVirtualForm: (bcName: string, cursor: string) => void
    destroyVirtualForm: (bcName: string, cursor: string) => void
    changeFieldValue: (bcName: string, cursor: string, fieldName: string, value: DataValue) => void
    setFieldTouched: (bcName: string, cursor: string, fieldName: string) => void
    setFieldBlurred: (bcName: string, cursor: string, fieldName: string) => void
}

export const createVirtualFormSlice: StateCreator<UnionState, [['zustand/devtools', never]], [], VirtualFormActions> = set => ({
    initVirtualForm: (bcName, cursor, defaultValues) =>
        set(
            produce((state: UnionState) => {
                const bc = state.bcTree.find(bc => bc.name === bcName)
                if (bc) {
                    const fields: UnionState['bcTree'][number]['virtualForms'][string]['fields'] = {}
                    Object.entries(defaultValues).forEach(([key, value]) => {
                        fields[key] = {
                            value: value,
                            isDirty: false,
                            isPristine: true,
                            isTouched: false,
                            isBlurred: false
                        }
                    })
                    bc.virtualForms[cursor] = {
                        defaultValues: defaultValues,
                        fields: fields
                    }
                }
            }),
            undefined,
            'virtualForm/initForm'
        ),
    changeFieldValue: (bcName, cursor, fieldName, value) =>
        set(
            produce((state: UnionState) => {
                const bc = state.bcTree.find(bc => bc.name === bcName)
                if (bc && bc.virtualForms) {
                    bc.virtualForms[cursor].fields[fieldName].isDirty = true
                    bc.virtualForms[cursor].fields[fieldName].isPristine = false
                    bc.virtualForms[cursor].fields[fieldName].value = value
                }
            }),
            undefined,
            'virtualForm/changeFieldValue'
        ),
    setFieldTouched: (bcName, cursor, fieldName) =>
        set(
            produce((state: UnionState) => {
                const bc = state.bcTree.find(bc => bc.name === bcName)
                if (bc && bc.virtualForms) {
                    bc.virtualForms[cursor].fields[fieldName].isTouched = true
                }
            }),
            undefined,
            'virtualForm/setFieldTouched'
        ),
    setFieldBlurred: (bcName, cursor, fieldName) =>
        set(
            produce((state: UnionState) => {
                const bc = state.bcTree.find(bc => bc.name === bcName)
                if (bc && bc.virtualForms) {
                    bc.virtualForms[cursor].fields[fieldName].isBlurred = true
                }
            }),
            undefined,
            'virtualForm/setFieldBlurred'
        ),
    destroyVirtualForm: (bcName, cursor) =>
        set(
            produce((state: UnionState) => {
                const bc = state.bcTree.find(bc => bc.name === bcName)
                if (bc) {
                    delete bc.virtualForms[cursor]
                }
            }),
            undefined,
            'virtualForm/destroy'
        ),
    resetVirtualForm: (bcName: string, cursor) =>
        set(
            produce((state: UnionState) => {
                const bc = state.bcTree.find(bc => bc.name === bcName)
                if (bc && bc.virtualForms[cursor]) {
                    const defaultValues = bc.virtualForms[cursor].defaultValues
                    Object.entries(defaultValues).forEach(([k, v]) => {
                        const field = bc.virtualForms[cursor].fields[k]
                        field.isDirty = false
                        field.value = v
                        field.isPristine = true
                        field.isTouched = false
                        field.isBlurred = false
                    })
                }
            }),
            undefined,
            'virtualForm/reset'
        )
})
