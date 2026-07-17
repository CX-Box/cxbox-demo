import React, { FormEvent } from 'react'
import { Button, Form } from 'antd'
import { useTranslation } from 'react-i18next'
import styles from './FilterPopup.less'

export interface FilterFormProps {
    children: React.ReactNode
    filtersCounter: string | null
    onApply: (e: FormEvent<HTMLFormElement>) => void
    onCancel: (e: React.MouseEvent<HTMLElement, MouseEvent>) => void
}

const FilterForm: React.FC<FilterFormProps> = ({ children, filtersCounter, onApply, onCancel }) => {
    const { t } = useTranslation()

    return (
        <Form onSubmit={onApply} layout="vertical">
            {children}
            <div className={styles.operators}>
                <Button className={styles.button} data-test-filter-popup-apply={true} htmlType="submit">
                    {t('Apply')}
                    {filtersCounter}
                </Button>
                <Button className={styles.button} data-test-filter-popup-clear={true} onClick={onCancel}>
                    {t('Clear')}
                </Button>
            </div>
        </Form>
    )
}

export default React.memo(FilterForm)
