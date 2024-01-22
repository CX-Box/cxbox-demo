import React from 'react'
import styles from './Title.less'
import { Tag } from 'antd'
import { usePassiveAssociations } from '../hooks/usePassiveAssociations'
import { useAppSelector } from '@store'

type TagType = { id: string; _value: string; _closable?: boolean; options?: Record<string, any> }

interface TitleProps {
    title?: string
}

function Title({ title }: TitleProps) {
    const assocValueKey = useAppSelector(state => state.view.popupData?.assocValueKey ?? '')

    const { values: selectedRecords, selectItem } = usePassiveAssociations()

    const tags = selectedRecords.map((item: any) => ({
        ...item,
        _value: String(item.value || ''),
        _closable: true
    })) as TagType[]

    return tags.length ? (
        <div>
            <div>
                <h1 className={styles.title}>{title}</h1>
            </div>
            <div className={styles.tagArea}>
                {assocValueKey &&
                    tags?.map(val => {
                        return (
                            <Tag
                                className={val.options?.primary && styles.primary}
                                title={val._value?.toString()}
                                closable={val._closable}
                                id={val.id?.toString()}
                                key={val.id?.toString()}
                                onClose={() => {
                                    selectItem(val, false)
                                }}
                            >
                                {val._value}
                            </Tag>
                        )
                    })}
            </div>
        </div>
    ) : (
        <>{title}</>
    )
}

export default React.memo(Title)
