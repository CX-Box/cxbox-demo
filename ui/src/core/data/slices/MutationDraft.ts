import { DataItem, DataValue } from '../../contract/data.ts'
import { StateCreator } from 'zustand'
import { UnionState } from './index.ts'
import { produce } from 'immer'

export interface MutationDraftActions {
    initMutationDraft: (bcName: string, cursor: string, defaultValues: DataItem) => void
    resetMutationDraft: (bcName: string, cursor: string) => void
    destroyMutationDraft: (bcName: string, cursor: string) => void
    changeFieldValue: (bcName: string, cursor: string, fieldName: string, value: DataValue) => void
    setFieldTouched: (bcName: string, cursor: string, fieldName: string) => void
}

export const createMutationSlice: StateCreator<UnionState, [['zustand/devtools', never]], [], MutationDraftActions> = set => ({
    initMutationDraft: (bcName, cursor, defaultValues) =>
        set(
            produce((state: UnionState) => {
                const bc = state.bcTree.find(bc => bc.name === bcName)
                if (bc) {
                    const fields: UnionState['bcTree'][number]['mutationDraft'][string]['fields'] = {}
                    Object.entries(defaultValues).forEach(([key, value]) => {
                        fields[key] = {
                            value: value,
                            isDirty: false,
                            isPristine: true,
                            isTouched: false
                        }
                    })
                    bc.mutationDraft[cursor] = {
                        defaultValues: defaultValues,
                        fields: fields
                    }
                }
            }),
            undefined,
            'mutationDraft/initForm'
        ),
    changeFieldValue: (bcName, cursor, fieldName, value) =>
        set(
            produce((state: UnionState) => {
                const bc = state.bcTree.find(bc => bc.name === bcName)
                if (bc && bc.mutationDraft) {
                    bc.mutationDraft[cursor].fields[fieldName].isDirty = true
                    bc.mutationDraft[cursor].fields[fieldName].isPristine = false
                    bc.mutationDraft[cursor].fields[fieldName].value = value
                }
            }),
            undefined,
            'mutationDraft/changeFieldValue'
        ),
    setFieldTouched: (bcName, cursor, fieldName) =>
        set(
            produce((state: UnionState) => {
                const bc = state.bcTree.find(bc => bc.name === bcName)
                if (bc && bc.mutationDraft) {
                    bc.mutationDraft[cursor].fields[fieldName].isTouched = true
                }
            }),
            undefined,
            'mutationDraft/setFieldTouched'
        ),
    destroyMutationDraft: (bcName, cursor) =>
        set(
            produce((state: UnionState) => {
                const bc = state.bcTree.find(bc => bc.name === bcName)
                if (bc) {
                    delete bc.mutationDraft[cursor]
                }
            }),
            undefined,
            'mutationDraft/destroy'
        ),
    resetMutationDraft: (bcName: string, cursor) =>
        set(
            produce((state: UnionState) => {
                const bc = state.bcTree.find(bc => bc.name === bcName)
                if (bc && bc.mutationDraft[cursor]) {
                    const defaultValues = bc.mutationDraft[cursor].defaultValues
                    Object.entries(defaultValues).forEach(([k, v]) => {
                        const field = bc.mutationDraft[cursor].fields[k]
                        field.isDirty = false
                        field.value = v
                        field.isPristine = true
                        field.isTouched = false
                    })
                }
            }),
            undefined,
            'mutationDraft/reset'
        )
})
