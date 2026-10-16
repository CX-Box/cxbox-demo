import { EditorDraftProps, EditorHandle, UniversalEditorProps } from '@components/RichText/types'
import React, { forwardRef, ForwardRefRenderFunction, useCallback, useImperativeHandle } from 'react'
import { ReactCodeMirrorRef } from '@uiw/react-codemirror'
import './Editor.module.less'
import MenuBar from '@components/RichText/source/components/MenuBar'
import { ViewMode } from '@components/RichText/common/types'
import SourceEditor from '@components/RichText/source/components/EditorContent'
import { BaseFieldProps } from '@components/Field/Field'
import cn from 'classnames'

interface Props extends Omit<UniversalEditorProps, 'onChange'>, EditorDraftProps, BaseFieldProps {
    onlyOneRow?: boolean
    wrapperRef?: (instance: HTMLDivElement | null) => void
    wrapperStyle?: React.CSSProperties
    onViewModeChange: (mode: ViewMode) => void
}

const Editor: ForwardRefRenderFunction<EditorHandle, Props> = (
    {
        wrapperRef,
        wrapperStyle,
        value,
        onUserChange,
        onWrapperBlur,
        autoFocus,
        readOnly,
        onViewModeChange,
        disabled,
        placeholder,
        onlyOneRow
    },
    ref
) => {
    const cmRef = React.useRef<ReactCodeMirrorRef>(null)

    useImperativeHandle(ref, () => ({ getValue: () => cmRef.current?.view?.state.doc.toString() ?? value }), [value])

    const handleViewModeChange = useCallback(
        (mode: ViewMode) => {
            onViewModeChange(mode)
        },
        [onViewModeChange]
    )

    return (
        <div
            ref={wrapperRef}
            className={cn('editor', 'source', { oneRow: onlyOneRow, disabled: readOnly || disabled })}
            style={wrapperStyle}
            onBlur={onWrapperBlur}
        >
            <MenuBar className={'editor__menu-bar'} onViewModeChange={handleViewModeChange} toolbarDisabled={readOnly || disabled} />
            <SourceEditor
                ref={cmRef}
                value={value}
                readOnly={readOnly}
                onUserChange={onUserChange}
                autoFocus={autoFocus}
                placeholder={placeholder}
                disabled={disabled}
            />
        </div>
    )
}

export default forwardRef(Editor)
