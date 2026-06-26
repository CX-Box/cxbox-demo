import { useEffect, useLayoutEffect, useMemo, useState, useCallback, useRef } from 'react'
import { Editor, useEditor } from '@tiptap/react'
import Underline from '@tiptap/extension-underline'
import { CustomStrike } from '@components/RichText/wysiwyg/extensions/CustomStrike'
import Image from '@tiptap/extension-image'
import Link from '@tiptap/extension-link'
import { Markdown } from '@tiptap/markdown'
import HardBreak from '@tiptap/extension-hard-break'
import { Colorify } from '@components/RichText/wysiwyg/extensions/Colorify'
import { Bold } from '@tiptap/extension-bold'
import { Italic } from '@tiptap/extension-italic'
import { Code } from '@tiptap/extension-code'
import { CodeBlock } from '@tiptap/extension-code-block'
import { Blockquote } from '@tiptap/extension-blockquote'
import { BulletList } from '@tiptap/extension-bullet-list'
import { OrderedList } from '@tiptap/extension-ordered-list'
import { ListItem } from '@tiptap/extension-list-item'
import { Heading } from '@tiptap/extension-heading'
import { Paragraph } from '@tiptap/extension-paragraph'
import { Dropcursor } from '@tiptap/extension-dropcursor'
import { Document } from '@tiptap/extension-document'
import { Gapcursor, TrailingNode, UndoRedo } from '@tiptap/extensions'
import { ListKeymap } from '@tiptap/extension-list'
import { Text } from '@tiptap/extension-text'
import { isDefined } from '@utils/isDefined'

const getExtensions = () => [
    Document,
    Blockquote,
    BulletList,
    OrderedList,
    ListItem,
    Heading,
    Paragraph,
    Dropcursor,
    Gapcursor,
    UndoRedo,
    ListKeymap,
    Text,
    TrailingNode,
    Code,
    CodeBlock,
    Italic,
    Bold,
    Colorify,
    CustomStrike,
    Underline,
    HardBreak,
    Image.configure({ inline: true, allowBase64: true }),
    Link.configure({
        openOnClick: false,
        autolink: false,
        protocols: ['http', 'https', 'mailto']
    }),
    Markdown.configure({
        markedOptions: {
            gfm: false,
            breaks: true
        }
    })
]

interface UseRichTextEditorProps {
    value: string
    onChange: (markdown: string) => void
    readOnly?: boolean
    disabled?: boolean
    onBlur?: () => void
    onFocus?: () => void
}

const DEBOUNCE_MS = 120

export const useRichTextEditor = ({ value, onChange, readOnly = false, disabled = false, onBlur, onFocus }: UseRichTextEditorProps) => {
    const extensions = useMemo(() => getExtensions(), [])

    const lastEmittedRef = useRef(value)
    const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
    const onChangeRef = useRef(onChange)

    const isEditable = readOnly ? false : !disabled

    useEffect(() => {
        onChangeRef.current = onChange
    }, [onChange])

    const editor = useEditor({
        extensions,
        content: value,
        contentType: 'markdown',
        editable: isEditable,
        onBlur,
        onFocus
    })

    useEffect(() => {
        if (!editor || editor.isDestroyed) {
            return
        }

        editor.setEditable(isEditable)
    }, [editor, isEditable])

    useEffect(() => {
        if (!editor) {
            return
        }

        const handler = ({ editor: instance, transaction }: { editor: Editor; transaction?: { docChanged: boolean } }) => {
            if (transaction?.docChanged === false) {
                return
            }

            if (debounceTimerRef.current) {
                clearTimeout(debounceTimerRef.current)
            }

            debounceTimerRef.current = setTimeout(() => {
                const md = instance.getMarkdown()
                if (md !== lastEmittedRef.current) {
                    lastEmittedRef.current = md
                    onChangeRef.current(md)
                }
            }, DEBOUNCE_MS)
        }

        editor.on('update', handler)

        return () => {
            editor.off('update', handler)
            if (debounceTimerRef.current) {
                clearTimeout(debounceTimerRef.current)
                debounceTimerRef.current = null
            }
        }
    }, [editor])

    useEffect(() => {
        if (!editor) {
            return
        }

        if (value === lastEmittedRef.current) {
            return
        }

        const currentMd = editor.getMarkdown()
        if (value === currentMd) {
            lastEmittedRef.current = value
            return
        }

        if (debounceTimerRef.current) {
            clearTimeout(debounceTimerRef.current)
            debounceTimerRef.current = null
        }

        editor.commands.setContent(value, { contentType: 'markdown', emitUpdate: false })
        lastEmittedRef.current = value
    }, [value, editor])

    return { editor }
}

interface HeightState {
    minHeight: string | undefined
    maxHeight: string | undefined
}

interface UseDynamicHeightByRowsProps {
    minRows?: number
    maxRows?: number
    heightOffset?: number
}

export function useRowHeightBoundaries({ minRows, maxRows, heightOffset = 0 }: UseDynamicHeightByRowsProps = {}) {
    const [element, setElement] = useState<HTMLElement | null>(null)

    const refCallback = useCallback((node: HTMLElement | null) => {
        setElement(node)
    }, [])

    const elementRef = useRef<HTMLElement | null>(null)

    useLayoutEffect(() => {
        elementRef.current = element
    }, [element])

    const [heights, setHeights] = useState<HeightState>({
        minHeight: undefined,
        maxHeight: undefined
    })

    useLayoutEffect(() => {
        if (!element) {
            return
        }

        const computedStyle = window.getComputedStyle(element)

        const getFloatValue = (val: string) => parseFloat(val) || 0

        const fontSize = getFloatValue(computedStyle.fontSize) || 14

        const getLineHeightValue = (rawLineHeight: string) => {
            let normalizeLineHeight = getFloatValue(rawLineHeight)

            if (isNaN(normalizeLineHeight) || rawLineHeight === 'normal') {
                normalizeLineHeight = fontSize * 1.5
            } else if (!rawLineHeight.includes('px')) {
                normalizeLineHeight = normalizeLineHeight * fontSize
            }

            return normalizeLineHeight
        }

        const lineHeight = getLineHeightValue(computedStyle.lineHeight)

        const paddingTop = getFloatValue(computedStyle.paddingTop)
        const paddingBottom = getFloatValue(computedStyle.paddingBottom)

        const borderTop = getFloatValue(computedStyle.borderTopWidth)
        const borderBottom = getFloatValue(computedStyle.borderBottomWidth)

        const verticalOffsets = paddingTop + paddingBottom + borderTop + borderBottom

        const calculateHeight = (rows: number) => {
            const totalHeight = rows * lineHeight + verticalOffsets
            const heightWithOffset = totalHeight + heightOffset
            const minAllowedHeight = lineHeight + verticalOffsets

            return `${Math.max(minAllowedHeight, heightWithOffset)}px`
        }

        setHeights({
            minHeight: typeof minRows === 'number' ? calculateHeight(minRows) : undefined,
            maxHeight: typeof maxRows === 'number' ? calculateHeight(maxRows) : undefined
        })
    }, [minRows, maxRows, heightOffset, element])

    return { ref: refCallback, heights }
}

export interface UseBoundedResizableHeightProps extends UseDynamicHeightByRowsProps {
    readOnly?: boolean
}

export function useBoundedResizableHeight(options: UseBoundedResizableHeightProps) {
    const { minRows, maxRows, heightOffset = 0, readOnly } = options
    const [resizedHeight, setResizedHeight] = useState<string | number | undefined>()

    const [element, setElement] = useState<HTMLElement | null>(null)

    const { ref: rowHeightBoundariesRef, heights: dynamicHeights } = useRowHeightBoundaries({ minRows, maxRows, heightOffset })

    const refCallback = useCallback(
        (node: HTMLElement | null) => {
            setElement(node)
            rowHeightBoundariesRef(node)
        },
        [rowHeightBoundariesRef]
    )

    const elementRef = useRef<HTMLElement | null>(null)

    useLayoutEffect(() => {
        elementRef.current = element
    }, [element])

    useLayoutEffect(() => {
        if (!element || readOnly) {
            return
        }

        let animationFrameId: number

        const resizeObserver = new ResizeObserver(entries => {
            animationFrameId = window.requestAnimationFrame(() => {
                for (const entry of entries) {
                    const target = entry.target as HTMLElement
                    const newHeight = target.style.height

                    if (newHeight) {
                        const parsedNewHeight = parseFloat(newHeight)
                        const parsedMinHeight = parseFloat(dynamicHeights.minHeight || '0')
                        const parsedMaxHeight = parseFloat(dynamicHeights.maxHeight || '99999')

                        setResizedHeight(() => {
                            if (parsedNewHeight < Math.floor(parsedMinHeight)) {
                                return parsedMinHeight
                            } else if (parsedNewHeight > Math.ceil(parsedMaxHeight)) {
                                return parsedMaxHeight
                            }

                            return newHeight
                        })
                    }
                }
            })
        })

        resizeObserver.observe(element)

        return () => {
            if (animationFrameId) {
                window.cancelAnimationFrame(animationFrameId)
            }
            resizeObserver.disconnect()
        }
    }, [element, readOnly, dynamicHeights])

    const style = useMemo(() => {
        const baseStyle: React.CSSProperties = {
            ...dynamicHeights,
            resize: readOnly ? 'none' : 'vertical',
            overflowY: 'hidden',
            height: isDefined(resizedHeight) ? resizedHeight : undefined
        }

        return baseStyle
    }, [dynamicHeights, readOnly, resizedHeight])

    return {
        ref: refCallback,
        style
    }
}
