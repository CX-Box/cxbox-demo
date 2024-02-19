import React from 'react'
import { useTranslation } from 'react-i18next'
import styles from './PopupFooter.less'
import { Button } from 'antd'

export interface PopupFooterProps {
    onAccept?: () => void
    onCancel?: () => void
}

/**
 *
 * @param props
 * @category Components
 */
export const PopupFooter: React.FC<PopupFooterProps> = props => {
    const { t } = useTranslation()

    return (
        <div className={styles.actions}>
            <Button onClick={props.onAccept} className={styles.buttonYellow}>
                {t('Save')}
            </Button>
            <Button onClick={props.onCancel} className={styles.buttonCancel}>
                {t('Cancel')}
            </Button>
        </div>
    )
}

/**
 * @category Components
 */
const MemoizedPopupFooter = React.memo(PopupFooter)

export default MemoizedPopupFooter
