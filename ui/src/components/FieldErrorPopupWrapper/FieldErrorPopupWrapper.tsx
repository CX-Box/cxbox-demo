import React, { ReactNode } from 'react'
import { Form, Tooltip } from 'antd'
import { useAppSelector } from '@store'
import { buildBcUrl } from '@utils/buildBcUrl'
import { interfaces } from '@cxbox-ui/core'
import { useTranslation } from 'react-i18next'
import { TooltipPlacement } from 'antd/es/tooltip'
import styles from './FieldErrorPopupWrapper.less'
import cn from 'classnames'
import { selectBcRowMeta } from '@selectors/selectors'

interface FieldErrorPopupWrapperProps {
    bcName: string
    fieldKey: string
    cursor: string | null
    children: ReactNode
    placement?: TooltipPlacement
    className?: string
    readOnly?: boolean
}

function FieldErrorPopupWrapper({ className, bcName, fieldKey, cursor, children, placement, readOnly }: FieldErrorPopupWrapperProps) {
    const metaError = useAppSelector(state => {
        const bcUrl = buildBcUrl(bcName, true, state)
        const rowMeta = selectBcRowMeta(state, bcName)?.[bcUrl]
        const missing =
            state.view.pendingValidationFailsFormat === interfaces.PendingValidationFailsFormat.target
                ? (state.view.pendingValidationFails as interfaces.PendingValidationFails)?.[bcName]?.[cursor as string]?.[fieldKey]
                : (state.view.pendingValidationFails?.[fieldKey] as string)

        return (missing as string) || (rowMeta?.errors?.[fieldKey] as string)
    })

    const { t } = useTranslation()

    let content = children

    if (!readOnly) {
        content = (
            <Form.Item className={styles.formItem} validateStatus="error">
                {children}
            </Form.Item>
        )
    }

    return (
        <Tooltip
            placement={placement}
            overlayClassName={styles.error}
            title={metaError?.length ? t(metaError) : null}
            getPopupContainer={trigger => trigger.parentElement as HTMLElement}
        >
            <div className={cn(className, { [styles.fullWidth]: !readOnly })}>{content}</div>
        </Tooltip>
    )
}

export default React.memo(FieldErrorPopupWrapper)
