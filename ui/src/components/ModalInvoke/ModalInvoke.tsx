import React from 'react'
import { ModalInvoke as CxboxModalInvoke } from '@cxboxComponents'
import styles from './ModalInvoke.less'

function ModalInvoke() {
    return <CxboxModalInvoke className={styles.overwrite} />
}

export default React.memo(ModalInvoke)
