import React from 'react'
import { Tag, Icon } from 'antd'
import styles from './MultivalueTag.less'
import cn from 'classnames'
import { MultivalueSingleValue } from '@cxbox-ui/core/interfaces/data'
import { MultivalueFieldMeta } from '@cxbox-ui/core/interfaces/widget'

export interface MultivalueTagProps {
    disabled: boolean
    placeholder?: string
    value: MultivalueSingleValue[]
    widgetFieldMeta: MultivalueFieldMeta
    /**
     * @deprecated TODO: Remove in 2.0.0 in favor of `widgetName`
     */
    bcName: string
    widgetName?: string
    loading?: boolean
    page: number
    metaError: string
    onPopupOpen: (bcName: string, widgetFieldMeta: MultivalueFieldMeta, page: number, widgetName?: string) => void
    onChange: (newValue: MultivalueSingleValue[], removedValue: MultivalueSingleValue) => void
}

/**
 *
 * @param props
 * @category Components
 */
const MultivalueTag: React.FunctionComponent<MultivalueTagProps> = ({
    loading,
    disabled,
    onPopupOpen,
    bcName,
    widgetName,
    page,
    widgetFieldMeta,
    metaError,
    value,
    placeholder,
    onChange
}) => {
    const handleOpen = React.useCallback(() => {
        if (!disabled) {
            onPopupOpen(bcName, widgetFieldMeta, page, widgetName)
        }
    }, [disabled, onPopupOpen, bcName, page, widgetFieldMeta, widgetName])

    const handleDeleteTag = React.useCallback(
        (recordId: string) => {
            if (!disabled) {
                onChange(
                    value.filter(item => item.id !== recordId),
                    value.find(item => item.id === recordId) as MultivalueSingleValue
                )
            }
        },
        [onChange, value, disabled]
    )

    return (
        <div
            className={cn(styles.multivalue, { [styles.disabled]: disabled, [styles.error]: metaError })}
            onClick={loading && disabled ? undefined : handleOpen}
        >
            <div data-text={placeholder} className={cn(styles.enabled, { [styles.disabled]: disabled })}>
                {(value || []).map(val => {
                    return (
                        <Tag
                            className={(val.options as Record<string, any>).primary && styles.primary}
                            onClick={e => {
                                e.stopPropagation()
                            }}
                            title={val.value}
                            closable={!disabled && !loading}
                            id={val.id}
                            key={val.id}
                            onClose={() => {
                                handleDeleteTag(val.id)
                            }}
                        >
                            {val.value}
                        </Tag>
                    )
                })}
            </div>
            <div className={cn(styles.iconContainer, { [styles.disabled]: disabled })}>
                <Icon type={loading ? 'loading' : 'folder-open'} spin={loading} />
            </div>
        </div>
    )
}

export default React.memo(MultivalueTag)
