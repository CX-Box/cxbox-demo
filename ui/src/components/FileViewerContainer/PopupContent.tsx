import React, { PropsWithChildren } from 'react'
import styles from './PopupContent.less'

interface PopupContentProps {}

function PopupContent({ children }: PropsWithChildren<PopupContentProps>) {
    return <div className={styles.content}>{children}</div>
}

export default PopupContent
