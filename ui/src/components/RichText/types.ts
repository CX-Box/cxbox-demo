export interface UniversalEditorProps {
    value: string
    onChange: (markdown: string) => void
    placeholder?: string
    readOnly?: boolean

    onBlur?: () => void
    onFocus?: () => void
}

/**
 * What EditorAdapter needs from an editor, visual or source.
 */
export interface EditorHandle {
    /** The markdown of the text the editor shows now. */
    getValue: () => string
}

/**
 * How an editor works with EditorAdapter. The editor keeps the typed text itself and does not call `onChange`:
 * EditorAdapter takes the text with {@link EditorHandle.getValue} when the user leaves the field.
 */
export interface EditorDraftProps {
    /** The user changed the text. */
    onUserChange?: () => void
    /** `onBlur` for the element that holds the toolbar and the text. */
    onWrapperBlur?: React.FocusEventHandler<HTMLDivElement>
    /** Take the focus when the editor opens. */
    autoFocus?: boolean
}
