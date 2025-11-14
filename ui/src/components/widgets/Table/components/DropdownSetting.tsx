import React from 'react'
import { Dropdown, Icon } from 'antd'
import Button from '../../../ui/Button/Button'
import { DropDownProps } from 'antd/lib/dropdown'
import styles from './DropdownSettings.module.less'

interface DropdownSettingProps extends Omit<DropDownProps, 'trigger'> {
    buttonClassName?: string
    buttonIcon?: string
    error?: boolean
}

function DropdownSetting({ buttonClassName, buttonIcon, error, ...restProps }: DropdownSettingProps) {
    return (
        <Dropdown {...restProps} trigger={['click']}>
            <Button type="empty" className={buttonClassName}>
                <Icon type={buttonIcon ?? 'setting'} />
                {error ? <Icon type={'exclamation-circle'} className={styles.errorIcon} /> : null}
            </Button>
        </Dropdown>
    )
}

export default React.memo(DropdownSetting)
