import React from 'react'
import { ModalInvoke as CxboxModalInvoke } from '@cxbox-ui/core'
import styles from './ModalInvoke.module.css'

interface ModalInvokeProps {}

function ModalInvoke({}: ModalInvokeProps) {
    return <CxboxModalInvoke className={styles.overwrite} />
}

export default React.memo(ModalInvoke)
