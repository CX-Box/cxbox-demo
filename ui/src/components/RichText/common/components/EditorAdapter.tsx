import React, { useEffect, useState } from 'react'
import { ViewMode } from '@components/RichText/common/types'
import WysiwygEditor from '@components/RichText/wysiwyg/components/Editor'
import SourceEditor from '@components/RichText/source/components/Editor'
import { TEXTAREA_VERTICAL_PADDING_OFFSET } from '@components/RichText/constants'
import { useBoundedResizableHeight } from '@components/RichText/wysiwyg/hooks'
import { RichTextEditorProps } from '@components/RichText/RichTextEditor'
import TextClampWrapper from '@components/TextClampWrapper/TextClampWrapper'
import { richTextEditMaxRows, richTextEditMinRows, richTextMaxRows, richTextMinRows } from '@components/ui/RichText/constants'

const EditorAdapter: React.FC<RichTextEditorProps> = ({
    value,
    onChange,
    readOnly,
    onBlur,
    onFocus,
    disabled,
    placeholder,
    minRows = richTextEditMinRows,
    maxRows = richTextEditMaxRows
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
            <TextClampWrapper minRows={richTextMinRows} maxRows={richTextMaxRows}>
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
