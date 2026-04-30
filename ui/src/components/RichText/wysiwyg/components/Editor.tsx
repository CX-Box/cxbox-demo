import { UniversalEditorProps } from '@components/RichText/types'
import React, { useCallback } from 'react'
import './Editor.module.less'
import MenuBar from '@components/RichText/wysiwyg/components/MenuBar'
import EditorContent from '@components/RichText/wysiwyg/components/EditorContent'
import { useRichTextEditor } from '@components/RichText/wysiwyg/hooks'
import { ViewMode } from '@components/RichText/common/types'
import cn from 'classnames'

interface Props extends UniversalEditorProps {
    onViewModeChange: (mode: ViewMode) => void
}

const Editor: React.FC<Props> = ({ value, onChange, readOnly, onBlur, onFocus, onViewModeChange }) => {
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
        <div className={cn('editor', { readOnly })}>
            <MenuBar editor={editor} onViewModeChange={handleViewModeChange} />
            <div style={{ display: 'flex', alignItems: 'stretch', position: 'relative', height: '100%' }}>
                <EditorContent editor={editor} />
            </div>
        </div>
    )
}

export default Editor
