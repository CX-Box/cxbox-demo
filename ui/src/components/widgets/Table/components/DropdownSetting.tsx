import React from 'react'
import { Dropdown, Icon } from 'antd'
import Button from '../../../ui/Button/Button'
import { DropDownProps } from 'antd/lib/dropdown'

interface DropdownSettingProps extends Omit<DropDownProps, 'trigger'> {
    buttonClassName?: string
    buttonIcon?: string
}

function DropdownSetting({ buttonClassName, buttonIcon, ...restProps }: DropdownSettingProps) {
    return (
        <Dropdown {...restProps} trigger={['click']}>
            <Button type="empty" className={buttonClassName}>
                <Icon type={buttonIcon ?? 'setting'} />
            </Button>
        </Dropdown>
    )
}

export default React.memo(DropdownSetting)
