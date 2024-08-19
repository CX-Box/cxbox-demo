import { Dragger } from './Dragger'
import { Upload as InternalUpload, UploadProps } from './Upload'
import { PropsWithChildren, ReactElement } from 'react'

type InternalUploadType = typeof InternalUpload

type CompoundedComponent = InternalUploadType & {
    (props: PropsWithChildren<UploadProps>): ReactElement
    Dragger: typeof Dragger
}

const Upload = InternalUpload as CompoundedComponent
Upload.Dragger = Dragger

export default Upload
