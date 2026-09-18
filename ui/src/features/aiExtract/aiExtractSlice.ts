import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { AiExtractBox, AiExtractField, AiExtractPair, AiExtractResult } from './types'

export interface AiExtractBcState {
    status: 'idle' | 'loading' | 'done' | 'error'
    error?: string
    /** values put on the form */
    fields: AiExtractField[]
    /** everything the document was understood to hold: any pair can be bound to a field by hand */
    pairs: AiExtractPair[]
    notFound: string[]
    /** field the person is looking at now, by its id "виджет:ключ": framed on the document and lit on the form */
    activeKey?: string
    /** pair the person is looking at now, when it is not bound to any field yet */
    activePair?: number
    /** piece of the document the person selected by hand, to bind it to a field */
    selection?: { text: string; box: AiExtractBox }
    /** what the form had before the document filled it in, to put back on unbinding */
    previous: Record<string, string>
    /** all values at once as side notes instead of one note next to the active frame */
    showAll: boolean
    /** what recognition gave for a field the person has taken the value off, so it can be put back */
    removed: Record<string, AiExtractField>
    /** what the person typed into a field by hand: the third version of a value, next to the form and the document */
    typed: Record<string, string>
    /** fields a person has looked at and confirmed: the trace of the check and the place they stopped at */
    checked: string[]
    model?: string
    durationMs?: number
}

interface AiExtractState {
    byBc: Record<string, AiExtractBcState>
}

const emptyBc: AiExtractBcState = {
    status: 'idle',
    fields: [],
    pairs: [],
    notFound: [],
    previous: {},
    showAll: false,
    removed: {},
    typed: {},
    checked: []
}

const bcState = (state: AiExtractState, bcName: string) => {
    if (!state.byBc[bcName]) {
        state.byBc[bcName] = { ...emptyBc }
    }

    return state.byBc[bcName]
}

const slice = createSlice({
    name: 'aiExtract',
    initialState: { byBc: {} } as AiExtractState,
    reducers: {
        extractStarted(state, action: PayloadAction<{ bcName: string }>) {
            const bc = bcState(state, action.payload.bcName)
            bc.status = 'loading'
            bc.error = undefined
        },
        extractSucceeded(state, action: PayloadAction<{ bcName: string; result: AiExtractResult; previous: Record<string, string> }>) {
            const bc = bcState(state, action.payload.bcName)
            bc.status = 'done'
            bc.fields = action.payload.result.fields
            bc.pairs = action.payload.result.pairs
            bc.notFound = action.payload.result.notFound
            bc.previous = action.payload.previous
            bc.removed = {}
            bc.typed = {}
            bc.checked = []
            bc.model = action.payload.result.model
            bc.durationMs = action.payload.result.durationMs
            bc.activeKey = action.payload.result.fields.find(field => field.confidence < 0.8)?.id
            bc.activePair = undefined
        },
        extractFailed(state, action: PayloadAction<{ bcName: string; error: string }>) {
            const bc = bcState(state, action.payload.bcName)
            bc.status = 'error'
            bc.error = action.payload.error
        },
        fieldActivated(state, action: PayloadAction<{ bcName: string; key?: string }>) {
            const bc = bcState(state, action.payload.bcName)
            bc.activeKey = action.payload.key
            bc.activePair = action.payload.key ? bc.fields.find(field => field.id === action.payload.key)?.pair : undefined
        },
        pairActivated(state, action: PayloadAction<{ bcName: string; pair?: number }>) {
            const bc = bcState(state, action.payload.bcName)
            bc.activePair = action.payload.pair
            bc.activeKey = bc.fields.find(field => field.pair === action.payload.pair)?.id
        },
        /** the person bound a pair of the document to a field: the value of the pair goes to that field */
        fieldBound(state, action: PayloadAction<{ bcName: string; key: string; pair: number; previous: string }>) {
            const bc = bcState(state, action.payload.bcName)
            const pair = bc.pairs.find(item => item.index === action.payload.pair)
            if (!pair) {
                return
            }
            if (bc.previous[action.payload.key] === undefined) {
                bc.previous[action.payload.key] = action.payload.previous
            }
            bc.fields = [
                ...bc.fields.filter(field => field.id !== action.payload.key && field.pair !== action.payload.pair),
                {
                    id: action.payload.key,
                    key: action.payload.key,
                    value: pair.value,
                    confidence: 1,
                    match: 'manual',
                    pair: pair.index,
                    box: pair.box
                }
            ]
            bc.notFound = bc.notFound.filter(key => key !== action.payload.key)
            delete bc.removed[action.payload.key]
            bc.activeKey = action.payload.key
            bc.activePair = pair.index
        },
        /** the person took the value off the field: the form gets back what it had */
        /** the value a person typed by hand is kept, so going to another version is not a one way door */
        fieldTyped(state, action: PayloadAction<{ bcName: string; key: string; value: string }>) {
            bcState(state, action.payload.bcName).typed[action.payload.key] = action.payload.value
        },
        fieldUnbound(state, action: PayloadAction<{ bcName: string; key: string }>) {
            const bc = bcState(state, action.payload.bcName)
            const removed = bc.fields.find(field => field.id === action.payload.key)
            if (removed) {
                bc.removed[action.payload.key] = removed
            }
            bc.fields = bc.fields.filter(field => field.id !== action.payload.key)
            if (!bc.notFound.includes(action.payload.key)) {
                bc.notFound.push(action.payload.key)
            }
            // the field the value has been taken off needs a new look and stays open: the person is working with
            // this very field right now and has to be able to put the value back
            bc.checked = bc.checked.filter(key => key !== action.payload.key)
            bc.activeKey = action.payload.key
            bc.activePair = undefined
        },
        /** the person selected a piece of the document: it can be bound to a field even if no pair was found there */
        selectionMade(state, action: PayloadAction<{ bcName: string; text: string; box: AiExtractBox }>) {
            const bc = bcState(state, action.payload.bcName)
            bc.selection = { text: action.payload.text, box: action.payload.box }
            bc.activePair = undefined
            bc.activeKey = undefined
        },
        selectionCleared(state, action: PayloadAction<{ bcName: string }>) {
            bcState(state, action.payload.bcName).selection = undefined
        },
        /** a field takes the selected piece of the document, whatever the automation did or did not find */
        selectionBound(state, action: PayloadAction<{ bcName: string; key: string; previous: string }>) {
            const bc = bcState(state, action.payload.bcName)
            if (!bc.selection) {
                return
            }
            if (bc.previous[action.payload.key] === undefined) {
                bc.previous[action.payload.key] = action.payload.previous
            }
            bc.fields = [
                ...bc.fields.filter(field => field.id !== action.payload.key),
                {
                    id: action.payload.key,
                    key: action.payload.key,
                    value: bc.selection.text,
                    confidence: 1,
                    match: 'manual',
                    box: bc.selection.box
                }
            ]
            bc.notFound = bc.notFound.filter(key => key !== action.payload.key)
            bc.activeKey = action.payload.key
            bc.selection = undefined
        },
        /** the person looked at the field and confirmed what stands in it */
        fieldChecked(state, action: PayloadAction<{ bcName: string; key: string; checked: boolean }>) {
            const bc = bcState(state, action.payload.bcName)
            bc.checked = action.payload.checked
                ? Array.from(new Set([...bc.checked, action.payload.key]))
                : bc.checked.filter(key => key !== action.payload.key)
        },
        /** the person went through everything at once: values stay as they are, only the trace is left */
        allChecked(state, action: PayloadAction<{ bcName: string; keys: string[] }>) {
            bcState(state, action.payload.bcName).checked = action.payload.keys
        },
        allNotesToggled(state, action: PayloadAction<{ bcName: string }>) {
            const bc = bcState(state, action.payload.bcName)
            bc.showAll = !bc.showAll
        },
        extractCleared(state, action: PayloadAction<{ bcName: string }>) {
            state.byBc[action.payload.bcName] = { ...emptyBc }
        }
    }
})

export const aiExtractActions = slice.actions

export const aiExtractReducer = slice.reducer

export const selectAiExtract = (bcName?: string) => (state: { aiExtract: AiExtractState }) =>
    (bcName ? state.aiExtract.byBc[bcName] : undefined) ?? emptyBc

/**
 * The result lives under the business component of the document, and a field filled from it can belong to
 * another widget and another component: a field of the form finds itself by its id, wherever it was filled from.
 */
export const selectAiExtractField = (id?: string) => (state: { aiExtract: AiExtractState }) =>
    id
        ? Object.values(state.aiExtract.byBc)
              .flatMap(bc => bc.fields)
              .find(field => field.id === id)
        : undefined

/** Business component the document of this field is attached to: there the state of the whole run lives. */
export const selectAiExtractOwner = (id?: string) => (state: { aiExtract: AiExtractState }) =>
    id
        ? Object.entries(state.aiExtract.byBc).find(([, bc]) => bc.fields.some(field => field.id === id) || bc.notFound.includes(id))?.[0]
        : undefined

/**
 * The recognition looked at this field and found nothing for it. Such a field wears the same mark as it wears
 * in the list of the panel: the mark of a field has to say one and the same thing wherever a person meets it.
 */
export const selectAiExtractNotFound = (id?: string) => (state: { aiExtract: AiExtractState }) =>
    id ? Object.values(state.aiExtract.byBc).some(bc => bc.notFound.includes(id)) : false

/** The person has confirmed this field: the form shows it differently from a fresh guess. */
export const selectAiExtractChecked = (id?: string) => (state: { aiExtract: AiExtractState }) =>
    id ? Object.values(state.aiExtract.byBc).some(bc => bc.checked.includes(id)) : false

export const selectAiExtractActive = (id?: string) => (state: { aiExtract: AiExtractState }) =>
    id ? Object.values(state.aiExtract.byBc).some(bc => bc.activeKey === id) : false
