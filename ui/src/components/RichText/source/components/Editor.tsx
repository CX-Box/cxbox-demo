import { UniversalEditorProps } from '@components/RichText/types'
import React, { useCallback } from 'react'
import { ReactCodeMirrorRef } from '@uiw/react-codemirror'
import './Editor.module.less'
import MenuBar from '@components/RichText/source/components/MenuBar'
import { ViewMode } from '@components/RichText/common/types'
import SourceEditor from '@components/RichText/source/components/EditorContent'
import { BaseFieldProps } from '@components/Field/Field'
import cn from 'classnames'

interface Props extends UniversalEditorProps, BaseFieldProps {
    onlyOneRow?: boolean
    wrapperRef?: (instance: HTMLDivElement | null) => void
    wrapperStyle?: React.CSSProperties
    onViewModeChange: (mode: ViewMode) => void
}

const Editor: React.FC<Props> = ({
    wrapperRef,
    wrapperStyle,
    value,
    onChange,
    readOnly,
    onViewModeChange,
    disabled,
    placeholder,
    onlyOneRow
}) => {
    const cmRef = React.useRef<ReactCodeMirrorRef>(null)

    const handleViewModeChange = useCallback(
        (mode: ViewMode) => {
            onViewModeChange(mode)
        },
        [onViewModeChange]
    )

    return (
        <div ref={wrapperRef} className={cn('editor', 'source', { oneRow: onlyOneRow })} style={wrapperStyle}>
            <MenuBar className={'editor__menu-bar'} onViewModeChange={handleViewModeChange} toolbarDisabled={readOnly || disabled} />
            <SourceEditor ref={cmRef} value={value} readOnly={readOnly} onChange={onChange} placeholder={placeholder} disabled={disabled} />
        </div>
    )
}

export default Editor
