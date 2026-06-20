import { UniversalEditorProps } from '@fields/RichText/types'
import React, { useCallback } from 'react'
import './Editor.module.less'
import MenuBar from '@fields/RichText/wysiwyg/components/MenuBar'
import EditorContent from '@fields/RichText/wysiwyg/components/EditorContent'
import { useRichTextEditor } from '@fields/RichText/wysiwyg/hooks'
import { ViewMode } from '@fields/RichText/common/types'
import cn from 'classnames'
import { BaseFieldProps } from '@features/Field'

interface Props extends UniversalEditorProps, BaseFieldProps {
    wrapperRef?: (instance: HTMLDivElement | null) => void
    wrapperStyle?: React.CSSProperties
    onViewModeChange: (mode: ViewMode) => void
}

const Editor: React.FC<Props> = ({
    wrapperRef,
    wrapperStyle,
    value,
    disabled,
    placeholder,
    onChange,
    readOnly,
    onBlur,
    onFocus,
    onViewModeChange
}) => {
    const { editor } = useRichTextEditor({ value, onChange, readOnly, onBlur, onFocus })

    const handleViewModeChange = useCallback(
        (mode: ViewMode) => {
            onViewModeChange(mode)
        },
        [onViewModeChange]
    )

    if (!editor) {
        return null
    }
    if (readOnly) {
        return <EditorContent editor={editor} readOnly={readOnly} />
    }

    return (
        <div ref={wrapperRef} style={wrapperStyle} className={cn('editor', { readOnly })}>
            <MenuBar editor={editor} onViewModeChange={handleViewModeChange} toolbarDisabled={disabled} />
            <EditorContent editor={editor} disabled={disabled} placeholder={placeholder} />
        </div>
    )
}

export default Editor
