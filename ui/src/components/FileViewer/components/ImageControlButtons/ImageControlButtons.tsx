import React from 'react'
import Button from '@components/ui/Button/Button'
import { Divider } from 'antd'
import { ImageControl } from '@hooks/image'
import styles from './ImageControlButtons.less'

interface ImageControlButtonsProps {
    imageControl: ImageControl | undefined
    fullScreen?: boolean
    onChangeFullScreen?: (value: boolean) => void
}

const ImageControlButtons: React.FC<ImageControlButtonsProps> = ({ imageControl, fullScreen = false, onChangeFullScreen }) => {
    return (
        <div
            className={styles.root}
            onClick={event => {
                event.stopPropagation()
            }}
        >
            <Button type="default" onClick={imageControl?.rotateCounterClockwise} icon="undo" />
            <Button type="default" onClick={imageControl?.rotateClockwise} icon="redo" />

            <Divider type="vertical" />

            <Button type="default" onClick={imageControl?.increaseScale} icon="zoom-in" />
            <Button type="default" onClick={imageControl?.decreaseScale} icon="zoom-out" />

            <Divider type="vertical" />

            <Button type="default" onClick={imageControl?.rollbackChanges} icon="rollback" />

            {onChangeFullScreen && (
                <>
                    <Divider type="vertical" />

                    <Button
                        type="default"
                        onClick={() => onChangeFullScreen(!fullScreen)}
                        icon={fullScreen ? 'fullscreen-exit' : 'fullscreen'}
                    />
                </>
            )}
        </div>
    )
}

export default React.memo(ImageControlButtons)
