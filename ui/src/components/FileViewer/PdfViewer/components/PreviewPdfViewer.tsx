import React from 'react'
import { Document, Page, pdfjs } from 'react-pdf'
import DocumentErrorBoundary from '@components/FileViewer/PdfViewer/components/DocumentErrorBoundary'
import { Spin } from 'antd'
import 'react-pdf/dist/Page/AnnotationLayer.css'
import 'react-pdf/dist/Page/TextLayer.css'
import styles from '@components/FileViewer/PdfViewer/components/InlinePdfViewer.less'

pdfjs.GlobalWorkerOptions.workerSrc = new URL('pdfjs-dist/build/pdf.worker.min.js', import.meta.url).toString()

interface PreviewPdfViewerProps {
    size?: number
    onClick?: () => void
    url: string | undefined
    spinning?: boolean
}

const PreviewPdfViewer: React.FC<PreviewPdfViewerProps> = ({ onClick, size, url, spinning }) => {
    return (
        <Spin className={styles.root} spinning={spinning}>
            <span
                style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    justifyContent: 'center',
                    height: size,
                    width: size,
                    overflow: 'hidden'
                }}
                onClick={onClick}
            >
                <DocumentErrorBoundary>
                    <Document file={url}>
                        <Page height={size} pageNumber={1} />
                    </Document>
                </DocumentErrorBoundary>
            </span>
        </Spin>
    )
}

export default React.memo(PreviewPdfViewer)
