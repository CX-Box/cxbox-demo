import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Col, Icon, Input, Row, Tooltip, Table } from 'antd'
import Button from '@components/ui/Button/Button'
import cn from 'classnames'
import Field from '@components/Field/Field'
import { WidgetField } from '@interfaces/widget'
import styles from '../aiExtract.module.css'
import cardStyles from '@components/Card/Card.less'
import listStyles from '@components/widgets/AdditionalListWidget/AdditionalListWidget.module.css'
import infoStyles from '@components/widgets/AdditionalInfo/AdditionalInfoItem.module.css'
import titleStyles from '@components/WidgetTitle/WidgetTitle.less'
import { AiExtractBcState } from '../aiExtractSlice'
import { fieldState } from '../state'
import AiMark from './AiMark'
import { AiExtractPair, AiExtractTarget } from '../types'
import AiFieldCard from './AiFieldCard'

interface AiReviewPanelProps {
    state: AiExtractBcState
    targets: AiExtractTarget[]
    /** current values of the form, to tell a value corrected by hand from the one the document gave */
    current: (key: string) => string
    /** record a widget stands on: a field is edited right here, by the same component the form uses */
    cursor: (bcName: string) => string
    onActivateField: (key?: string) => void
    onActivatePair: (pair?: number) => void
    onBind: (key: string, pair: number) => void
    onUnbind: (key: string) => void
    /** put back what the recognition gave, after the person corrected it or took it off */
    onRestore: (key: string) => void
    /** put back what the form had before the recognition wrote over it */
    onRestoreForm: (key: string) => void
    /** put back what the person typed by hand */
    onRestoreTyped: (key: string) => void
    /** remember what the person typed by hand */
    onRemember: (key: string, value: string) => void
    /** the person looked at the field and confirmed it */
    onCheck: (key: string, checked?: boolean) => void
    onCheckAll: (checked?: boolean) => void
    /** take everything the recognition did off the form */
    onReset: () => void
}

/**
 * Checking the result and fixing it. The field being looked at stands open with its value, its place in the
 * document and the other places the document offers for it; the rest of the fields are a short list underneath,
 * and under them everything that was recognized but went nowhere.
 * <p>
 * The person walks the fields as a queue: the head of the panel says how many of them the document supports
 * poorly, Enter confirms a field and moves on, the arrows walk without the mouse. A confirmed field leaves the
 * queue and keeps its mark - the trace of the check, both for the person on a long form and for whoever looks
 * at the card afterwards.
 */
function AiReviewPanel({
    state,
    targets,
    current,
    cursor,
    onActivateField,
    onActivatePair,
    onBind,
    onUnbind,
    onRestore,
    onRestoreForm,
    onRestoreTyped,
    onRemember,
    onCheck,
    onCheckAll,
    onReset
}: AiReviewPanelProps) {
    const { t } = useTranslation()
    const [search, setSearch] = useState('')
    const [variantsOpen, setVariants] = useState(false)
    // a contract gives a hundred pairs: a wall of them is not a list a person can use, so it folds away
    const [leftoversOpen, setLeftovers] = useState(false)
    const [fieldsOpen, setFieldsOpen] = useState(true)
    // the document is the reason this screen exists: the panel folds away so the page can be read
    const [open, setOpen] = useState(true)
    const panelRef = useRef<HTMLDivElement>(null)
    const rowsRef = useRef<Record<string, HTMLDivElement | null>>({})

    const byIndex = useMemo(() => new Map(state.pairs.map(pair => [pair.index, pair])), [state.pairs])
    const boundPairs = useMemo(() => new Set(state.fields.map(field => field.pair).filter(Boolean)), [state.fields])
    const checked = useMemo(() => new Set(state.checked), [state.checked])

    const view = useCallback(
        (target: AiExtractTarget) => {
            const field = state.fields.find(item => item.id === target.id)

            return { field, look: fieldState(field, field ? current(target.id) : undefined, checked.has(target.id)) }
        },
        [checked, current, state.fields]
    )

    /** what is left to go through: a field the person has confirmed leaves the list, whatever its percent */
    const queue = useMemo(() => targets.filter(target => !checked.has(target.id)), [checked, targets])

    /**
     * What the head of the panel counts: exactly the fields that wear yellow. The colour promises "you are
     * being called here" and the number has to mean the same thing, or one of the two is lying.
     */
    /** what is left to go through: everything that is not green, an empty field included */
    const toCheck = useMemo(() => queue.filter(target => view(target).look.tone !== 'done'), [queue, view])

    const active = targets.find(target => target.id === state.activeKey) ?? toCheck[0] ?? queue[0] ?? targets[0]
    const filled = state.fields.length

    /**
     * The walk goes over the fields of the form in their own order and stops at the edges: a person reads a form
     * from top to bottom, and an order that reshuffles itself after every answer takes the ground from under
     * their feet. Fields already confirmed are stepped over.
     */
    const step = useCallback(
        (forward: boolean) => {
            const at = targets.findIndex(target => target.id === active?.id)
            for (let index = at + (forward ? 1 : -1); index >= 0 && index < targets.length; index += forward ? 1 : -1) {
                if (!checked.has(targets[index].id) || queue.length === 0) {
                    onActivateField(targets[index].id)

                    return
                }
            }
        },
        [active, checked, onActivateField, queue.length, targets]
    )

    // the arrows walk the fields, but stay quiet while a value is being typed
    useEffect(() => {
        const element = panelRef.current
        if (!element) {
            return
        }
        const onKey = (event: KeyboardEvent) => {
            if ((event.target as HTMLElement)?.closest('input, textarea, [contenteditable="true"], .ant-select')) {
                return
            }
            if (event.key === 'ArrowDown' || event.key === 'ArrowRight' || (event.key === 'Tab' && !event.shiftKey)) {
                event.preventDefault()
                step(true)
            } else if (event.key === 'ArrowUp' || event.key === 'ArrowLeft' || (event.key === 'Tab' && event.shiftKey)) {
                event.preventDefault()
                step(false)
            } else if (event.key === 'Enter' && active) {
                event.preventDefault()
                onCheck(active.id)
                step(true)
            }
        }
        element.addEventListener('keydown', onKey)

        return () => element.removeEventListener('keydown', onKey)
    }, [active, onCheck, step])

    // the row of the open field is kept in sight, and only the panel scrolls
    useEffect(() => {
        const panel = panelRef.current
        const row = active && rowsRef.current[active.id]
        if (!panel || !row) {
            return
        }
        const top = row.offsetTop - panel.offsetTop
        if (top < panel.scrollTop) {
            panel.scrollTop = top - 8
        } else if (top + row.offsetHeight > panel.scrollTop + panel.clientHeight) {
            panel.scrollTop = top + row.offsetHeight - panel.clientHeight + 8
        }
    }, [active])

    const free = useMemo(() => {
        const query = search.trim().toLowerCase()

        return state.pairs
            .filter(pair => !boundPairs.has(pair.index))
            .filter(pair => !query || `${pair.label} ${pair.value}`.toLowerCase().includes(query))
    }, [boundPairs, search, state.pairs])

    /**
     * A line of the list is what the platform calls an additional form: the caption of the field in grey on the
     * left, its value on the right. The mark stands before the caption, and clicking the line opens the field.
     */
    /**
     * The fields are a list and a person walks it row by row, so it is drawn as a list of the platform: its
     * table, its rows, its hover and its selected row. A form has no cursor over its fields; a list has, and
     * that is what is being done here. The mark is a column of its own, the way a list keeps its marks.
     */
    const columns = useMemo(
        () => [
            {
                key: 'mark',
                width: 28,
                render: (_: unknown, target: AiExtractTarget) => {
                    const { look } = view(target)

                    return <AiMark origin={look.origin} tone={look.tone} className={styles.queueMark} />
                }
            },
            {
                key: 'field',
                width: '38%',
                render: (_: unknown, target: AiExtractTarget) => <span className={styles.queueName}>{target.label ?? target.key}</span>
            },
            {
                key: 'value',
                render: (_: unknown, target: AiExtractTarget) => {
                    const { field } = view(target)
                    const value = current(target.id) || field?.value || ''

                    return (
                        <span className={styles.queueValue} title={value}>
                            {value || <span className={styles.reviewEmpty}>{t('empty')}</span>}
                        </span>
                    )
                }
            }
        ],
        [current, t, view]
    )

    /** the same list for what the document holds besides the form: its caption and its value */
    const pairColumns = useMemo(
        () => [
            {
                key: 'label',
                width: '38%',
                render: (_: unknown, pair: AiExtractPair) => (
                    <span className={styles.queueName} title={pair.label}>
                        {pair.label}
                    </span>
                )
            },
            {
                key: 'value',
                render: (_: unknown, pair: AiExtractPair) => (
                    <span className={styles.queueValue} title={pair.value}>
                        {pair.value}
                    </span>
                )
            }
        ],
        []
    )

    /** fields grouped by the widget that renders them: one screen can hold two forms of one record */
    const widgets = useMemo(() => {
        const byWidget = new Map<string, AiExtractTarget[]>()
        targets.forEach(target => {
            const title = target.widgetTitle || target.widget
            byWidget.set(title, [...(byWidget.get(title) ?? []), target])
        })

        return Array.from(byWidget.entries())
    }, [targets])

    const card = active ? (
        <AiFieldCard
            target={active}
            state={state}
            current={current}
            cursor={cursor}
            showWidget={widgets.length > 1}
            onBind={onBind}
            onUnbind={onUnbind}
            onRestore={onRestore}
            onRestoreForm={onRestoreForm}
            onRestoreTyped={onRestoreTyped}
            onRemember={onRemember}
            onCheck={onCheck}
            onActivatePair={onActivatePair}
            onStep={step}
        />
    ) : null

    return (
        <div
            className={cn(styles.review, { [styles.reviewFolded]: !open })}
            // the folded width is set here and not in a class: it is the one number the panel cannot afford to
            // lose to a stylesheet that happens to be loaded later
            style={open ? undefined : { width: 24, minWidth: 0, flex: '0 0 24px', overflow: 'hidden' }}
            data-test="AI_EXTRACT_REVIEW"
            ref={panelRef}
            tabIndex={-1}
        >
            {!open ? (
                <Tooltip title={t('Show the list')} placement="left">
                    <div className={styles.reviewStrip} data-test="AI_EXTRACT_FOLD" onClick={() => setOpen(true)}>
                        <Icon type="double-left" />
                        {toCheck.length > 0 && <span className={styles.reviewStripCount}>{toCheck.length}</span>}
                    </div>
                </Tooltip>
            ) : (
                <>
                    {/* The buttons come first and nothing stands above them: a person walks the fields from here
                        and this row is the one place their eyes and their mouse return to. */}
                    {active && (
                        <div className={cn(cardStyles.container, styles.top)}>
                            <div className={styles.cardTools}>
                                <Tooltip title={t('Enter confirms and moves on, Tab and the arrows walk the fields')}>
                                    {/* a button says what it will do, never what the field already is: the state of a
                                        field is told by its mark, in one place and one way */}
                                    <Button
                                        type={checked.has(active.id) ? 'formOperation' : 'customDefault'}
                                        icon={checked.has(active.id) ? 'undo' : 'check'}
                                        data-test="AI_EXTRACT_CHECK"
                                        onClick={() => {
                                            if (checked.has(active.id)) {
                                                onCheck(active.id, false)

                                                return
                                            }
                                            onCheck(active.id)
                                            step(true)
                                        }}
                                    >
                                        {checked.has(active.id) ? t('Unverify') : t('Verify')}
                                    </Button>
                                </Tooltip>
                                <Tooltip title={t('Previous field')}>
                                    <Button type="formOperation" icon="left" data-test="AI_EXTRACT_PREV" onClick={() => step(false)} />
                                </Tooltip>
                                <Tooltip title={t('Next field')}>
                                    <Button type="formOperation" icon="right" data-test="AI_EXTRACT_NEXT" onClick={() => step(true)} />
                                </Tooltip>
                                {/* the fold belongs to the panel and not to the field, so it stands apart from the
                                    buttons that act on the value, and its arrow runs into a wall: it is not a step */}
                                <span className={styles.cardNav}>
                                    <Tooltip title={t('Hide the list')}>
                                        <Button
                                            type="formOperation"
                                            icon="double-right"
                                            data-test="AI_EXTRACT_HIDE"
                                            onClick={() => setOpen(false)}
                                        />
                                    </Tooltip>
                                </span>
                            </div>
                        </div>
                    )}

                    {queue.length === 0 && (
                        <div className={cn(cardStyles.container, styles.done)} data-test="AI_EXTRACT_DONE">
                            <AiMark origin="document" tone="done" />
                            <span>{t('All fields verified')}</span>
                        </div>
                    )}

                    {filled === 0 && (
                        <div className={styles.empty} data-test="AI_EXTRACT_NOTHING">
                            <Icon type="file-search" className={styles.emptyIcon} />
                            <div>{t('No value for this form was found in the document')}</div>
                            <div className={styles.emptyHint}>{t('Select the needed place in the document and bind it to a field')}</div>
                        </div>
                    )}

                    {card}

                    {/* the fields of the form as a widget of their own: a title and the rows under it */}
                    <div className={cn(cardStyles.container, styles.listCard)}>
                        <h2
                            className={cn(titleStyles.title, titleStyles.h2, styles.reviewSection, styles.reviewSectionButton)}
                            data-test="AI_EXTRACT_FIELDS_SECTION"
                            onClick={() => setFieldsOpen(open => !open)}
                        >
                            <span>
                                <Icon type={fieldsOpen ? 'down' : 'right'} /> {t('Form fields')}
                                {/* the marks are three words long: a person should not have to guess what a question mark means */}
                                <Tooltip
                                    title={
                                        <div>
                                            <div>{t('the icon says where the value came from')}</div>
                                            <div>
                                                {t(
                                                    'sheet — out of the document, field — what stood in it before, pencil — you typed it, dash — nothing was found'
                                                )}
                                            </div>
                                            <div>{t('the colour says how far the work is')}</div>
                                            <div>
                                                {t('yellow — still to go through, red — the document barely supports it, green — verified')}
                                            </div>
                                        </div>
                                    }
                                >
                                    <Icon className={styles.reviewHelp} type="info-circle" data-test="AI_EXTRACT_LEGEND" />
                                </Tooltip>
                            </span>
                            {/* the button that closes the whole list stands on the list, the way a widget keeps its
                                own buttons in its own title */}
                            {targets.length > 1 && (
                                <Tooltip
                                    title={queue.length === 0 ? t('Take back the check of every field') : t('Confirm every field at once')}
                                >
                                    <Button
                                        type="formOperation"
                                        className={styles.reviewSectionAction}
                                        icon={queue.length === 0 ? 'undo' : 'check'}
                                        data-test="AI_EXTRACT_CHECK_ALL"
                                        onClick={event => {
                                            event.stopPropagation()
                                            onCheckAll(queue.length > 0)
                                        }}
                                    />
                                </Tooltip>
                            )}
                        </h2>
                        {fieldsOpen &&
                            widgets.map(([title, items]) => (
                                <React.Fragment key={title}>
                                    {widgets.length > 1 && <div className={styles.reviewWidget}>{title}</div>}
                                    <Table
                                        className={cn(listStyles.container, styles.queueTable)}
                                        rowKey="id"
                                        showHeader={false}
                                        pagination={false}
                                        columns={columns}
                                        dataSource={items}
                                        rowClassName={(target: AiExtractTarget) =>
                                            cn(styles.queueRow, { [styles.queueRowActive]: target.id === active?.id })
                                        }
                                        onRow={(target: AiExtractTarget) => ({
                                            'data-test': 'AI_EXTRACT_REVIEW_FIELD',
                                            'data-test-field-key': target.id,
                                            'data-test-ai-origin': view(target).look.origin,
                                            'data-test-ai-level': view(target).look.tone,
                                            onClick: () => onActivateField(target.id)
                                        })}
                                    />
                                </React.Fragment>
                            ))}
                    </div>

                    {/* what the document holds besides the form: a widget of its own, folded until it is asked for */}
                    <div className={cn(cardStyles.container, styles.listCard)}>
                        <h2
                            className={cn(titleStyles.title, titleStyles.h2, styles.reviewSection, styles.reviewSectionButton)}
                            data-test="AI_EXTRACT_LEFTOVERS"
                            onClick={() => setLeftovers(open => !open)}
                        >
                            <span>
                                <Icon type={leftoversOpen ? 'down' : 'right'} /> {t('Not placed on the form')}
                            </span>
                            <span className={styles.reviewCount}>{free.length}</span>
                        </h2>
                        {leftoversOpen && state.pairs.length > 6 && (
                            <Input
                                className={styles.reviewSearch}
                                placeholder={t('Search in the document')}
                                prefix={<Icon type="search" />}
                                value={search}
                                onChange={event => setSearch(event.target.value)}
                                data-test="AI_EXTRACT_SEARCH"
                            />
                        )}
                        {leftoversOpen && free.length === 0 && (
                            <div className={styles.emptySmall}>
                                {state.pairs.length
                                    ? t('Everything found in the document is placed on the form')
                                    : t('No pairs were found in the document')}
                            </div>
                        )}
                        {leftoversOpen && free.length > 0 && (
                            <Table
                                className={cn(listStyles.container, styles.queueTable)}
                                rowKey="index"
                                showHeader={false}
                                pagination={false}
                                columns={pairColumns}
                                dataSource={free}
                                rowClassName={(pair: AiExtractPair) =>
                                    cn(styles.queueRow, { [styles.queueRowActive]: pair.index === state.activePair })
                                }
                                onRow={(pair: AiExtractPair) => ({
                                    'data-test': 'AI_EXTRACT_FREE_PAIR',
                                    'data-test-pair': pair.index,
                                    onMouseEnter: () => onActivatePair(pair.index),
                                    onClick: () => active && onBind(active.id, pair.index)
                                })}
                            />
                        )}
                    </div>
                </>
            )}
        </div>
    )
}

export default React.memo(AiReviewPanel)
