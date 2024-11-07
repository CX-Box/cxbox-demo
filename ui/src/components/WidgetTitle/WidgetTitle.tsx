import React, { createElement, ReactNode } from 'react'
import { Icon } from 'antd'
import cn from 'classnames'
import { useAppDispatch } from '@store'
import { useWidgetCollapse } from '@hooks/useWidgetCollapse'
import TemplatedTitle from '@components/TemplatedTitle/TemplatedTitle'
import { setCollapsedWidgets } from '@actions'
import styles from './WidgetTitle.less'

interface WidgetTitleProps {
    id?: string
    level: 1 | 2
    className?: string
    widgetName: string
    text?: string
    bcColor?: string
    marginBottom?: number
    buttons?: ReactNode
}

const WidgetTitle: React.FC<WidgetTitleProps> = ({ widgetName, text, bcColor, buttons, level = 1, className, id, marginBottom = 12 }) => {
    const dispatch = useAppDispatch()
    const { viewName, widgetNameGroup, isMainWidget, isCollapsed } = useWidgetCollapse(widgetName)

    const handleCollapseClick = React.useCallback(() => {
        dispatch(setCollapsedWidgets({ viewName, widgetNameGroup }))
    }, [dispatch, viewName, widgetNameGroup])

    if (!isMainWidget && !text && !buttons) {
        return null
    }

    const element = `h${level}`
    const templatedTitle = <TemplatedTitle widgetName={widgetName} title={text ?? ''} id={id} />
    const title = isMainWidget ? (
        <div className={styles.collapse} onClick={handleCollapseClick}>
            <Icon className={styles.collapseIcon} type={isCollapsed ? 'right' : 'down'} />
            {templatedTitle}
        </div>
    ) : (
        templatedTitle
    )

    return createElement(
        element,
        {
            className: cn(styles.title, styles[element], className, { [styles.colorHeader]: bcColor }),
            style: { background: bcColor, marginBottom }
        },
        !!buttons ? (
            <div className={styles.titleWithButtons}>
                {title}
                {buttons}
            </div>
        ) : (
            title
        )
    )
}

export default WidgetTitle
