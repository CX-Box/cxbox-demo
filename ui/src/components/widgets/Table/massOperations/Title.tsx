import React, { createElement } from 'react'
import { InnerTemplatedTitle, InnerTemplatedTitleProps } from '@components/TemplatedTitle/InnerTemplatedTitle'
import styles from '@components/WidgetTitle/WidgetTitle.less'
import cn from 'classnames'

interface TitleProps extends InnerTemplatedTitleProps {
    level?: 1 | 2
    className?: string
    bcColor?: string
    marginBottom?: number
    style?: React.CSSProperties
}

const Title: React.FC<TitleProps> = ({ level, title, fields, dataItem, container, marginBottom = 12, bcColor, className, style }) => {
    const element = `h${level}`

    return createElement(
        element,
        {
            className: cn(styles.title, styles[element], className, { [styles.colorHeader]: bcColor }),
            style: { background: bcColor, marginBottom, ...style }
        },
        <InnerTemplatedTitle title={title} dataItem={dataItem} fields={fields} container={container} />
    )
}

export default React.memo(Title)
