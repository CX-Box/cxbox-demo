import React from 'react'
import styles from './StandardWrapper.module.css'
import { Row } from 'antd'

interface StandardWrapperProps {}

export const StandardWrapper: React.FC<StandardWrapperProps> = props => {
    return <Row className={styles.widgetContainer} {...props} />
}
