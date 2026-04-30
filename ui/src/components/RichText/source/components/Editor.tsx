import { UniversalEditorProps } from '@components/RichText/types'
import React, { useCallback } from 'react'
import { ReactCodeMirrorRef } from '@uiw/react-codemirror'
import './Editor.module.less'
import MenuBar from '@components/RichText/source/components/MenuBar'
import { ViewMode } from '@components/RichText/common/types'
import SourceEditor from '@components/RichText/source/components/EditorContent'

interface Props extends UniversalEditorProps {
    onViewModeChange: (mode: ViewMode) => void
}

const Editor: React.FC<Props> = ({ value, onChange, readOnly, onViewModeChange }) => {
    const cmRef = React.useRef<ReactCodeMirrorRef>(null)

    const handleViewModeChange = useCallback(
        (mode: ViewMode) => {
            onViewModeChange(mode)
        },
        [onViewModeChange]
    )

    return (
        <div className={'editor'}>
            <MenuBar onViewModeChange={handleViewModeChange} />
            <div style={{ display: 'flex', alignItems: 'stretch', position: 'relative', height: '100%' }}>
                <SourceEditor ref={cmRef} value={value} readOnly={readOnly} onChange={onChange} />
            </div>
        </div>
    )
}

export default Editor
