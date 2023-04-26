import cn from 'classnames'
import React, { ReactNode } from 'react'
import styles from './InfoValueWrapper.module.css'
import { Col } from 'antd'
import { LayoutRow } from '@cxbox-ui/core/interfaces/widget'

interface ValueWrapperProps {
    row: LayoutRow
    colSpan?: number
    children?: ReactNode
}
function InfoValueWrapper({ row, colSpan, children }: ValueWrapperProps) {
    return (
        <Col span={colSpan}>
            <div className={cn(styles.fieldArea, { [styles.columnDirection]: row.cols.length > 1 })}>{children}</div>
        </Col>
    )
}

export default React.memo(InfoValueWrapper)
