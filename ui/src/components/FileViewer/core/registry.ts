import { FileViewerType } from '@utils/fileViewer'
import * as viewers from '../viewers'
import { ViewerDefinition } from '@components/FileViewer/core/viewerTypes'

const viewerByType = Object.values(viewers).reduce((acc, viewer) => {
    acc[viewer.type] = viewer
    return acc
}, {} as Record<FileViewerType, ViewerDefinition>)

export const getFileViewerDefinition = (type: FileViewerType) => {
    return viewerByType[type] ?? viewerByType.other
}

export const getFileViewer = (type: FileViewerType) => {
    return getFileViewerDefinition(type).Component
}
