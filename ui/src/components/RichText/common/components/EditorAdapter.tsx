import React, { useEffect, useState } from 'react'
import { ViewMode } from '@components/RichText/common/types'
import WysiwygEditor from '@components/RichText/wysiwyg/components/Editor'
import SourceEditor from '@components/RichText/source/components/Editor'
import { TEXTAREA_VERTICAL_PADDING_OFFSET } from '@components/RichText/constants'
import { useBoundedResizableHeight } from '@components/RichText/wysiwyg/hooks'
import { RichTextEditorProps } from '@components/RichText/RichTextEditor'
import TextClampWrapper from '@components/TextClampWrapper/TextClampWrapper'

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
    editMaxRows,
    meta
}) => {
    const [viewMode, setViewMode] = useState<ViewMode>('wysiwyg')

    const { ref: editorWrapperRef, style: wrapperStyle } = useBoundedResizableHeight({
        minRows: editMinRows,
        maxRows: editMaxRows,
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
            <TextClampWrapper minRows={minRows} maxRows={maxRows}>
                <WysiwygEditor
                    onViewModeChange={setViewMode}
                    value={value}
                    onChange={onChange}
                    onBlur={onBlur}
                    onFocus={onFocus}
                    readOnly={readOnly}
                />
            </TextClampWrapper>
        )
    }

    const onlyOneRow = editMinRows === editMaxRows && editMinRows === 1

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
                onlyOneRow={onlyOneRow}
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
                onlyOneRow={onlyOneRow}
            />
        )
    }

    return null
}

export default EditorAdapter
