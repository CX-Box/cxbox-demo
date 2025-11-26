import React from 'react'
import cn from 'classnames'
import Tag from '@components/ui/Tag/Tag'
import { interfaces } from '@cxbox-ui/core'
import styles from './MultivalueTag.less'

export interface MultivalueTagProps {
    disabled: boolean
    placeholder?: string
    value: interfaces.MultivalueSingleValue[]
    widgetFieldMeta: interfaces.MultivalueFieldMeta
    /**
     * @deprecated TODO: Remove in 2.0.0 in favor of `widgetName`
     */
    bcName: string
    widgetName?: string
    loading?: boolean
    page: number
    metaError: string
    onPopupOpen: (bcName: string, widgetFieldMeta: interfaces.MultivalueFieldMeta, page: number, widgetName?: string) => void
    onChange: (newValue: interfaces.MultivalueSingleValue[], removedValue: interfaces.MultivalueSingleValue) => void
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
                    value.find(item => item.id === recordId) as interfaces.MultivalueSingleValue
                )
            }
        },
        [onChange, value, disabled]
    )

    return (
        <div
            className={cn(styles.multivalue, { [styles.disabled]: disabled, [styles.error]: metaError })}
            tabIndex={0}
            onClick={loading && disabled ? undefined : handleOpen}
        >
            <div data-text={placeholder} className={cn(styles.enabled, { [styles.disabled]: disabled })}>
                {(value || []).map(val => {
                    const primary = (val.options as Record<string, any>).primary
                    return (
                        <Tag
                            color={primary ? 'primary' : undefined}
                            onClick={e => {
                                e.stopPropagation()
                            }}
                            nowrap={true}
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
                <div className={styles.icon} data-test-field-multivalue-icon={true} />
            </div>
        </div>
    )
}

export default React.memo(MultivalueTag)
