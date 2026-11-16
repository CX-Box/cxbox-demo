import React, { CSSProperties, ReactNode } from 'react'
import cn from 'classnames'
import { ChartContainerOptions } from '@interfaces/widget'
import styles from './ChartContainer.less'

interface ChartContainerProps extends ChartContainerOptions {
    children: ReactNode
    defaultHeight?: number
    square?: boolean
}

/** Only positive, whole Form rows define a chart height limit. */
export const hasChartRowsLimit = (maxRows: number | undefined): maxRows is number =>
    typeof maxRows === 'number' && Number.isInteger(maxRows) && maxRows > 0

/** Limits the drawing container using the same row dimensions as the Form widget. */
function ChartContainer({ children, maxRows, defaultHeight = 400, square = false }: ChartContainerProps) {
    if (!hasChartRowsLimit(maxRows)) {
        return <>{children}</>
    }

    const style = {
        '--chart-max-rows': maxRows,
        '--chart-default-height': `${defaultHeight}px`
    } as CSSProperties

    return (
        <div className={cn(styles.container, { [styles.square]: square })} style={style} data-chart-container>
            {children}
        </div>
    )
}

export default ChartContainer
