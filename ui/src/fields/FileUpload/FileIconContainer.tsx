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
    const isInteractive = !!onFileIconClick
    const isAvailableViewing = isAvailableFileViewing(fileName) && isInteractive
    const tooltipTitle = isAvailableViewing ? t('Preview') : t('No preview')

    return fileName?.length > 0 ? (
        <Tooltip title={isInteractive ? tooltipTitle : undefined} placement="bottomRight">
            <span>
                <FileIcon
                    type={getExtension(fileName)}
                    eye={isAvailableViewing}
                    onClick={isAvailableViewing ? onFileIconClick : undefined}
                    hoverEnabled={isInteractive}
                />
            </span>
        </Tooltip>
    ) : null
}

export default FileIconContainer
