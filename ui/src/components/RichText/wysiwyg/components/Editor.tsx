import { UniversalEditorProps } from '@components/RichText/types'
import React, { useCallback } from 'react'
import './Editor.module.less'
import MenuBar from '@components/RichText/wysiwyg/components/MenuBar'
import EditorContent from '@components/RichText/wysiwyg/components/EditorContent'
import { useRichTextEditor } from '@components/RichText/wysiwyg/hooks'
import { ViewMode } from '@components/RichText/common/types'
import cn from 'classnames'
import { BaseFieldProps } from '@components/Field/Field'

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
    const { editor } = useRichTextEditor({ value, onChange, readOnly, disabled, onBlur, onFocus })

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
