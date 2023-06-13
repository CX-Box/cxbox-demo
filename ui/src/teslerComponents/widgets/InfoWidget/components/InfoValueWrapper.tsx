import cn from 'classnames'
import React, { ReactNode } from 'react'
import styles from './InfoValueWrapper.less'
import { Col } from 'antd'
import { LayoutCol, LayoutRow } from '@cxbox-ui/core'

interface ValueWrapperProps {
    row: LayoutRow
    col: LayoutCol
    children?: ReactNode
}
export const InfoValueWrapper: React.FunctionComponent<ValueWrapperProps> = props => {
    return (
        <Col span={props.col.span}>
            <div className={cn(styles.fieldArea, { [styles.columnDirection]: props.row.cols.length > 1 })}>{props.children}</div>
        </Col>
    )
}

InfoValueWrapper.displayName = 'InfoValueWrapper'

export default React.memo(InfoValueWrapper)
