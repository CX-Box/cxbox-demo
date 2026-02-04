import React from 'react'
import { FileViewerType } from '@utils/fileViewer'

type ViewerElementByType = {
    image: HTMLImageElement
}

export type ViewerRefs = {
    [K in keyof ViewerElementByType]?: React.RefObject<ViewerElementByType[K]>
}

export type ViewerMode = 'light' | 'dark'

export const viewTypes = ['preview', 'compact', 'full'] as const

export type ViewType = ElementOf<typeof viewTypes>

export type PreviewMode = 'auto' | 'iconOnly'

export interface ViewerComponentProps {
    viewerRef?: ViewerRefs[keyof ViewerElementByType]

    fileName: string
    url: string
    loading: boolean

    view: ViewType
    width: string | number
    height: string | number
    alt?: string
    pageWidth: number
    viewerMode: ViewerMode
}

export interface ViewerDefinition<T extends FileViewerType = FileViewerType> {
    type: T
    Component: React.ComponentType<ViewerComponentProps>
}
