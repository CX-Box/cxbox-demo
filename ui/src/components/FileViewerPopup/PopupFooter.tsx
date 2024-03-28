import React, { PropsWithChildren } from 'react'
import styles from './FileViewerPopup.less'

interface PopupFooterProps {}

function PopupFooter({ children }: PropsWithChildren<PopupFooterProps>) {
    return <div className={styles.footer}>{children}</div>
}

export default PopupFooter
