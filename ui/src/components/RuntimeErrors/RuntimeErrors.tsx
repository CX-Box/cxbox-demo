import React, { useCallback, useEffect, useRef, useState } from 'react'
import { Icon, Popover, Tooltip } from 'antd'
import cn from 'classnames'
import { BackendValidationMessage, RuntimeError } from '@interfaces/session'
import { RuntimeErrorsScope, useRuntimeErrors } from '@hooks/useRuntimeErrors'
import ActionLink from '@components/ui/ActionLink/ActionLink'
import CopyableText from '@components/ui/CopyableText/CopyableText'
import { useAppDispatch, useAppSelector } from '@store'
import { actions } from '@actions'
import styles from './RuntimeErrors.less'

interface RuntimeErrorsProps extends RuntimeErrorsScope {
    className?: string
}

const RuntimeErrors: React.FunctionComponent<RuntimeErrorsProps> = props => {
    const { widget, viewOnly, className } = props
    const { backendProblems, executionFailures, frontendErrors } = useRuntimeErrors({ widget, viewOnly })
    const viewName = useAppSelector(state => state.view.name)
    const viewWidgets = useAppSelector(state => state.view.widgets)
    const debugMode = useAppSelector(state => state.session.debugMode)
    const dispatch = useAppDispatch()
    const [visible, setVisible] = useState(false)
    const [layout, setLayout] = useState<ListLayout>(DEFAULT_LAYOUT)
    const buttonRef = useRef<HTMLButtonElement>(null)
    const showPlaces = !widget && !viewOnly

    const handleVisibleChange = useCallback((value: boolean) => {
        if (value && buttonRef.current) {
            const newLayout = calculateListLayout(buttonRef.current.getBoundingClientRect())
            setLayout(prevState => ({ ...newLayout, openCount: prevState.openCount + 1 }))
        }
        setVisible(value)
    }, [])

    const handleCopyGroupName = useCallback(() => {
        setVisible(false)
        if (!debugMode) {
            dispatch(actions.switchDebugMode(true))
        }
    }, [debugMode, dispatch])

    useEffect(() => {
        if (!visible) {
            return
        }
        const close = (event: KeyboardEvent) => event.key === 'Escape' && setVisible(false)
        document.addEventListener('keydown', close)
        return () => document.removeEventListener('keydown', close)
    }, [visible])

    const warnings = frontendErrors.filter(error => error.level === 'warning').length
    const errors = executionFailures.length + backendProblems.length + frontendErrors.length - warnings
    const isEmpty = errors === 0 && warnings === 0

    // Reset visibility so new diagnostics do not reopen the list automatically.
    useEffect(() => {
        if (isEmpty) {
            setVisible(false)
        }
    }, [isEmpty])

    if (isEmpty) {
        return null
    }

    const renderErrorGroups = <T,>(
        items: T[],
        getWidgetNames: (item: T) => string[],
        renderItem: (item: T, index: number) => React.ReactNode
    ) => {
        if (!showPlaces) {
            return <ul className={styles.errors}>{items.map(renderItem)}</ul>
        }
        return groupByPlace(items, getWidgetNames, viewName).map(place => (
            <div key={place.key} className={styles.place}>
                <div className={styles.placeLabel} data-test-runtime-errors-place={place.type}>
                    <span className={styles.placeType}>{place.type}</span>
                    <CopyableText text={`"name": "${place.name}"`} onCopy={handleCopyGroupName} />
                </div>
                <ul className={styles.errors}>{place.items.map(renderItem)}</ul>
            </div>
        ))
    }

    const content = (
        <div key={layout.openCount} className={styles.content} style={{ width: layout.width, maxHeight: layout.maxHeight }}>
            {executionFailures.length > 0 && (
                <div className={styles.executionFailures}>
                    <div>Failed validators, their problems are unknown (see server log):</div>
                    <ul>
                        {executionFailures.map((message, index) => (
                            <li key={index}>
                                <RuntimeErrorText title={message.title} message={message.message} titleHint={message.validatorName} />
                            </li>
                        ))}
                    </ul>
                </div>
            )}
            {backendProblems.length > 0 && (
                <div className={styles.section}>
                    <div className={styles.sectionTitle}>{`Backend (${backendProblems.length})`}</div>
                    {renderErrorGroups(
                        backendProblems,
                        problem => (widget ? [widget] : problem.widgets.filter(name => viewWidgets.some(item => item.name === name))),
                        (problem: BackendValidationMessage, index) => (
                            <li key={index} className={styles.error}>
                                <RuntimeErrorText title={problem.title} message={problem.message} titleHint={problem.validatorName} />
                            </li>
                        )
                    )}
                </div>
            )}
            <div className={styles.section}>
                <div className={styles.sectionTitle}>{`Frontend (${frontendErrors.length})`}</div>
                {frontendErrors.length === 0 && <div>No frontend errors</div>}
                {renderErrorGroups(
                    frontendErrors,
                    error => (error.widget ? [error.widget] : []),
                    (error: RuntimeError, index) => (
                        <li key={index} className={cn(styles.error, { [styles.warning]: error.level === 'warning' })}>
                            <RuntimeErrorText title={error.title} message={error.message} />
                            {error.count > 1 && <span className={styles.repeat}>×{error.count}</span>}
                        </li>
                    )
                )}
            </div>
        </div>
    )

    return (
        <Popover
            overlayClassName={styles.overlay}
            content={content}
            trigger="click"
            placement={layout.placement}
            autoAdjustOverflow={false}
            align={{ offset: [layout.offsetX, layout.placement === 'topLeft' ? -4 : 4] }}
            overlayStyle={{ ['--runtime-errors-arrow-left' as string]: `${layout.arrowLeft}px` }}
            visible={visible}
            onVisibleChange={handleVisibleChange}
        >
            <span className={className}>
                <Tooltip title={visible ? null : 'Runtime errors'} placement="bottom" mouseEnterDelay={0.5}>
                    <button
                        ref={buttonRef}
                        type="button"
                        className={styles.counter}
                        data-test-runtime-errors={widget ?? (viewOnly ? 'view' : 'all')}
                        data-test-runtime-errors-errors={errors}
                        data-test-runtime-errors-warnings={warnings}
                    >
                        {errors > 0 && (
                            <span className={styles.errorCount}>
                                <Icon type="exclamation-circle" theme="filled" />
                                {errors}
                            </span>
                        )}
                        {warnings > 0 && (
                            <span className={styles.warningCount}>
                                <Icon type="warning" theme="filled" />
                                {warnings}
                            </span>
                        )}
                    </button>
                </Tooltip>
            </span>
        </Popover>
    )
}

interface RuntimeErrorTextProps {
    title?: string
    message: string
    titleHint?: string
}

const COLLAPSED_TEXT_MAX_LENGTH = Number(process.env.REACT_APP_RUNTIME_ERRORS_TEXT_MAX_LENGTH) || 200

const truncate = (text: string) => {
    const chars = Array.from(text)
    return chars.length > COLLAPSED_TEXT_MAX_LENGTH ? `${chars.slice(0, COLLAPSED_TEXT_MAX_LENGTH).join('')}…` : text
}

const RuntimeErrorText: React.FunctionComponent<RuntimeErrorTextProps> = ({ title, message, titleHint }) => {
    const [isExpanded, setIsExpanded] = useState(false)
    const shortTitle = title && truncate(title)
    const shortMessage = truncate(message)
    const isTruncated = shortTitle !== title || shortMessage !== message

    return (
        <span>
            {title && (
                <span className={styles.title} title={titleHint}>
                    {`${isExpanded ? title : shortTitle}: `}
                </span>
            )}
            {isExpanded ? message : shortMessage}
            {isTruncated && (
                <>
                    {' '}
                    <ActionLink onClick={() => setIsExpanded(prevState => !prevState)}>{isExpanded ? 'less' : 'more'}</ActionLink>
                </>
            )}
        </span>
    )
}

interface ListLayout {
    placement: 'bottomLeft' | 'topLeft'
    width: number
    maxHeight: number
    offsetX: number
    arrowLeft: number
    openCount: number
}

const LIST_WIDTH = 640
const LIST_PADDING = 32
const LIST_MARGIN = 48
const SCREEN_GAP = 8
const ARROW_MIN_LEFT = 8
const ARROW_HALF_WIDTH = 4

const DEFAULT_LAYOUT: ListLayout = { placement: 'bottomLeft', width: LIST_WIDTH, maxHeight: 400, offsetX: 0, arrowLeft: 16, openCount: 0 }

/**
 * Positions the list explicitly because Ant Design overflow adjustment leaves the arrow at the edge.
 */
const calculateListLayout = (button: DOMRect): Omit<ListLayout, 'openCount'> => {
    const screenWidth = document.documentElement.clientWidth
    const width = Math.min(LIST_WIDTH, screenWidth - 2 * SCREEN_GAP - LIST_PADDING)
    const left = Math.max(SCREEN_GAP, Math.min(button.left, screenWidth - SCREEN_GAP - LIST_PADDING - width))
    const below = window.innerHeight - button.bottom
    const above = button.top
    return {
        placement: below >= above ? 'bottomLeft' : 'topLeft',
        width,
        maxHeight: Math.max(below, above) - LIST_MARGIN,
        offsetX: left - button.left,
        arrowLeft: Math.max(ARROW_MIN_LEFT, button.left + button.width / 2 - left - ARROW_HALF_WIDTH)
    }
}

interface ErrorGroup<T> {
    key: string
    type: 'View' | 'Widget'
    name: string
    items: T[]
}

const groupByPlace = <T,>(items: T[], getWidgetNames: (item: T) => string[], viewName: string) => {
    const result = new Map<string, ErrorGroup<T>>()
    const add = (type: ErrorGroup<T>['type'], name: string, item: T) => {
        const key = `${type}:${name}`
        const place = result.get(key) ?? { key, type, name, items: [] }
        place.items.push(item)
        result.set(key, place)
    }
    items.forEach(item => {
        const widgets = getWidgetNames(item)
        if (widgets.length === 0) {
            add('View', viewName, item)
        }
        widgets.forEach(name => add('Widget', name, item))
    })
    return Array.from(result.values()).sort((a, b) => Number(a.type === 'Widget') - Number(b.type === 'Widget'))
}

export default React.memo(RuntimeErrors)
