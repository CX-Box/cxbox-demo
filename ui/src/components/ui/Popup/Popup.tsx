import React, { PropsWithChildren } from 'react'
import { Modal } from 'antd'
import styles from './Popup.module.less'
import { ModalProps } from 'antd/lib/modal'
import cn from 'classnames'

export interface PopupProps extends PropsWithChildren<ModalProps> {}

function Popup({ className, ...props }: PopupProps) {
    return <Modal {...props} className={cn(styles.root, className)} />
}

export default React.memo(Popup)
