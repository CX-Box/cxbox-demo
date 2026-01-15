import React, { FunctionComponent, useMemo, useRef } from 'react'
import { Modal } from 'antd'
import { useTranslation } from 'react-i18next'
import cn from 'classnames'
import Button from '@components/ui/Button/Button'
import Pagination from '@components/ui/Pagination/Pagination'
import { useAppSelector } from '@store'
import usePopupWidth from './hooks/usePopupWidth'
import { interfaces } from '@cxbox-ui/core'
import { ModalProps } from 'antd/lib/modal'
import styles from './Popup.less'

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
        okButtonProps,
        ...rest
    } = props
    const containerRef = useRef<HTMLDivElement>(null)

    const computedTitle = typeof title !== 'string' ? title : <h1 className={styles.title}>{title}</h1>

    const widgetMeta = useAppSelector(state => {
        return state.view.widgets.find(widget => widget.name === widgetName)
    })
    const { t } = useTranslation()

    const computedWidth = usePopupWidth(containerRef, width, size)

    const defaultFooter = useMemo(
        () => (
            <div className={styles.footerContainer}>
                {!disablePagination && widgetMeta && (
                    <div className={styles.pagination}>
                        <Pagination meta={widgetMeta as interfaces.WidgetTableMeta} />
                    </div>
                )}

                <div className={styles.actions}>
                    <Button onClick={onOkHandler} loading={okButtonProps?.loading}>
                        {defaultOkText ?? t('Save')}
                    </Button>

                    <Button onClick={onCancelHandler} type="formOperation">
                        {defaultCancelText ?? t('Cancel')}
                    </Button>
                </div>
            </div>
        ),
        [disablePagination, widgetMeta, onOkHandler, okButtonProps?.loading, defaultOkText, t, onCancelHandler, defaultCancelText]
    )

    return (
        <div ref={containerRef}>
            <Modal
                title={computedTitle}
                className={cn(styles.popupModal, className)}
                visible={showed}
                getContainer={false}
                width={computedWidth}
                onCancel={onCancelHandler}
                footer={footer === null ? null : footer || defaultFooter}
                okButtonProps={okButtonProps}
                {...rest}
            >
                {children}
            </Modal>
        </div>
    )
}

export default React.memo(Popup)
