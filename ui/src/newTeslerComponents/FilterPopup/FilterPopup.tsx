/**
 * Opens when column filter requested
 */
import React, { FormEvent } from 'react'
import { Button, Form } from 'antd'
import styles from './FilterPopup.less'
import { useTranslation } from 'react-i18next'

export interface FilterPopupProps {
    hideFilter?: boolean
    children: React.ReactNode
    onApply?: () => void
    onCancel?: () => void
}

export const FilterPopup = ({ hideFilter = false, children, onCancel, onApply }: FilterPopupProps) => {
    const { t } = useTranslation()

    if (hideFilter) {
        return null
    }

    const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault()

        onApply?.()
    }

    const handleClear = (e: React.MouseEvent<HTMLElement, MouseEvent>) => {
        e.preventDefault()

        onCancel?.()
    }

    return (
        <Form onSubmit={handleSubmit} layout="vertical">
            {children}
            <div className={styles.operators}>
                <Button className={styles.button} htmlType="submit">
                    {t('Apply')}
                </Button>
                <Button className={styles.button} onClick={handleClear}>
                    {t('Clear')}
                </Button>
            </div>
        </Form>
    )
}

export default React.memo(FilterPopup)
