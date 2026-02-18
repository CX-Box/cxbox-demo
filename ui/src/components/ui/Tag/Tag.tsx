import React from 'react'
import { Tag as AntdTag } from 'antd'
import cn from 'classnames'
import { TagProps as AntdTagProps } from 'antd/lib/tag'
import styles from './Tag.module.less'

const TAG_CUSTOM_COLORS = {
    primary: '#1890ff'
}

type CustomColorsType = keyof typeof TAG_CUSTOM_COLORS

interface TagProps extends AntdTagProps {
    color?: AntdTagProps['color'] | CustomColorsType
    nowrap?: boolean
}

const Tag: React.FC<TagProps> = ({ className, color, nowrap, ...restProps }) => {
    return (
        <AntdTag
            className={cn(styles.tag, className, { [styles.nowrap]: nowrap, [styles.disabled]: !restProps.closable })}
            color={TAG_CUSTOM_COLORS[color as CustomColorsType] ?? color}
            {...restProps}
        />
    )
}

export default Tag
