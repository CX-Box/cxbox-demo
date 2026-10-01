import { useCallback, useMemo } from 'react'
import { useAppDispatch, useAppSelector } from '@store'
import { actions } from '@cxbox-ui/core'
import { buildBcUrl } from '@utils/buildBcUrl'
import { aiExtractActions, selectAiExtract } from '../aiExtractSlice'
import { requestAiExtract } from '../api'
import { AiExtractBox, AiExtractField, AiExtractTarget } from '../types'
import { useTargetFields } from './useTargetFields'

const errorText = (error: any) =>
    error?.response?.data?.error?.popup?.[0] ?? error?.response?.data?.message ?? error?.message ?? 'Не удалось распознать документ'

/**
 * Recognition of the attached document and putting the values on the form. Nothing is saved: the values become
 * unsaved changes of the form, exactly as if the person had typed them, and what the form held before is kept,
 * so unbinding a wrong value puts the old one back.
 *
 * A value goes to the widget it was asked for: fields are identified by the widget and the key together, and
 * every widget gets the change in its own business component.
 */
export function useAiExtract(bcName: string, fileId?: string) {
    const dispatch = useAppDispatch()
    const targets = useTargetFields(bcName)
    const state = useAppSelector(selectAiExtract(bcName))
    const cursors = useAppSelector(store => store.screen.bo.bc)
    const data = useAppSelector(store => store.data)
    const pending = useAppSelector(store => store.view.pendingDataChanges)

    const byId = useMemo(() => new Map(targets.map(target => [target.id, target])), [targets])

    /** what the field holds right now, an unsaved change included: the same value the person sees */
    const valueOf = useCallback(
        (target?: AiExtractTarget) => {
            if (!target) {
                return ''
            }
            const cursor = cursors[target.bcName]?.cursor as string
            const changed = (pending as any)?.[target.bcName]?.[cursor]?.[target.key]

            return (changed ?? (data as any)?.[target.bcName]?.find((item: any) => item.id === cursor)?.[target.key] ?? '') as string
        },
        [cursors, data, pending]
    )

    /** values go to the business component of their own widget, one change per component */
    const apply = useCallback(
        (values: Record<string, string>) => {
            const byBc = new Map<string, Record<string, string>>()
            Object.entries(values).forEach(([id, value]) => {
                const target = byId.get(id)
                if (!target || !cursors[target.bcName]?.cursor) {
                    return
                }
                const current = byBc.get(target.bcName) ?? {}
                current[target.key] = value
                byBc.set(target.bcName, current)
            })
            byBc.forEach((dataItem, bc) =>
                dispatch(
                    actions.changeDataItem({
                        bcName: bc,
                        cursor: cursors[bc]?.cursor as string,
                        dataItem,
                        bcUrl: buildBcUrl(bc, true) as string
                    })
                )
            )
        },
        [byId, cursors, dispatch]
    )

    const run = useCallback(async () => {
        if (!fileId) {
            return
        }
        dispatch(aiExtractActions.extractStarted({ bcName }))
        try {
            const result = await requestAiExtract({
                fileId,
                bcName,
                fields: targets.map(({ meta, ...field }) => field)
            })
            const previous = Object.fromEntries(result.fields.map((field: AiExtractField) => [field.id, valueOf(byId.get(field.id))]))
            dispatch(aiExtractActions.extractSucceeded({ bcName, result, previous }))
            apply(Object.fromEntries(result.fields.map((field: AiExtractField) => [field.id, field.value])))
        } catch (error) {
            dispatch(aiExtractActions.extractFailed({ bcName, error: errorText(error) }))
        }
    }, [apply, bcName, byId, dispatch, fileId, targets, valueOf])

    /** the person binds a pair of the document to a field: what the field held before is remembered */
    const bind = useCallback(
        (id: string, pair: number) => {
            const value = state.pairs.find(item => item.index === pair)?.value
            if (value === undefined) {
                return
            }
            dispatch(aiExtractActions.fieldBound({ bcName, key: id, pair, previous: valueOf(byId.get(id)) }))
            apply({ [id]: value })
        },
        [apply, bcName, byId, dispatch, state.pairs, valueOf]
    )

    /** the person took the value off the field: the field is left empty */
    const unbind = useCallback(
        (id: string) => {
            dispatch(aiExtractActions.fieldUnbound({ bcName, key: id }))
            apply({ [id]: '' })
        },
        [apply, bcName, dispatch]
    )

    /** the person wants back what stood in the field before the recognition wrote over it */
    const restoreForm = useCallback(
        (id: string) => {
            dispatch(aiExtractActions.fieldUnbound({ bcName, key: id }))
            apply({ [id]: state.previous[id] ?? '' })
        },
        [apply, bcName, dispatch, state.previous]
    )

    /** the person wants back what the recognition gave: after a correction by hand or after taking it off */
    const restore = useCallback(
        (id: string) => {
            const removed = state.removed[id]
            if (removed) {
                dispatch(aiExtractActions.fieldBound({ bcName, key: id, pair: removed.pair as number, previous: valueOf(byId.get(id)) }))
                apply({ [id]: removed.value })

                return
            }
            const value = state.fields.find(field => field.id === id)?.value
            if (value !== undefined) {
                apply({ [id]: value })
            }
        },
        [apply, bcName, byId, dispatch, state.fields, state.removed, valueOf]
    )

    /** the value a person typed by hand, kept so they can come back to it from any other version */
    const remember = useCallback(
        (id: string, value: string) => dispatch(aiExtractActions.fieldTyped({ bcName, key: id, value })),
        [bcName, dispatch]
    )

    /** back to what the person typed by hand */
    const restoreTyped = useCallback((id: string) => apply({ [id]: state.typed[id] ?? '' }), [apply, state.typed])

    /** the person looked at a field and confirmed what stands in it */
    const check = useCallback(
        (id: string, checked = true) => dispatch(aiExtractActions.fieldChecked({ bcName, key: id, checked })),
        [bcName, dispatch]
    )

    /** the person went through everything at once, or took that back just as whole */
    const checkAll = useCallback(
        (checked = true) => dispatch(aiExtractActions.allChecked({ bcName, keys: checked ? targets.map(target => target.id) : [] })),
        [bcName, dispatch, targets]
    )

    /** everything the recognition did is taken off the form: the form is as it was before the button was pressed */
    const reset = useCallback(() => {
        apply(Object.fromEntries(state.fields.map(field => [field.id, state.previous[field.id] ?? ''])))
        dispatch(aiExtractActions.extractCleared({ bcName }))
    }, [apply, bcName, dispatch, state.fields, state.previous])

    /** the person selected a piece of the document and chose a field for it: works for any document */
    const bindSelection = useCallback(
        (id: string) => {
            const text = state.selection?.text
            if (!text) {
                return
            }
            dispatch(aiExtractActions.selectionBound({ bcName, key: id, previous: valueOf(byId.get(id)) }))
            apply({ [id]: text })
        },
        [apply, bcName, byId, dispatch, state.selection, valueOf]
    )

    const select = useCallback(
        (text: string, box: AiExtractBox) => dispatch(aiExtractActions.selectionMade({ bcName, text, box })),
        [bcName, dispatch]
    )

    const clearSelection = useCallback(() => dispatch(aiExtractActions.selectionCleared({ bcName })), [bcName, dispatch])

    const activate = useCallback((id?: string) => dispatch(aiExtractActions.fieldActivated({ bcName, key: id })), [bcName, dispatch])

    const activatePair = useCallback((pair?: number) => dispatch(aiExtractActions.pairActivated({ bcName, pair })), [bcName, dispatch])

    const toggleAllNotes = useCallback(() => dispatch(aiExtractActions.allNotesToggled({ bcName })), [bcName, dispatch])

    return {
        state,
        targets,
        valueOf,
        run,
        bind,
        unbind,
        restore,
        restoreForm,
        restoreTyped,
        remember,
        check,
        checkAll,
        reset,
        bindSelection,
        select,
        clearSelection,
        activate,
        activatePair,
        toggleAllNotes
    }
}
