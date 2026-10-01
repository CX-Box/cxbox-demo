import { EditorDraftProps, EditorHandle, UniversalEditorProps } from '@components/RichText/types'
import React, { forwardRef, ForwardRefRenderFunction, useCallback, useImperativeHandle } from 'react'
import './Editor.module.less'
import MenuBar from '@components/RichText/wysiwyg/components/MenuBar'
import EditorContent from '@components/RichText/wysiwyg/components/EditorContent'
import { useRichTextEditor } from '@components/RichText/wysiwyg/hooks'
import { ViewMode } from '@components/RichText/common/types'
import cn from 'classnames'
import { BaseFieldProps } from '@components/Field/Field'

interface Props extends Omit<UniversalEditorProps, 'onChange'>, EditorDraftProps, BaseFieldProps {
    wrapperRef?: (instance: HTMLDivElement | null) => void
    wrapperStyle?: React.CSSProperties
    onViewModeChange: (mode: ViewMode) => void
    onlyOneRow?: boolean
}

const Editor: ForwardRefRenderFunction<EditorHandle, Props> = (
    {
        wrapperRef,
        wrapperStyle,
        value,
        disabled,
        placeholder,
        onUserChange,
        onWrapperBlur,
        autoFocus,
        readOnly,
        onBlur,
        onFocus,
        onViewModeChange,
        onlyOneRow
    },
    ref
) => {
    const { editor } = useRichTextEditor({ value, onUserChange, autoFocus, readOnly, disabled, placeholder, onBlur, onFocus })

    useImperativeHandle(ref, () => ({ getValue: () => editor?.getMarkdown() ?? value }), [editor, value])

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
        <div ref={wrapperRef} style={wrapperStyle} className={cn('editor', { oneRow: onlyOneRow, readOnly })} onBlur={onWrapperBlur}>
            <MenuBar className={'editor__menu-bar'} editor={editor} onViewModeChange={handleViewModeChange} toolbarDisabled={disabled} />
            <EditorContent editor={editor} disabled={disabled} placeholder={placeholder} />
        </div>
    )
}

export default forwardRef(Editor)
