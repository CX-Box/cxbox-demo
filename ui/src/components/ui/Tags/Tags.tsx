import React from 'react'
import styles from './Tags.less'
import { Tooltip } from 'antd'
import Button from '@components/ui/Button/Button'
import { useTranslation } from 'react-i18next'
import { filterByConditions } from '@utils/filterByConditions'
import Tag from '@components/ui/Tag/Tag'

export type TagType = {
    id: string
    title: string
}

export interface TagsProps {
    tags?: TagType[]
    onClose: (value: TagType) => void
    onAllClose?: () => void
    children?: React.ReactNode
    maxTagsCount?: number
    maxTagsHint?: string
}

const Tags: React.FC<TagsProps> = ({ tags, onClose, onAllClose, children, maxTagsCount = Infinity, maxTagsHint = '' }) => {
    const { t } = useTranslation()
    const [visibleTags, restHiddenTags] = tags ? filterByConditions(tags, [(tag, index) => index < maxTagsCount]) : [undefined, undefined]

    return visibleTags?.length || children ? (
        <div className={styles.tagsWrapper}>
            {visibleTags?.length ? (
                <>
                    <div className={styles.tagArea}>
                        {visibleTags?.map(value => {
                            return (
                                <Tag
                                    title={value.title}
                                    closable={true}
                                    id={value.id?.toString()}
                                    key={value.id?.toString()}
                                    onClose={() => {
                                        onClose(value)
                                    }}
                                >
                                    {value.title}
                                </Tag>
                            )
                        })}
                        {restHiddenTags?.length ? (
                            <Tooltip trigger="hover" title={maxTagsHint}>
                                <Tag closable={false} key={'hiddenTags'}>
                                    {t('+ values', { count: restHiddenTags.length })}
                                </Tag>
                            </Tooltip>
                        ) : null}
                    </div>
                    {onAllClose && (
                        <Button type="empty" className={styles.clear} onClick={onAllClose}>
                            {t('Clear')}
                        </Button>
                    )}
                </>
            ) : null}
            {children}
        </div>
    ) : null
}

export default React.memo(Tags)
