import React, { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Form as AntdForm, Icon, Tooltip } from 'antd'
import Button from '@components/ui/Button/Button'
import cn from 'classnames'
import Field from '@components/Field/Field'
import TemplatedTitle from '@components/TemplatedTitle/TemplatedTitle'
import formStyles from '@components/widgets/Form/Form.less'
import { WidgetField } from '@interfaces/widget'
import styles from '../aiExtract.module.css'
import { AiExtractBcState } from '../aiExtractSlice'
import { AiFieldOrigin, fieldState } from '../state'
import AiMark from './AiMark'
import AiExtractField from './AiExtractField'
import cardStyles from '@components/Card/Card.less'
import titleStyles from '@components/WidgetTitle/WidgetTitle.less'
import { AiExtractPair, AiExtractTarget } from '../types'

interface AiFieldCardProps {
    target: AiExtractTarget
    state: AiExtractBcState
    /** current value of the form, to tell a value corrected by hand from the one the document gave */
    current: (key: string) => string
    /** record a widget stands on: a field is edited right here, by the same component the form uses */
    cursor: (bcName: string) => string
    /** the widget is named only when the screen holds more than one of them */
    showWidget?: boolean
    onBind: (key: string, pair: number) => void
    onUnbind: (key: string) => void
    onRestore: (key: string) => void
    onRestoreForm: (key: string) => void
    onRestoreTyped: (key: string) => void
    onRemember: (key: string, value: string) => void
    onCheck: (key: string, checked?: boolean) => void
    onActivatePair: (pair?: number) => void
    onStep: (forward: boolean) => void
}

/**
 * One field under review: what stands in it, where it came from, every version of it and one move to the next
 * field. The same card is shown in the panel next to the document and over a field of the form itself, so a
 * person who works on the form and a person who walks the queue see one and the same thing.
 * <p>
 * A value has three versions and all three are named: what the form had, what the document gave and what the
 * person typed. Any of them is one click away, because a fill that cannot be undone is a fill nobody trusts.
 */
function AiFieldCard({
    target,
    state,
    current,
    cursor,
    showWidget,
    onBind,
    onUnbind,
    onRestore,
    onRestoreForm,
    onCheck,
    onActivatePair,
    onStep
}: AiFieldCardProps) {
    const { t } = useTranslation()
    const [variantsOpen, setVariants] = useState(false)
    const field = state.fields.find(item => item.id === target.id)
    const removed = state.removed[target.id]
    const checked = state.checked.includes(target.id)
    const now = current(target.id) ?? ''
    const look = fieldState(field, now, checked, !!removed)
    const byIndex = useMemo(() => new Map(state.pairs.map(pair => [pair.index, pair])), [state.pairs])
    const alternatives = (field?.alternatives ?? []).map(index => byIndex.get(index)).filter(Boolean) as AiExtractPair[]
    // the title of a widget is the widget: which page of the document the value came from is said by the frame
    // on the document itself, not by a title
    const where = target.widgetTitle ?? target.widget

    const fromForm = state.previous[target.id]
    const fromDocument = (field ?? removed)?.value

    /**
     * What the value used to be, in the order it happened: what stood in the field before the run, what the
     * document gave, what the person typed over it. What it is now is not in this list - it stands in the field
     * right above, and a value written twice on one screen is read twice and trusted less.
     * <p>
     * Every line here is one click away from coming back, because a fill nobody can undo is a fill nobody trusts.
     */
    const past = [
        // what the record itself held before the run: its glyph is the field of the form, because that is where
        // the value came from - not the document and not the hand of the person
        fromForm !== undefined ? { origin: 'form' as AiFieldOrigin, value: fromForm, back: () => onRestoreForm(target.id) } : null,
        fromDocument !== undefined ? { origin: 'document' as AiFieldOrigin, value: fromDocument, back: () => onRestore(target.id) } : null,
        { origin: 'form' as AiFieldOrigin, value: now, back: undefined }
    ]
        .filter(Boolean)
        // two steps with one and the same value are one step: the later of them is the one that happened
        .filter((step, index, all) => index === all.length - 1 || step!.value !== all[index + 1]!.value)
        // the last of them is what stands in the field now, and the field says it itself
        .slice(0, -1) as {
        origin: AiFieldOrigin
        value: string
        back?: () => void
    }[]

    return (
        <div data-test="AI_EXTRACT_CARD">
            <div className={cn(cardStyles.container, styles.card)}>
                {/* the title of a widget says where its data lives: for one field that is the widget it belongs
                    to and the page of the document it came from, cut off softly and told in full on hover */}
                <Tooltip title={where}>
                    <h2 className={cn(titleStyles.title, titleStyles.h2, styles.cardHead)}>{where}</h2>
                </Tooltip>
                {/* the field itself, dressed exactly as it is on the form: its own caption, its own control and
                    the mark in the corner of the control */}
                {/* the field is rendered by the very markup the form uses: the same label, the same item, the same
                    wrapper that puts the mark in the corner. Not "like on the form" - the form itself. */}
                <div className={cn(formStyles.formContainer, styles.cardField)}>
                    <div className={formStyles.formLabel}>
                        <TemplatedTitle widgetName={target.widget} title={target.label ?? target.key} />
                    </div>
                    <AntdForm.Item className={formStyles.formItem} data-test="FIELD" data-test-field-key={target.key}>
                        <AiExtractField bcName={target.bcName} widgetName={target.widget} fieldKey={target.key}>
                            <Field
                                bcName={target.bcName}
                                cursor={cursor(target.bcName)}
                                widgetName={target.widget}
                                widgetFieldMeta={target.meta as WidgetField}
                                disableHoverError={true}
                            />
                        </AiExtractField>
                    </AntdForm.Item>
                </div>
                {/* what the value used to be, right under the field it used to stand in: struck through,
                    and every line of it one click away from coming back */}
                {past.length > 0 && (
                    <div className={styles.changed} data-test="AI_EXTRACT_CHANGED">
                        {past.map((step, index) => (
                            <div key={index} className={styles.changedStep}>
                                <AiMark origin={step.origin} className={styles.changedMark} />
                                <span
                                    className={cn(styles.changedLine, styles.changedOld, { [styles.changedEmpty]: !step.value })}
                                    title={step.value}
                                >
                                    {step.value || t('empty')}
                                </span>
                                <Tooltip title={t('take this value back')}>
                                    <Icon
                                        className={styles.changedBack}
                                        type="rollback"
                                        data-test="AI_EXTRACT_REVERT"
                                        onClick={() => {
                                            step.back?.()
                                            onCheck(target.id, false)
                                        }}
                                    />
                                </Tooltip>
                            </div>
                        ))}
                    </div>
                )}
                {/* one short line under it all: how sure the machine is and what that means in a word. The whole
                    sentence lives in the tooltip, where it costs no room. */}
                <Tooltip title={t(look.hint)}>
                    <div className={styles.cardHint}>
                        <span className={styles.cardState}>{t(look.badge)}</span>
                        {look.origin === 'document' && !checked ? ` ${t('found')}` : ''}
                    </div>
                </Tooltip>
                {field?.documentValue && (
                    <div className={styles.reviewNote}>{t('in the document: {{value}}', { value: field.documentValue })}</div>
                )}
                {alternatives.length > 0 && (
                    <div className={styles.cardVariants}>
                        <span
                            className={styles.cardVariantsTitle}
                            data-test="AI_EXTRACT_VARIANTS"
                            onClick={() => setVariants(opened => !opened)}
                        >
                            <Icon type={variantsOpen ? 'down' : 'right'} /> {t('Other places in the document')} ({alternatives.length})
                        </span>
                        {variantsOpen &&
                            alternatives.map(pair => (
                                <div
                                    key={pair.index}
                                    className={styles.reviewAlternative}
                                    data-test="AI_EXTRACT_ALTERNATIVE"
                                    onMouseEnter={() => onActivatePair(pair.index)}
                                    onClick={() => onBind(target.id, pair.index)}
                                >
                                    <span className={styles.reviewAlternativeLabel}>{pair.label}</span>
                                    <span>{pair.value}</span>
                                </div>
                            ))}
                    </div>
                )}
            </div>
        </div>
    )
}

export default React.memo(AiFieldCard)
