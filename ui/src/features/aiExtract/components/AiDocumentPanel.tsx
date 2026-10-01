import React, { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Popconfirm, Spin, Tooltip } from 'antd'
import Button from '@components/ui/Button/Button'
import { Document, Page, pdfjs } from 'react-pdf'
import 'react-pdf/dist/Page/TextLayer.css'
import workerSrc from 'pdfjs-dist/build/pdf.worker.min.js'
import { useAppSelector } from '@store'
import { useFileFieldData } from '@hooks/useFileFieldData'
import { AppWidgetTableMeta, FileUploadFieldMeta } from '@interfaces/widget'
import DocumentErrorBoundary from '@components/FileViewer/components/PdfViewer/components/DocumentErrorBoundary'
import { useFileUrl } from '@components/FileViewer/core/useFileUrl'
import styles from '../aiExtract.module.css'
import { useAiExtract } from '../hooks/useAiExtract'
import AiExtractOverlay from './AiExtractOverlay'
import AiReviewPanel from './AiReviewPanel'

pdfjs.GlobalWorkerOptions.workerSrc = workerSrc

/** the document takes the whole width of its half: the panel of the result stands next to it anyway */
const NOTE_GUTTER = 24

/**
 * Below this a page of a4 turns into a grey rectangle where nothing can be read, and the whole point of showing
 * the document next to the form is lost. A narrow column gets a horizontal scroll instead of unreadable text.
 */
const READABLE_WIDTH = 640

interface AiDocumentPanelProps {
    widgetMeta: AppWidgetTableMeta
    fieldMeta: FileUploadFieldMeta
}

/**
 * Document next to the form: recognition is started here, the result is checked here and corrected here.
 * <p>
 * The left half is the document itself with frames over the pieces it was understood to hold, the right half
 * is the panel of the result: which field took which value, how well the document supports it, and everything
 * that was recognized but went nowhere.
 */
function AiDocumentPanel({ widgetMeta, fieldMeta }: AiDocumentPanelProps) {
    const { t } = useTranslation()
    const bcName = widgetMeta.bcName
    const cursor = useAppSelector(store => store.screen.bo.bc[bcName]?.cursor as string)
    const { fileName, downloadUrl, fileId } = useFileFieldData(
        bcName,
        cursor,
        fieldMeta.key,
        fieldMeta.fileIdKey as string,
        fieldMeta.fileSource
    )
    // the file is behind the api, so it is taken the same way the platform viewer takes it: by token, into a blob
    const { blobUrl, loading } = useFileUrl(downloadUrl)
    const {
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
        activatePair
    } = useAiExtract(bcName, fileId as string)
    const cursors = useAppSelector(store => store.screen.bo.bc)

    /** anything selected in the document can be bound to a field: this is what makes any document workable */
    const handleSelection = useCallback(() => {
        const selection = window.getSelection()
        const text = selection?.toString().trim()
        if (!selection || selection.isCollapsed || !text) {
            clearSelection()

            return
        }
        const range = selection.getRangeAt(0)
        const start = range.startContainer
        const element = (start.nodeType === 1 ? (start as Element) : start.parentElement)?.closest('[data-page]')
        if (!element) {
            clearSelection()

            return
        }
        const page = Number(element.getAttribute('data-page'))
        const pageRect = element.getBoundingClientRect()
        const rects = Array.from(range.getClientRects()).filter(rect => rect.width > 0 && rect.height > 0)
        if (!rects.length) {
            clearSelection()

            return
        }
        const left = Math.min(...rects.map(rect => rect.left))
        const top = Math.min(...rects.map(rect => rect.top))
        const right = Math.max(...rects.map(rect => rect.right))
        const bottom = Math.max(...rects.map(rect => rect.bottom))
        select(text, {
            page,
            x: (left - pageRect.left) / pageRect.width,
            y: (top - pageRect.top) / pageRect.height,
            width: (right - left) / pageRect.width,
            height: (bottom - top) / pageRect.height
        })
    }, [clearSelection, select])

    const scrollRef = useRef<HTMLDivElement>(null)
    const [pageWidth, setPageWidth] = useState(0)
    const [pages, setPages] = useState(0)
    // the document is checked by eye, so the person decides how big it is, not the width of the column
    const [zoom, setZoom] = useState(1)

    useLayoutEffect(() => {
        const element = scrollRef.current
        if (!element) {
            return
        }
        // the first width is taken right away: waiting for a resize means an empty white area at the start
        setPageWidth(Math.max(READABLE_WIDTH, element.clientWidth - NOTE_GUTTER))
        if (typeof ResizeObserver === 'undefined') {
            return
        }
        const observer = new ResizeObserver(entries => {
            const next = Math.max(READABLE_WIDTH, entries[0].contentRect.width - NOTE_GUTTER)
            window.requestAnimationFrame(() => setPageWidth(previous => (Math.abs(previous - next) > 1 ? next : previous)))
        })
        observer.observe(element)

        return () => observer.disconnect()
    }, [])

    // the frame itself is scrolled to, not the page it stands on: a page is taller than the screen, and the
    // person who clicked a field wants to see the very line the value came from
    useEffect(() => {
        const selector =
            state.activePair !== undefined
                ? `[data-test="AI_EXTRACT_BOX"][data-test-pair="${state.activePair}"]`
                : state.activeKey && `[data-test="AI_EXTRACT_BOX"][data-test-field-key="${state.activeKey}"]`
        if (!selector) {
            return
        }
        const box = scrollRef.current?.querySelector(selector) as HTMLElement | null
        const view = scrollRef.current
        if (!box || !view) {
            return
        }
        // only the document moves: scrollIntoView drags every scrollable parent, and the page jumps away
        const rect = box.getBoundingClientRect()
        const area = view.getBoundingClientRect()
        const top = rect.top - area.top + view.scrollTop
        const wanted = top - view.clientHeight / 2 + box.offsetHeight / 2
        // a page of a4 is wider than half a screen, so the document is scrolled sideways too and the place the
        // value came from can stand past the right edge: the person is told "here it is" and sees nothing
        const left = rect.left - area.left + view.scrollLeft
        const outside = rect.left < area.left || rect.right > area.right
        // sideways the document moves as little as it can: centring the frame would push the left half of the
        // page out of sight and the person would lose the document they were reading
        const wantedLeft = !outside ? view.scrollLeft : rect.left < area.left ? left - 24 : left + rect.width - view.clientWidth + 24
        if (Math.abs(wanted - view.scrollTop) > 8 || outside) {
            view.scrollTo({ top: Math.max(0, wanted), left: Math.max(0, wantedLeft), behavior: 'smooth' })
        }
    }, [state.activeKey, state.activePair, state.fields])

    // where the eye is in a document of seven pages: without it a person scrolls and loses the count
    const [page, setPage] = useState(1)
    const onScroll = useCallback(() => {
        const view = scrollRef.current
        if (!view) {
            return
        }
        const middle = view.getBoundingClientRect().top + view.clientHeight / 3
        const shown = Array.from(view.querySelectorAll('[data-page]')).find(element => element.getBoundingClientRect().bottom > middle)
        setPage(Number(shown?.getAttribute('data-page') ?? 1))
    }, [])

    const byId = useMemo(() => new Map(targets.map(target => [target.id, target])), [targets])
    const current = useCallback((id: string) => valueOf(byId.get(id)), [byId, valueOf])
    const cursorOf = useCallback((bc: string) => cursors[bc]?.cursor as string, [cursors])
    const isChecked = useCallback((key: string) => state.checked.includes(key), [state.checked])
    const done = state.status === 'done'
    // the person has already worked with the result: a second run is not a free action any more
    const touched = done && (state.checked.length > 0 || Object.keys(state.removed).length > 0)

    return (
        <div className={styles.panel} data-test="AI_EXTRACT_PANEL">
            <div className={styles.header}>
                <Popconfirm
                    // a second run overwrites what the person has already fixed, so it is asked about
                    title={t('Recognize again? The values you have corrected will be replaced.')}
                    okText={t('Recognize')}
                    cancelText={t('Cancel')}
                    placement="bottomRight"
                    disabled={!touched}
                    onConfirm={run}
                >
                    <Tooltip
                        title={done ? t('Recognize the document again') : t('Fill the fields of the form with values from the document')}
                    >
                        <Button
                            type={done ? 'formOperation' : 'customDefault'}
                            icon="scan"
                            disabled={!fileId || !targets.length}
                            loading={state.status === 'loading'}
                            onClick={touched ? undefined : run}
                            data-test="AI_EXTRACT_RUN"
                        >
                            {done ? t('Recognize again') : t('Recognize')}
                        </Button>
                    </Tooltip>
                </Popconfirm>
                <span className={styles.fileName} title={fileName}>
                    {fileName || t('No document attached')}
                </span>
                {done && (
                    <span className={styles.summary} title={`${state.model ?? ''} · ${state.durationMs ?? 0} ms`}>
                        {t('{{filled}} of {{total}} fields filled', { filled: state.fields.length, total: targets.length })}
                    </span>
                )}
                {pages > 1 && (
                    <span className={styles.pages} data-test="AI_EXTRACT_PAGES">
                        {t('page {{page}} of {{pages}}', { page, pages })}
                    </span>
                )}
                <span className={styles.zoom}>
                    <Tooltip title={t('Zoom out')}>
                        <Button type="empty" icon="zoom-out" disabled={zoom <= 0.6} onClick={() => setZoom(value => value - 0.2)} />
                    </Tooltip>
                    <span className={styles.zoomValue} data-test="AI_EXTRACT_ZOOM">
                        {Math.round(zoom * 100)}%
                    </span>
                    <Tooltip title={t('Zoom in')}>
                        <Button type="empty" icon="zoom-in" disabled={zoom >= 3} onClick={() => setZoom(value => value + 0.2)} />
                    </Tooltip>
                </span>
            </div>
            {state.status === 'error' && (
                <div className={styles.error} data-test="AI_EXTRACT_ERROR">
                    {state.error}
                </div>
            )}
            <div className={styles.body}>
                {state.status === 'loading' && (
                    <div className={styles.working} data-test="AI_EXTRACT_WORKING">
                        <Spin />
                        <div className={styles.workingTitle}>{t('Reading the document')}</div>
                        <div className={styles.workingHint}>
                            {t('The model is going through {{count}} fields of the form. It usually takes 10 to 30 seconds.', {
                                count: targets.length
                            })}
                        </div>
                    </div>
                )}

                <div
                    className={styles.document}
                    ref={scrollRef}
                    onScroll={onScroll}
                    onMouseDown={() => {
                        activate(undefined)
                        activatePair(undefined)
                    }}
                    onMouseUp={handleSelection}
                >
                    {loading && <Spin />}
                    {blobUrl && (
                        <DocumentErrorBoundary>
                            <Document
                                file={blobUrl}
                                loading={<Spin />}
                                onLoadSuccess={({ numPages }: { numPages: number }) => setPages(numPages)}
                            >
                                {Array.from({ length: pages }, (_, index) => index + 1).map(page => (
                                    <div
                                        key={page}
                                        className={styles.pageWrapper}
                                        data-page={page}
                                        style={{ width: Math.round(pageWidth * zoom) }}
                                    >
                                        <Page
                                            pageNumber={page}
                                            width={Math.round(pageWidth * zoom)}
                                            renderTextLayer={true}
                                            renderAnnotationLayer={false}
                                        />
                                        <AiExtractOverlay
                                            current={current}
                                            cursor={cursorOf}
                                            page={page}
                                            fields={state.fields}
                                            pairs={state.pairs}
                                            targets={targets}
                                            activeKey={state.activeKey}
                                            activePair={state.activePair}
                                            showAll={false}
                                            checked={isChecked}
                                            selection={state.selection}
                                            onActivateField={activate}
                                            onActivatePair={activatePair}
                                            onBind={bind}
                                            onUnbind={unbind}
                                            onBindSelection={bindSelection}
                                        />
                                    </div>
                                ))}
                            </Document>
                        </DocumentErrorBoundary>
                    )}
                </div>
                {done && (
                    <AiReviewPanel
                        state={state}
                        targets={targets}
                        current={current}
                        onActivateField={activate}
                        onActivatePair={activatePair}
                        cursor={cursorOf}
                        onBind={bind}
                        onUnbind={unbind}
                        onRestore={restore}
                        onRestoreForm={restoreForm}
                        onRestoreTyped={restoreTyped}
                        onRemember={remember}
                        onCheck={check}
                        onCheckAll={checkAll}
                        onReset={reset}
                    />
                )}
            </div>
        </div>
    )
}

export default React.memo(AiDocumentPanel)
