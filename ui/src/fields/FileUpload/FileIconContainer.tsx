import React from 'react'
import { Tooltip } from 'antd'
import { getExtension, isAvailableFileViewing } from '@utils/fileViewer'
import FileIcon from '@components/FileViewer/FileIcon/FileIcon'
import { useTranslation } from 'react-i18next'

interface FileIconContainerProps {
    fileName: string
    onFileIconClick?: () => void
}

function FileIconContainer({ fileName, onFileIconClick }: FileIconContainerProps) {
    const { t } = useTranslation()

    return onFileIconClick && fileName?.length > 0 ? (
        <Tooltip title={isAvailableFileViewing(fileName) ? undefined : t('No preview')} placement="bottomRight">
            <span>
                <FileIcon type={getExtension(fileName)} eye={isAvailableFileViewing(fileName)} onClick={onFileIconClick} />
            </span>
        </Tooltip>
    ) : null
}

export default FileIconContainer
