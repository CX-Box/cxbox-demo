import React, { Suspense } from 'react'
import { UniversalEditorProps } from './interfaces'

const TiptapLazy = React.lazy(() => import('./adapters/TiptapAdapter'))

export interface RichTextEditorProps extends UniversalEditorProps {}

export const RichTextEditor: React.FC<RichTextEditorProps> = props => {
    const EditorComponent = TiptapLazy

    return (
        <Suspense fallback={<div aria-busy="true">Loading Editor...</div>}>
            <EditorComponent {...props} />
        </Suspense>
    )
}
