import React, { CSSProperties } from 'react'
import styles from './ReactFileViewer.less'
// @ts-ignore
import ReactFileViewerInner from 'react-file-viewer'
import cn from 'classnames'
import { isExcelType } from '../../utils/documentPreview'

interface ReactFileViewerProps {
    url: string
    extension: string
    height?: string | number
    width?: string | number
    style?: CSSProperties
}

function ReactFileViewer({ url, height, width, style = {}, extension }: ReactFileViewerProps) {
    const { handleCsvClickCapture } = useCsvFix(extension)

    return (
        <div
            className={cn(styles.root)}
            style={{ ...style, height: height, maxHeight: height, width }}
            onClickCapture={handleCsvClickCapture}
        >
            <ReactFileViewerInner fileType={extension} filePath={url} />
        </div>
    )
}

export default React.memo(ReactFileViewer)

function useCsvFix(fileType?: string) {
    // fixed error with onSortGrid in react-file-viewer@1.2.1
    const handleCsvClickCapture = (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
        if (fileType && isExcelType(fileType) && (event.target as HTMLDivElement)?.className === 'react-grid-HeaderCell-sortable') {
            event.stopPropagation()
        }
    }

    return {
        handleCsvClickCapture
    }
}
