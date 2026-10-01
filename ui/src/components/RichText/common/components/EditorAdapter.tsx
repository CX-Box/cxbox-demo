import React, { useCallback, useEffect, useRef, useState } from 'react'
import { ViewMode } from '@components/RichText/common/types'
import WysiwygEditor from '@components/RichText/wysiwyg/components/Editor'
import SourceEditor from '@components/RichText/source/components/Editor'
import { ONE_ROW_TEXTAREA_VERTICAL_PADDING_OFFSET, COMMON_TEXTAREA_VERTICAL_PADDING_OFFSET } from '@components/RichText/constants'
import { useBoundedResizableHeight } from '@components/RichText/wysiwyg/hooks'
import { RichTextEditorProps } from '@components/RichText/RichTextEditor'
import { EditorHandle } from '@components/RichText/types'
import TextClampWrapper from '@components/TextClampWrapper/TextClampWrapper'

/**
 * Shows the visual editor or the markdown source editor and gives the value to `onChange`.
 *
 * <h3>When onChange is called</h3>
 * When the user leaves the field, like in the other typed fields (input, text, number). Not on every key:
 * <ul>
 *   <li>a `forceActive` field asks the backend on every `onChange`, and the answer replaced the text the user
 *       was still typing;</li>
 *   <li>the toolbar and its menus are a part of the field: a click on them is not leaving;</li>
 *   <li>the switch between the visual editor and the markdown source is not leaving either: the typed text
 *       goes to the other editor as a draft, without `onChange`.</li>
 * </ul>
 */
const EditorAdapter: React.FC<RichTextEditorProps> = ({
    value,
    onChange,
    readOnly,
    onBlur,
    onFocus,
    disabled,
    placeholder,
    minRows,
    maxRows,
    editMinRows,
    editMaxRows
}) => {
    const [viewMode, setViewMode] = useState<ViewMode>('wysiwyg')
    const editorRef = useRef<EditorHandle>(null)
    // the user changed the text and onChange did not get it yet
    const changedRef = useRef(false)
    // the changed text that a mode switch moved to the other editor, until onChange gets it
    const [draft, setDraft] = useState<string | null>(null)
    // the editor opened by a mode switch takes the focus: the user is still in the field
    const [focusOnOpen, setFocusOnOpen] = useState(false)
    const onlyOneRow = editMinRows === editMaxRows && editMinRows === 1
    const { ref: editorWrapperRef, style: wrapperStyle } = useBoundedResizableHeight({
        minRows: editMinRows,
        maxRows: editMaxRows,
        heightOffset: onlyOneRow ? ONE_ROW_TEXTAREA_VERTICAL_PADDING_OFFSET : COMMON_TEXTAREA_VERTICAL_PADDING_OFFSET,
        readOnly
    })
    // Force to wysiwyg in disabled mode
    useEffect(() => {
        if (!disabled) {
            return
        }
        setViewMode(prev => (prev === 'source' ? 'wysiwyg' : prev))
    }, [disabled, setViewMode])

    const handleUserChange = useCallback(() => {
        changedRef.current = true
    }, [])

    const handleWrapperBlur = useCallback(
        (event: React.FocusEvent<HTMLDivElement>) => {
            const focusStaysInField = event.currentTarget.contains(event.relatedTarget as Node | null)

            if (focusStaysInField || !changedRef.current || !editorRef.current) {
                return
            }

            const markdown = editorRef.current.getValue()

            changedRef.current = false
            setDraft(null)

            if (markdown !== (value ?? '')) {
                onChange(markdown)
            }
        },
        [value, onChange]
    )

    const handleViewModeChange = useCallback((mode: ViewMode) => {
        if (changedRef.current && editorRef.current) {
            setDraft(editorRef.current.getValue())
        }

        setFocusOnOpen(true)
        setViewMode(mode)
    }, [])

    if (readOnly) {
        return (
            <TextClampWrapper minRows={minRows} maxRows={maxRows}>
                <WysiwygEditor onViewModeChange={setViewMode} value={value} onBlur={onBlur} onFocus={onFocus} readOnly={readOnly} />
            </TextClampWrapper>
        )
    }

    const editorProps = {
        ref: editorRef,
        disabled,
        placeholder,
        wrapperRef: editorWrapperRef,
        wrapperStyle,
        onViewModeChange: handleViewModeChange,
        value: draft ?? value,
        onUserChange: handleUserChange,
        onWrapperBlur: handleWrapperBlur,
        autoFocus: focusOnOpen,
        onBlur,
        onFocus,
        readOnly,
        onlyOneRow
    }

    if (viewMode === 'source') {
        return <SourceEditor {...editorProps} />
    }

    if (viewMode === 'wysiwyg') {
        return <WysiwygEditor {...editorProps} />
    }

    return null
}

export default EditorAdapter
