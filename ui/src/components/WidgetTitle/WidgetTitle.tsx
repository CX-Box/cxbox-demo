import React, { createElement, ReactNode } from 'react'
import cn from 'classnames'
import styles from './WidgetTitle.less'
import TemplatedTitle from '@components/TemplatedTitle/TemplatedTitle'

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
    const element = `h${level}`
    const title = <TemplatedTitle widgetName={widgetName} title={text ?? ''} id={id} />
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
