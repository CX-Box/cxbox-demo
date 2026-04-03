import React, { Suspense } from 'react'
import { UniversalEditorProps } from './types'

const EditorLazy = React.lazy(() => import('./common/index'))

export interface RichTextEditorProps extends UniversalEditorProps {}

export const RichTextEditor: React.FC<RichTextEditorProps> = props => {
    const EditorComponent = EditorLazy

    return (
        <Suspense fallback={<div aria-busy="true">Loading Editor...</div>}>
            <EditorComponent {...props} />
        </Suspense>
    )
}
