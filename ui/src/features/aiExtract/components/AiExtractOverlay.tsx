import React, { CSSProperties, useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import cn from 'classnames'
import styles from '../aiExtract.module.css'
import { fieldState } from '../state'
import { AiExtractField, AiExtractPair, AiExtractTarget } from '../types'
import AiFieldNote, { SELECTION } from './AiFieldNote'

const NOTE_WIDTH = 230
const NOTE_HEIGHT = 96
const GAP = 10

interface Frame {
    id: string
    pair?: AiExtractPair
    field?: AiExtractField
    box: NonNullable<AiExtractField['box']>
}

interface AiExtractOverlayProps {
    current: (id: string) => string
    cursor: (bcName: string) => string
    page: number
    fields: AiExtractField[]
    pairs: AiExtractPair[]
    targets: AiExtractTarget[]
    activeKey?: string
    activePair?: number
    showAll: boolean
    /** a field the person has already approved: green on the document too, so the eye counts what is left */
    checked: (key: string) => boolean
    /** piece of the document the person selected by hand */
    selection?: { text: string; box: AiExtractField['box'] }
    onActivateField: (key?: string) => void
    onActivatePair: (pair?: number) => void
    onBind: (key: string, pair: number) => void
    onUnbind: (key: string) => void
    onBindSelection: (key: string) => void
}

/**
 * Frames over the page and values next to them.
 * <p>
 * Every pair the document was understood to hold gets a frame, not only the ones that went to the form: a
 * person who sees a wrong guess clicks any other frame and binds it to a field by hand. A frame goes around
 * the text, never over it, and a value is shown either next to the active frame or, when all of them are asked
 * for, as side notes in the margin: this way values never cover the document and never cover each other.
 */
function AiExtractOverlay({
    current,
    cursor,
    page,
    fields,
    pairs,
    targets,
    activeKey,
    activePair,
    showAll,
    checked,
    selection,
    onActivateField,
    onActivatePair,
    onBind,
    onUnbind,
    onBindSelection
}: AiExtractOverlayProps) {
    const { t } = useTranslation()
    const ref = useRef<HTMLDivElement>(null)
    const [size, setSize] = useState({ width: 0, height: 0 })
    /** real heights of the notes: a value takes one line or three, and notes must not run into each other */
    const [noteHeights, setNoteHeights] = useState<Record<string, number>>({})

    const measureNote = useCallback(
        (id: string) => (element: HTMLDivElement | null) => {
            const height = element?.offsetHeight
            if (height) {
                setNoteHeights(previous => (Math.abs((previous[id] ?? 0) - height) > 1 ? { ...previous, [id]: height } : previous))
            }
        },
        []
    )

    /** how big the page is drawn right now: the notes stand next to the frames and need the same measure */
    const measure = useCallback(() => {
        const element = ref.current
        if (!element) {
            return
        }
        const rect = element.getBoundingClientRect()
        setSize(previous =>
            Math.abs(previous.width - rect.width) > 1 || Math.abs(previous.height - rect.height) > 1
                ? { width: rect.width, height: rect.height }
                : previous
        )
    }, [])

    useLayoutEffect(() => {
        // measured here and not only when something changes: a page drawn while its tab stands in the background
        // gets neither an animation frame nor a resize of its own, and a note without a measure has nowhere to go
        measure()
        const element = ref.current
        if (!element || typeof ResizeObserver === 'undefined') {
            return
        }
        // the measure is taken on the next frame and not inside the call of the observer: a measure taken there
        // is a measure the browser has to deliver twice, and it says so out loud
        const observer = new ResizeObserver(() => window.requestAnimationFrame(measure))
        observer.observe(element)

        return () => observer.disconnect()
    }, [measure])

    const frames: Frame[] = useMemo(() => {
        const boundByPair = new Map(fields.filter(field => field.pair).map(field => [field.pair, field]))
        const selected: Frame[] =
            selection?.box?.page === page
                ? [
                      {
                          id: 'selection',
                          pair: { index: SELECTION, label: t('Selected in the document'), value: selection.text, box: selection.box },
                          box: selection.box
                      }
                  ]
                : []

        return [
            ...selected,
            ...pairs
                .filter(pair => pair.box?.page === page)
                .map(pair => ({ id: 'pair-' + pair.index, pair, field: boundByPair.get(pair.index), box: pair.box! })),
            ...fields
                .filter(field => !field.pair && field.box?.page === page)
                .map(field => ({ id: 'field-' + field.id, field, box: field.box! }))
        ]
    }, [fields, page, pairs, selection])

    useLayoutEffect(measure, [frames, measure])

    /** the frame the mouse stands on: the frames themselves never see the mouse, so hovering is told here */
    const [hovered, setHovered] = useState<string>()

    const isActive = useCallback(
        (frame: Frame) =>
            frame.id === 'selection' ||
            (activePair !== undefined && frame.pair?.index === activePair) ||
            (activeKey !== undefined && frame.field?.id === activeKey),
        [activeKey, activePair]
    )

    /**
     * A click on the page is answered by the frame it landed in, and the frames themselves stay out of the way
     * of the mouse. A layer that takes the press of the mouse takes the selecting of text with it, and selecting
     * a piece of the document is how a person binds what the recognition missed - so the frames are looked up by
     * the place of the click instead of catching it.
     */
    useEffect(() => {
        const layer = ref.current?.parentElement
        if (!layer) {
            return
        }
        const under = (event: MouseEvent) => {
            const rect = layer.getBoundingClientRect()
            const x = (event.clientX - rect.left) / rect.width
            const y = (event.clientY - rect.top) / rect.height

            return (
                frames
                    .filter(frame => x >= frame.box.x && x <= frame.box.x + frame.box.width)
                    .filter(frame => y >= frame.box.y && y <= frame.box.y + frame.box.height)
                    // frames lie one inside another: the smallest one under the mouse is the one meant
                    .sort((left, right) => left.box.width * left.box.height - right.box.width * right.box.height)[0]
            )
        }
        const onClick = (event: MouseEvent) => {
            // a piece of text the person picked out themselves is an answer of its own and is not overruled here
            if (String(window.getSelection() ?? '')) {
                return
            }
            const frame = under(event)
            if (!frame) {
                return
            }
            if (frame.pair) {
                onActivatePair(frame.pair.index)
            } else {
                onActivateField(frame.field?.id)
            }
        }
        const onMove = (event: MouseEvent) => {
            const frame = under(event)
            setHovered(frame?.id)
            layer.style.cursor = frame ? 'pointer' : ''
        }
        const onLeave = () => {
            setHovered(undefined)
            layer.style.cursor = ''
        }
        layer.addEventListener('click', onClick)
        layer.addEventListener('mousemove', onMove)
        layer.addEventListener('mouseleave', onLeave)

        return () => {
            layer.removeEventListener('click', onClick)
            layer.removeEventListener('mousemove', onMove)
            layer.removeEventListener('mouseleave', onLeave)
            layer.style.cursor = ''
        }
    }, [frames, onActivateField, onActivatePair])

    const notes = useMemo(() => {
        const { width, height } = size
        if (!width || !height) {
            return []
        }
        // a click on the document is answered where it happened: the panel can be folded away, and then the card
        // is not on the screen at all. Only the frame being looked at gets a note, so the page stays readable
        const visible = showAll ? frames.filter(frame => frame.field) : frames.filter(isActive)
        if (showAll) {
            let lastBottom = Number.NEGATIVE_INFINITY

            return visible
                .slice()
                .sort((a, b) => a.box.y - b.box.y)
                .map(frame => {
                    const top = Math.max(frame.box.y * height, lastBottom + 6)
                    lastBottom = top + (noteHeights[frame.id] ?? NOTE_HEIGHT)

                    return {
                        frame,
                        style: { left: width + GAP, top } as CSSProperties,
                        line: {
                            x1: (frame.box.x + frame.box.width) * width,
                            y1: (frame.box.y + frame.box.height / 2) * height,
                            x2: width + GAP,
                            y2: top + 12
                        }
                    }
                })
        }

        return visible.map(frame => {
            const right = (frame.box.x + frame.box.width) * width
            const left = frame.box.x * width
            const bottom = (frame.box.y + frame.box.height) * height
            // the note stands where it does not cover the frame: to the right of it, to the left, or under it
            const style: CSSProperties =
                right + GAP + NOTE_WIDTH <= width
                    ? { left: right + GAP, top: frame.box.y * height }
                    : left - GAP - NOTE_WIDTH >= 0
                    ? { left: left - GAP - NOTE_WIDTH, top: frame.box.y * height }
                    : { left: Math.max(0, Math.min(left, width - NOTE_WIDTH)), top: bottom + GAP }

            return { frame, style, line: undefined }
        })
    }, [frames, isActive, noteHeights, showAll, size])

    return (
        <div ref={ref} className={styles.overlay} data-test="AI_EXTRACT_OVERLAY" data-test-page={page}>
            {notes.some(note => note.line) && (
                <svg className={styles.connector} width={size.width} height={size.height}>
                    {notes.map(note =>
                        note.line ? (
                            <line
                                key={note.frame.id}
                                x1={note.line.x1}
                                y1={note.line.y1}
                                x2={note.line.x2}
                                y2={note.line.y2}
                                stroke="#bfbfbf"
                                strokeWidth={1}
                                strokeDasharray="3 2"
                            />
                        ) : null
                    )}
                </svg>
            )}
            {frames.map(frame => {
                const look = frame.field ? fieldState(frame.field, current(frame.field.id), checked(frame.field.id)) : undefined

                return (
                    <div
                        key={frame.id}
                        className={cn(styles.box, {
                            [styles.boxFree]: !frame.field && frame.id !== 'selection',
                            [styles.boxSelection]: frame.id === 'selection',
                            [styles.boxChecked]: look?.tone === 'done',
                            [styles.boxCheck]: look?.tone === 'wait',
                            [styles.boxGuess]: look?.tone === 'risk',
                            [styles.boxManual]: look?.origin === 'manual',
                            [styles.boxHovered]: hovered === frame.id,
                            [styles.boxActive]: isActive(frame)
                        })}
                        style={{
                            left: `${frame.box.x * 100}%`,
                            top: `${frame.box.y * 100}%`,
                            width: `${frame.box.width * 100}%`,
                            height: `${frame.box.height * 100}%`
                        }}
                        title={frame.pair ? `${frame.pair.label}: ${frame.pair.value}` : frame.field?.value}
                        data-test="AI_EXTRACT_BOX"
                        data-test-field-key={frame.field?.id}
                        data-test-pair={frame.pair?.index}
                    >
                        {/* which field of the form this very place fills: read at a glance, without hovering */}
                        {isActive(frame) && frame.field && (
                            <span
                                className={cn(styles.boxTag, {
                                    [styles.boxTagCheck]: look?.tone === 'wait',
                                    [styles.boxTagGuess]: look?.tone === 'risk',
                                    [styles.boxTagManual]: look?.origin === 'manual',
                                    [styles.boxTagChecked]: look?.tone === 'done'
                                })}
                            >
                                {targets.find(target => target.id === frame.field?.id)?.label ?? frame.field.key}
                            </span>
                        )}
                    </div>
                )
            })}
            {notes.map(note => (
                <AiFieldNote
                    key={note.frame.id}
                    activeTarget={targets.find(target => target.id === activeKey)}
                    current={current}
                    cursor={cursor}
                    pair={note.frame.pair}
                    field={note.frame.field}
                    targets={targets}
                    active={isActive(note.frame)}
                    style={note.style}
                    innerRef={measureNote(note.frame.id)}
                    onBind={onBind}
                    onUnbind={onUnbind}
                    onBindSelection={onBindSelection}
                    onActivate={() => (note.frame.pair ? onActivatePair(note.frame.pair.index) : onActivateField(note.frame.field?.key))}
                />
            ))}
        </div>
    )
}

export default React.memo(AiExtractOverlay)
