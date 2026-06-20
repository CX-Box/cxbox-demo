export interface UniversalEditorProps {
    value: string
    onChange: (markdown: string) => void
    placeholder?: string
    readOnly?: boolean

    onBlur?: () => void
    onFocus?: () => void
}
