import 'react-pdf/dist/Page/AnnotationLayer.css'
import 'react-pdf/dist/Page/TextLayer.css'
import { pdfjs } from 'react-pdf'
// @ts-ignore
import worker from 'pdfjs-dist/webpack'

pdfjs.GlobalWorkerOptions.workerSrc = worker

export { default as PdfViewer } from './components/PdfViewerContainer'
