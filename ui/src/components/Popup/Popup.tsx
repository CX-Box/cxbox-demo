import React, { FunctionComponent } from 'react'
import { Modal } from 'antd'
import { useTranslation } from 'react-i18next'
import styles from './Popup.less'
import { ModalProps } from 'antd/lib/modal'
import cn from 'classnames'
import Pagination from '../ui/Pagination/Pagination'
import Button from '../ui/Button/Button'
import { interfaces } from '@cxbox-ui/core'
import { useAppSelector } from '@store'

export interface PopupProps extends ModalProps {
    onOkHandler?: () => void
    onCancelHandler?: () => void
    size?: 'medium' | 'large'
    children: any
    showed: boolean
    bcName: string
    widgetName?: string
    disablePagination?: boolean
    defaultOkText?: string
    defaultCancelText?: string
}

export const widths = {
    medium: '570px',
    large: '808px'
}

/**
 *
 * @param props
 * @category Components
 */
const Popup: FunctionComponent<PopupProps> = props => {
    const {
        onOkHandler,
        onCancelHandler,
        size,
        children,
        showed,
        bcName,
        widgetName,
        disablePagination,
        defaultOkText,
        defaultCancelText,
        className,
        width,
        title,
        footer,
        ...rest
    } = props
    const computedTitle = typeof title !== 'string' ? title : <h1 className={styles.title}>{title}</h1>
    const computedWidth = width || (size ? widths[size] : widths.medium)
    const widgetMeta = useAppSelector(state => {
        return state.view.widgets.find(widget => widget.name === widgetName)
    })
    const { t } = useTranslation()

    const defaultFooter = React.useMemo(
        () => (
            <div className={styles.footerContainer}>
                {!disablePagination && widgetMeta && (
                    <div className={styles.pagination}>
                        <Pagination meta={widgetMeta as interfaces.WidgetTableMeta} />
                    </div>
                )}
                <div className={styles.actions}>
                    <Button onClick={onOkHandler}>{defaultOkText ?? t('Save')}</Button>
                    <Button onClick={onCancelHandler} type="formOperation">
                        {defaultCancelText ?? t('Cancel')}
                    </Button>
                </div>
            </div>
        ),
        [disablePagination, widgetMeta, onOkHandler, defaultOkText, t, onCancelHandler, defaultCancelText]
    )

    return (
        <div>
            <Modal
                title={computedTitle}
                className={cn(styles.popupModal, className)}
                visible={showed}
                getContainer={false}
                width={computedWidth}
                onCancel={onCancelHandler}
                footer={footer === null ? null : footer || defaultFooter}
                {...rest}
            >
                {children}
            </Modal>
        </div>
    )
}

export default React.memo(Popup)
