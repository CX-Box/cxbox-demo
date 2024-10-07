import cn from 'classnames'
import React, { ReactNode } from 'react'
import styles from './InfoValueWrapper.module.css'
import { Col } from 'antd'
import { interfaces } from '@cxbox-ui/core'
import { ETitleMode } from '@interfaces/widget'

interface ValueWrapperProps {
    row: interfaces.LayoutRow
    titleMode?: ETitleMode
    colSpan?: number
    children?: ReactNode
}
function InfoValueWrapper({ row, titleMode, colSpan, children }: ValueWrapperProps) {
    const isMultipleColumns = row.cols.length > 1

    return (
        <Col span={colSpan}>
            <div
                className={cn(styles.fieldArea, {
                    [styles.columnDirectionDefault]: isMultipleColumns && titleMode !== ETitleMode.left,
                    [styles.columnDirection]: titleMode === ETitleMode.top,
                    [styles.rowDirection]: titleMode === ETitleMode.left
                })}
            >
                {children}
            </div>
        </Col>
    )
}

export default React.memo(InfoValueWrapper)
