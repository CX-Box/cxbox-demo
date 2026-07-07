import { UniversalEditorProps } from '@fields/RichText/types'
import React, { useCallback } from 'react'
import { ReactCodeMirrorRef } from '@uiw/react-codemirror'
import './Editor.module.less'
import MenuBar from '@fields/RichText/source/components/MenuBar'
import { ViewMode } from '@fields/RichText/common/types'
import SourceEditor from '@fields/RichText/source/components/EditorContent'
import { BaseFieldProps } from '@features/Field'

interface Props extends UniversalEditorProps, BaseFieldProps {
    wrapperRef?: (instance: HTMLDivElement | null) => void
    wrapperStyle?: React.CSSProperties
    onViewModeChange: (mode: ViewMode) => void
}

const Editor: React.FC<Props> = ({ wrapperRef, wrapperStyle, value, onChange, readOnly, onViewModeChange, disabled, placeholder }) => {
    const cmRef = React.useRef<ReactCodeMirrorRef>(null)

    const handleViewModeChange = useCallback(
        (mode: ViewMode) => {
            onViewModeChange(mode)
        },
        [onViewModeChange]
    )

    return (
        <div ref={wrapperRef} className={'editor'} style={wrapperStyle}>
            <MenuBar onViewModeChange={handleViewModeChange} toolbarDisabled={readOnly || disabled} />
            <SourceEditor ref={cmRef} value={value} readOnly={readOnly} onChange={onChange} placeholder={placeholder} disabled={disabled} />
        </div>
    )
}

export default Editor
