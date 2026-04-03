import React, { Suspense } from 'react'
import { UniversalEditorProps } from './interfaces'

const GravityLazy = React.lazy(() => import('./adapters/GravityAdapter'))

export interface RichTextEditorProps extends UniversalEditorProps {}

export const RichTextEditor: React.FC<RichTextEditorProps> = props => {
    const EditorComponent = GravityLazy

    return (
        <Suspense fallback={<div aria-busy="true">Loading Editor...</div>}>
            <EditorComponent {...props} />
        </Suspense>
    )
}
