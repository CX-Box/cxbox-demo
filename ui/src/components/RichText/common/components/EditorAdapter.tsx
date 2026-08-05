import React, { useEffect, useState } from 'react'
import { ViewMode } from '@components/RichText/common/types'
import WysiwygEditor from '@components/RichText/wysiwyg/components/Editor'
import SourceEditor from '@components/RichText/source/components/Editor'
import { EDITOR_MAX_ROWS, EDITOR_MIN_ROWS, TEXTAREA_VERTICAL_PADDING_OFFSET } from '@components/RichText/constants'
import { useBoundedResizableHeight } from '@components/RichText/wysiwyg/hooks'
import { RichTextEditorProps } from '@components/RichText/RichTextEditor'

const EditorAdapter: React.FC<RichTextEditorProps> = ({
    value,
    onChange,
    readOnly,
    onBlur,
    onFocus,
    disabled,
    placeholder,
    minRows = EDITOR_MIN_ROWS,
    maxRows = EDITOR_MAX_ROWS
}) => {
    const [viewMode, setViewMode] = useState<ViewMode>('wysiwyg')

    const { ref: editorWrapperRef, style: wrapperStyle } = useBoundedResizableHeight({
        minRows,
        maxRows,
        heightOffset: TEXTAREA_VERTICAL_PADDING_OFFSET,
        readOnly
    })
    // Force to wysiwyg in disabled mode
    useEffect(() => {
        if (!disabled) {
            return
        }
        setViewMode(prev => (prev === 'source' ? 'wysiwyg' : prev))
    }, [disabled, setViewMode])

    if (readOnly) {
        return (
            <WysiwygEditor
                onViewModeChange={setViewMode}
                value={value}
                onChange={onChange}
                onBlur={onBlur}
                onFocus={onFocus}
                readOnly={readOnly}
            />
        )
    }

    if (viewMode === 'source') {
        return (
            <SourceEditor
                disabled={disabled}
                placeholder={placeholder}
                wrapperRef={editorWrapperRef}
                wrapperStyle={wrapperStyle}
                onViewModeChange={setViewMode}
                value={value}
                onChange={onChange}
                onBlur={onBlur}
                onFocus={onFocus}
                readOnly={readOnly}
            />
        )
    }

    if (viewMode === 'wysiwyg') {
        return (
            <WysiwygEditor
                disabled={disabled}
                placeholder={placeholder}
                wrapperRef={editorWrapperRef}
                wrapperStyle={wrapperStyle}
                onViewModeChange={setViewMode}
                value={value}
                onChange={onChange}
                onBlur={onBlur}
                onFocus={onFocus}
                readOnly={readOnly}
            />
        )
    }

    return null
}

export default EditorAdapter
