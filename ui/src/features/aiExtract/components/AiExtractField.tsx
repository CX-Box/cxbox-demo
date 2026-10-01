import React, { useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import cn from 'classnames'
import { Icon, Tooltip } from 'antd'
import { useAppDispatch, useAppSelector } from '@store'
import { useGetFieldValue } from '@hooks/useGetFieldValue'
import {
    aiExtractActions,
    selectAiExtractActive,
    selectAiExtractChecked,
    selectAiExtractField,
    selectAiExtractNotFound,
    selectAiExtractOwner
} from '../aiExtractSlice'
import { fieldState } from '../state'
import AiMark from './AiMark'
import styles from '../aiExtract.module.css'

interface AiExtractFieldProps {
    bcName: string
    widgetName: string
    fieldKey?: string
    children: React.ReactNode
}

/**
 * Field of the form the document filled in: a stripe in the colour of how well the document supports the value,
 * the percent or the mark "by hand" in the corner, and a click that frames the place the value came from.
 * <p>
 * The field finds itself by "widget:key", so two widgets of one screen with the same field key, as "Заявитель"
 * and "Ответчик" have, never take each other's value, and the document may hang on a third widget entirely.
 */
function AiExtractField({ bcName, widgetName, fieldKey, children }: AiExtractFieldProps) {
    const { t } = useTranslation()
    const dispatch = useAppDispatch()
    const ref = useRef<HTMLDivElement>(null)
    const id = `${widgetName}:${fieldKey}`
    const field = useAppSelector(selectAiExtractField(fieldKey ? id : undefined))
    const owner = useAppSelector(selectAiExtractOwner(fieldKey ? id : undefined))
    const active = useAppSelector(selectAiExtractActive(fieldKey ? id : undefined))
    const checked = useAppSelector(selectAiExtractChecked(fieldKey ? id : undefined))
    const notFound = useAppSelector(selectAiExtractNotFound(fieldKey ? id : undefined))
    const cursor = useAppSelector(store => store.screen.bo.bc[bcName]?.cursor as string)
    const getValue = useGetFieldValue(bcName, cursor)

    // A form is not always a column: the field the panel walks to can stand in another column or below the fold.
    // "nearest" moves the least it can and does nothing when the field is already visible, so the screen stays
    // still while the person walks the fields of one row.
    useEffect(() => {
        if (active) {
            ref.current?.scrollIntoView({ block: 'nearest', inline: 'nearest', behavior: 'smooth' })
        }
    }, [active])

    // a field the recognition found nothing for still carries its mark: the form and the list of the panel
    // never say different things about the same field
    if (!field && !notFound) {
        return <>{children}</>
    }

    const view = fieldState(field, field ? (getValue(field.key) as string) ?? '' : undefined, checked)

    return (
        <div
            ref={ref}
            className={cn(styles.field, { [styles.fieldActive]: active })}
            data-test="AI_EXTRACT_FIELD"
            data-test-ai-id={id}
            data-test-field-key={fieldKey}
            data-test-ai-origin={view.origin}
            data-test-ai-level={view.tone}
            title={
                field?.documentValue
                    ? `${t(view.badge)} · ${t(view.hint)}. ${t('in the document: {{value}}', { value: field.documentValue })}`
                    : `${t(view.badge)} · ${t(view.hint)}`
            }
            onMouseDown={() => owner && dispatch(aiExtractActions.fieldActivated({ bcName: owner, key: id }))}
        >
            {children}
            <Tooltip
                title={
                    field?.documentValue
                        ? `${t(view.badge)} · ${t('in the document: {{value}}', { value: field.documentValue })}`
                        : `${t(view.badge)} · ${t(view.hint)}`
                }
            >
                <AiMark
                    origin={view.origin}
                    tone={view.tone}
                    className={styles.fieldBadge}
                    data-test="AI_EXTRACT_MARK"
                    onMouseDown={event => {
                        event.stopPropagation()
                        event.preventDefault()
                        if (owner) {
                            dispatch(aiExtractActions.fieldActivated({ bcName: owner, key: id }))
                        }
                    }}
                />
            </Tooltip>
        </div>
    )
}

export default React.memo(AiExtractField)
