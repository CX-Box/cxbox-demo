import React from 'react'
import styles from './Title.less'
import { Tag } from 'antd'
import WidgetTitle from '@components/WidgetTitle/WidgetTitle'
import { DataValue } from '@cxbox-ui/schema'

export type TagType = {
    id: string
    _value: string
    _closable?: boolean
    options?: Record<string, any>
    [key: string]: DataValue | Record<string, any>
}

interface TitleProps {
    widgetName: string
    title?: string
    tags?: TagType[]
    onClose: (value: TagType) => void
}

function Title({ title, widgetName, tags, onClose }: TitleProps) {
    return tags?.length ? (
        <div>
            <div>
                <WidgetTitle className={styles.title} level={1} widgetName={widgetName} text={title} />
            </div>
            <div className={styles.tagArea}>
                {tags?.map(value => {
                    return (
                        <Tag
                            className={value.options?.primary && styles.primary}
                            title={value._value?.toString()}
                            closable={value._closable}
                            id={value.id?.toString()}
                            key={value.id?.toString()}
                            onClose={() => {
                                onClose(value)
                            }}
                        >
                            {value._value}
                        </Tag>
                    )
                })}
            </div>
        </div>
    ) : (
        <WidgetTitle className={styles.title} level={1} widgetName={widgetName} text={title} />
    )
}

export default React.memo(Title)
