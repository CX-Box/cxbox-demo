import React, { Suspense } from 'react'
import { UniversalEditorProps } from './types'
import { BaseFieldProps } from '@features/Field'

const EditorLazy = React.lazy(() => import('./common'))

export interface RichTextEditorProps extends UniversalEditorProps, BaseFieldProps {
    minRows?: number
    maxRows?: number
}

const RichText: React.FC<RichTextEditorProps> = props => {
    const EditorComponent = EditorLazy

    return (
        <Suspense fallback={<div aria-busy="true">Loading Editor...</div>}>
            <EditorComponent {...props} />
        </Suspense>
    )
}

export default RichText
