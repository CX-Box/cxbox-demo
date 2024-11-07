import React, { createElement, ReactNode } from 'react'
import { Icon } from 'antd'
import cn from 'classnames'
import { useAppDispatch, useAppSelector } from '@store'
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
    // todo вынести в хук мб
    const isCollapseEnabled = useAppSelector(state => state.view.groups?.find(item => item.widgetNames[0] === widgetName))
    const isCollapsed = useAppSelector(state => state.view.collapsedWidgets?.find(item => item === widgetName))
    //

    const handleCollapseClick = React.useCallback(() => {
        dispatch(setCollapsedWidgets({ mainWidgetName: widgetName }))
    }, [dispatch, widgetName])

    const element = `h${level}`
    const templatedTitle = <TemplatedTitle widgetName={widgetName} title={text ?? ''} id={id} />
    const title = isCollapseEnabled ? (
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
