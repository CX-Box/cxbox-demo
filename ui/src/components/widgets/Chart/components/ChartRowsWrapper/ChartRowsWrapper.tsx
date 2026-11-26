import React, { CSSProperties, ReactNode, useEffect } from 'react'
import cn from 'classnames'
import { ChartRowsConfig } from '@interfaces/widget'
import styles from './ChartRowsWrapper.less'

interface ChartRowsWrapperProps extends ChartRowsConfig {
    widgetName: string
    children: ReactNode
    /** RingProgress: the ring fills a square no wider than the column. */
    square?: boolean
}

/** Only positive, whole Form rows define a chart height. */
export const hasChartRowsLimit = (maxRows: number | undefined): maxRows is number =>
    typeof maxRows === 'number' && Number.isInteger(maxRows) && maxRows > 0

/**
 * Sets the chart height in rows of the standard Form, so that the chart stands level with a form next to it.
 * A chart has no height of its own content, unlike a text: it takes the height it is given.
 */
function ChartRowsWrapper({ widgetName, children, maxRows, square = false }: ChartRowsWrapperProps) {
    useEffect(() => {
        if (maxRows !== undefined && !hasChartRowsLimit(maxRows)) {
            console.info(`${widgetName} widget: 'maxRows' must be a positive whole number; it is ignored`)
        }
    }, [maxRows, widgetName])

    if (!hasChartRowsLimit(maxRows)) {
        return <>{children}</>
    }

    const style = {
        '--chart-max-rows': maxRows
    } as CSSProperties

    return (
        <div className={cn(styles.container, { [styles.square]: square })} style={style}>
            {children}
        </div>
    )
}

export default ChartRowsWrapper
