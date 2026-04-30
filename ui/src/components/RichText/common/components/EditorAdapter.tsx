import { UniversalEditorProps } from '@components/RichText/types'
import React, { useState } from 'react'
import { ViewMode } from '@components/RichText/common/types'
import WysiwygEditor from '@components/RichText/wysiwyg/components/Editor'
import SourceEditor from '@components/RichText/source/components/Editor'

const EditorAdapter: React.FC<UniversalEditorProps> = ({ value, onChange, readOnly, onBlur, onFocus }) => {
    const [viewMode, setViewMode] = useState<ViewMode>('wysiwyg')

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
