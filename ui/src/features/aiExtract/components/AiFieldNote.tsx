import React, { CSSProperties } from 'react'
import { useTranslation } from 'react-i18next'
import { Icon, Select, Tooltip } from 'antd'
import cn from 'classnames'
import Field from '@components/Field/Field'
import { WidgetField } from '@interfaces/widget'
import styles from '../aiExtract.module.css'
import { fieldState } from '../state'
import { AiExtractField, AiExtractPair, AiExtractTarget } from '../types'

const NOT_BOUND = ''

/** a note of a piece the person selected by hand, not of a pair found by the automation */
export const SELECTION = -1

interface AiFieldNoteProps {
    /** the field open in the panel right now: a selection goes into it in one click */
    activeTarget?: AiExtractTarget
    /** current value of a field by its id: a value corrected by hand differs from the one the document gave */
    current: (id: string) => string
    /** record the widget of a field stands on: every widget has its own business component */
    cursor: (bcName: string) => string
    /** pair of the document this note stands at, if the note came from a pair */
    pair?: AiExtractPair
    /** value put on a field of the form, if this pair is bound to one */
    field?: AiExtractField
    targets: AiExtractTarget[]
    active: boolean
    style?: CSSProperties
    innerRef?: (element: HTMLDivElement | null) => void
    onBind: (key: string, pair: number) => void
    onUnbind: (key: string) => void
    onBindSelection?: (key: string) => void
    onActivate: () => void
}

/**
 * Note next to a frame on the document: what the document says here, which field of the form took it, and the
 * field itself. The field is rendered by the platform, the same component the form renders, so its type,
 * dictionary and validation behave exactly as on the form and a correction goes to the form at once.
 */
function AiFieldNote({
    activeTarget,
    current,
    cursor,
    pair,
    field,
    targets,
    active,
    style,
    innerRef,
    onBind,
    onUnbind,
    onBindSelection,
    onActivate
}: AiFieldNoteProps) {
    const { t } = useTranslation()
    const target = targets.find(item => item.id === field?.id)
    const view = fieldState(field, field ? current(field.id) : undefined)

    const handleBind = (key: string) => {
        if (key === NOT_BOUND) {
            if (field) {
                onUnbind(field.id)
            }

            return
        }
        if (pair?.index === SELECTION) {
            onBindSelection?.(key)

            return
        }
        if (pair) {
            onBind(key, pair.index)
        }
    }

    return (
        <div
            ref={innerRef}
            className={cn(styles.note, {
                [styles.noteCheck]: field && view.tone === 'wait',
                [styles.noteFree]: !field,
                [styles.noteActive]: active
            })}
            style={style}
            data-test="AI_EXTRACT_NOTE"
            data-test-field-key={field?.id}
            data-test-pair={pair?.index}
            onMouseDown={event => {
                event.stopPropagation()
                onActivate()
            }}
        >
            {pair && (
                <div className={styles.noteLabel} title={`${pair.label}: ${pair.value}`}>
                    {pair.label}
                </div>
            )}
            {/* the piece selected by hand goes into the open field in one click, the way Rossum does it */}
            {pair?.index === SELECTION && activeTarget && (
                <button
                    type="button"
                    className={styles.noteApply}
                    data-test="AI_EXTRACT_APPLY_SELECTION"
                    onClick={() => onBindSelection?.(activeTarget.id)}
                >
                    <Icon type="arrow-left" /> {t('Set as {{field}}', { field: activeTarget.label ?? activeTarget.key })}
                </button>
            )}
            {pair && (
                <Select
                    size="small"
                    className={styles.noteSelect}
                    value={field?.id ?? NOT_BOUND}
                    onChange={handleBind}
                    data-test="AI_EXTRACT_BIND"
                    dropdownMatchSelectWidth={false}
                    showSearch={true}
                    optionFilterProp="children"
                >
                    <Select.Option value={NOT_BOUND}>{t('not bound')}</Select.Option>
                    {targets.map(item => (
                        <Select.Option key={item.id} value={item.id}>
                            {item.widgetTitle ? `${item.widgetTitle} · ${item.label ?? item.key}` : item.label ?? item.key}
                        </Select.Option>
                    ))}
                </Select>
            )}
            {field && target && (
                <div className={styles.noteField}>
                    <Field
                        bcName={target.bcName}
                        cursor={cursor(target.bcName)}
                        widgetName={target.widget}
                        widgetFieldMeta={target.meta as WidgetField}
                        disableHoverError={true}
                    />
                </div>
            )}
            {!field && pair && <div className={styles.noteValue}>{pair.value}</div>}
            {field?.documentValue && (
                <div className={styles.noteDiff}>{t('in the document: {{value}}', { value: field.documentValue })}</div>
            )}
            {pair && (
                <Tooltip title={t('Copy the value')}>
                    <button
                        type="button"
                        className={styles.noteCopy}
                        data-test="AI_EXTRACT_COPY"
                        onClick={() => navigator.clipboard?.writeText(pair.value)}
                    >
                        <Icon type="copy" /> {t('copy')}
                    </button>
                </Tooltip>
            )}
            <div className={styles.noteHint}>
                {field?.box || pair?.box ? `${t('page {{page}}', { page: (field?.box ?? pair?.box)?.page })} · ` : ''}
                {field ? `${t(view.badge)} · ${t(view.hint)}` : t('not placed on the form')}
            </div>
        </div>
    )
}

export default React.memo(AiFieldNote)
